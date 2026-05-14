import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ReportsDashboard from '@/components/ReportsDashboard';
import DateRangePicker from '@/components/DateRangePicker';
import Link from 'next/link';
import { Bot, Repeat, ArrowRight } from 'lucide-react';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // 1. Fetch Call Logs (Dynamic Date Range)
  let startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  startDate.setHours(0, 0, 0, 0);

  let endDate = new Date();
  endDate.setHours(23, 59, 59, 999);

  if (typeof searchParams.start === 'string') {
    startDate = new Date(searchParams.start);
    startDate.setHours(0, 0, 0, 0);
  }
  if (typeof searchParams.end === 'string') {
    endDate = new Date(searchParams.end);
    endDate.setHours(23, 59, 59, 999);
  }

  const isSuperAdmin = session.role === 'SUPER_ADMIN';

  const [logs, tenant] = await Promise.all([
    prisma.callLog.findMany({
      where: {
        ...(isSuperAdmin ? {} : { tenantId: session.tenantId }),
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { createdAt: 'asc' }
    }),
    !isSuperAdmin ? prisma.tenant.findUnique({
      where: { id: session.tenantId },
      select: { timezone: true }
    }) : Promise.resolve(null)
  ]);

  const tenantTimezone = tenant?.timezone || 'UTC';

  // 2. Aggregate Data
  const dailySpendMap = new Map();
  let totalBilled = 0;
  let totalDuration = 0;

  logs.forEach(log => {
    totalBilled += log.billedCost;
    totalDuration += log.duration;

    const dateKey = log.createdAt.toLocaleDateString('en-US', { timeZone: tenantTimezone });
    if (!dailySpendMap.has(dateKey)) {
      dailySpendMap.set(dateKey, { date: dateKey, cost: 0, calls: 0 });
    }
    const entry = dailySpendMap.get(dateKey);
    entry.cost += log.billedCost;
    entry.calls += 1;
  });

  const dailySpend = Array.from(dailySpendMap.values());
  const totalCalls = logs.length;
  const avgCostPerCall = totalCalls > 0 ? totalBilled / totalCalls : 0;

  // 3. Status Distribution
  const completedCalls = logs.filter(l => l.status === 'completed').length;
  const failedCalls = logs.filter(l => l.status !== 'completed').length;

  const statusData = [
    { name: 'Completed', value: completedCalls },
    { name: 'Failed/Missed', value: failedCalls }
  ].filter(d => d.value > 0);

  const chartData = {
    dailySpend,
    totalBilled,
    totalDuration,
    totalCalls,
    avgCostPerCall,
    statusData
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-slate-500 font-medium mt-1">Comprehensive view of your contact center's performance.</p>
        </div>
        <DateRangePicker />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/reports/agents" className="premium-card p-6 flex items-center justify-between group hover:border-slate-300 transition-colors cursor-pointer text-slate-900 hover:text-blue-600">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-xl text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Per-Agent Analytics</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Review performance and capabilities for each individual AI agent.</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link href="/reports/callers" className="premium-card p-6 flex items-center justify-between group hover:border-slate-300 transition-colors cursor-pointer text-slate-900 hover:text-blue-600">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-slate-100 rounded-xl text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Repeated Callers</h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Identify frequent callers, long interactions, and historical patterns.</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <ReportsDashboard data={chartData} />
    </div>
  );
}
