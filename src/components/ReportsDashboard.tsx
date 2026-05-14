'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

export default function ReportsDashboard({ data }: { data: any }) {
  // Slate/Premium monochromatic-ish colors for charts
  const BAR_COLOR = '#0f172a'; // slate-900
  const LINE_COLOR = '#475569'; // slate-600
  const PIE_COLORS = ['#0f172a', '#94a3b8', '#cbd5e1', '#f1f5f9']; // slate-900, slate-400, slate-300, slate-100

  return (
    <div className="space-y-8">

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="premium-card p-6 border-l-4 border-l-slate-900">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Spend</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">${data.totalBilled.toFixed(2)}</p>
        </div>
        <div className="premium-card p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Minutes</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{Math.round(data.totalDuration / 60)} <span className="text-lg text-slate-500 font-medium">min</span></p>
        </div>
        <div className="premium-card p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Avg Cost / Call</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">${data.avgCostPerCall.toFixed(2)}</p>
        </div>
        <div className="premium-card p-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Calls</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{data.totalCalls}</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Daily Spend Bar Chart */}
        <div className="premium-card p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Daily Spend (Last 30 Days)</h3>
          <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dailySpend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                      formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Cost']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '12px' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="cost" fill={BAR_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
          </div>
        </div>

        {/* Call Volume Line Chart */}
        <div className="premium-card p-6 h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Call Volume Trend</h3>
          <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dailySpend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '12px' }}
                     itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="calls" stroke={LINE_COLOR} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Total Calls" />
                </LineChart>
              </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="premium-card p-6 h-[400px] flex flex-col lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Call Status Distribution</h3>
            <div className="flex-1 min-h-0 flex items-center justify-center">
                {data.statusData && data.statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data.statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.statusData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="text-slate-400 font-medium">No data available for distribution.</div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
