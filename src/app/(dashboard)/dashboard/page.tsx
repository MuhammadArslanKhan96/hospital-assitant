import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CallsChart from "@/components/dashboard/CallsChart";
import DateRangePicker from "@/components/DateRangePicker";
import Link from "next/link";
import {
  Phone,
  CalendarCheck,
  Clock,
  DollarSign,
  Activity,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { cityMapping, extractAreaCode } from "@/lib/area-codes";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role === "SUPER_ADMIN") redirect("/admin");

  const tenantId = session.tenantId;

  // --- Logic & Fields (Exactly as original) ---
  let startDate: Date | undefined = undefined;
  let endDate: Date | undefined = undefined;

  if (typeof searchParams.start === "string" && searchParams.start) {
    startDate = new Date(searchParams.start);
    startDate.setHours(0, 0, 0, 0);
  }
  if (typeof searchParams.end === "string" && searchParams.end) {
    endDate = new Date(searchParams.end);
    endDate.setHours(23, 59, 59, 999);
  }

  const dateFilter =
    startDate || endDate
      ? {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        }
      : undefined;

  const callAggregates = await prisma.callLog.aggregate({
    where: { tenantId, ...(dateFilter ? { createdAt: dateFilter } : {}) },
    _count: { id: true },
    _sum: { duration: true, billedCost: true },
    _avg: { duration: true },
  });

  const failedCallCount = await prisma.callLog.count({
    where: {
      tenantId,
      status: { not: "completed" },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
  });

  const [appointmentCount, tenant] = await Promise.all([
    prisma.appointment.count({
      where: { tenantId, ...(dateFilter ? { createdAt: dateFilter } : {}) },
    }),
    prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { timezone: true },
    }),
  ]);

  const tenantTimezone = tenant?.timezone || "UTC";
  const callCount = callAggregates._count.id || 0;
  const totalMinutes = Math.round((callAggregates._sum.duration || 0) / 60);
  const avgSeconds = Math.round(callAggregates._avg.duration || 0);
  const avgDurationFormatted = `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s`;
  const totalSpend = callAggregates._sum.billedCost || 0;
  const conversionRate =
    callCount > 0 ? ((appointmentCount / callCount) * 100).toFixed(1) : "0.0";
  const avgCostPerCall =
    callCount > 0 ? (totalSpend / callCount).toFixed(2) : "0.00";

  // --- Fetch Recent Data ---
  const extremes = await prisma.callLog.findMany({
    where: { tenantId, ...(dateFilter ? { createdAt: dateFilter } : {}) },
    orderBy: [{ duration: "desc" }],
    take: 1,
  });
  const longestCall = extremes[0] || null;
  const shortestCall = await prisma.callLog.findFirst({
    where: {
      tenantId,
      status: "completed",
      duration: { gt: 0 },
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    },
    orderBy: { duration: "asc" },
  });

  const recentCalls = await prisma.callLog.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const upcomingAppointments = await prisma.appointment.findMany({
    where: { tenantId, startTime: { gte: new Date() } },
    orderBy: { startTime: "asc" },
    take: 4,
  });

  // --- Chart Data ---
  let chartStartDate =
    startDate || new Date(new Date().setDate(new Date().getDate() - 6));
  let chartEndDate = endDate || new Date();
  const rawDailyCalls = await prisma.callLog.groupBy({
    by: ["createdAt"],
    where: { tenantId, createdAt: { gte: chartStartDate, lte: chartEndDate } },
    _count: { id: true },
  });
  const dailyCounts: Record<string, number> = {};
  rawDailyCalls.forEach((call) => {
    const dateStr = new Date(call.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: tenantTimezone,
    });
    dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + call._count.id;
  });
  const chartData = Object.entries(dailyCounts).map(([date, count]) => ({
    date,
    count,
  }));

  return (
    <div className="max-w-[1200px] mx-auto space-y-8">
      {/* Header: Original structure, refined look */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-500">
            Real-time performance and usage metrics.
          </p>
        </div>
        <DateRangePicker />
      </div>

      {/* KPI Grid: Clean, Bordered Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Calls", val: callCount, icon: Phone },
          { label: "Minutes Used", val: totalMinutes, icon: Activity },
          {
            label: "Accrued Cost",
            val: `$${totalSpend.toFixed(2)}`,
            icon: DollarSign,
          },
          { label: "Appointments", val: appointmentCount, icon: CalendarCheck },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-xl font-bold text-slate-900">{item.val}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
        {[
          { label: "Conversion", val: `${conversionRate}%` },
          { label: "Avg Cost", val: `$${avgCostPerCall}` },
          { label: "Avg Duration", val: avgDurationFormatted },
          {
            label: "Failed Calls",
            val: failedCallCount,
            color: failedCallCount > 0 ? "text-red-500" : "",
          },
        ].map((m, i) => (
          <div
            key={i}
            className="text-center py-4 border-r last:border-r-0 border-slate-100"
          >
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              {m.label}
            </p>
            <p className={`text-lg font-bold text-slate-900 ${m.color || ""}`}>
              {m.val}
            </p>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart: Clean White Box */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-6">
            Call Volume Trends
          </h3>
          <div className="h-[300px]">
            <CallsChart data={chartData} />
          </div>
        </div>

        {/* Sidebar: Upcoming Appointments */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Upcoming</h3>
            <Link
              href="/dashboard/appointments"
              className="text-xs font-semibold text-vc-green hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm font-bold text-slate-800">
                    {apt.customerName}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-slate-500 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>
                      {new Date(apt.startTime).toLocaleDateString()} at{" "}
                      {new Date(apt.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-400 text-xs">
                No upcoming events.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table: High Precision & Clean */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">
            Recent Intelligence Logs
          </h3>
          <Link
            href="/dashboard/calls"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            Full History →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/30">
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">
                  Interaction Time
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">
                  Duration
                </th>
                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase">
                  Recording
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentCalls.map((call) => (
                <tr
                  key={call.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-md border ${call.status === "completed" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"}`}
                    >
                      {call.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(call.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {new Date(call.createdAt).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">
                    {Math.floor(call.duration / 60)}m {call.duration % 60}s
                  </td>
                  <td className="px-6 py-4">
                    {call.recordingUrl ? (
                      <a
                        href={call.recordingUrl}
                        target="_blank"
                        className="text-vc-green hover:text-green-700 flex items-center gap-1.5 text-xs font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Listen
                      </a>
                    ) : (
                      <span className="text-slate-300 text-xs">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
