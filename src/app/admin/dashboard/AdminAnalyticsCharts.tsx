"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts"

type ChartData = {
  month: string
  earnings: number
  rejected: number
  completed: number
  awaiting: number
  clients: number
}

type SummaryStats = {
  awaiting: number;
  completed: number;
  rejected: number;
  revenue: number;
}

export default function AdminAnalyticsCharts({ data, summaryStats }: { data: ChartData[], summaryStats?: SummaryStats }) {
  
  // Premium Glassmorphic Tooltip
  const PremiumTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const chartData = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md dark:bg-[#1A1C23]/95 border border-[#E2E8F0] dark:border-white/10 p-5 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] min-w-[200px] z-50">
          <p className="font-medium text-[#64748B] dark:text-[#94A3B8] mb-4 text-[12px] tracking-wider uppercase">{label}</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                <span className="text-[14px] font-normal text-[#475569] dark:text-[#CBD5E1]">Revenue</span>
              </div>
              <span className="text-[15px] font-medium text-[#0F172A] dark:text-white">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(chartData.completed)}
              </span>
            </div>
            
            {/* Optional Context: Awaiting Payment */}
            {chartData.awaiting > 0 && (
              <div className="flex items-center justify-between gap-6 pt-3 border-t border-[#F1F5F9] dark:border-white/5 mt-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
                  <span className="text-[13px] font-normal text-[#64748B] dark:text-[#94A3B8]">Awaiting</span>
                </div>
                <span className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8]">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(chartData.awaiting)}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const formatCurrencyValue = (value: number) => {
    if (value === 0) return '0';
    return `${value >= 1000 ? (value / 1000).toFixed(0) + 'K' : value}`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      {/* Premium Earnings Area Chart */}
      <Card className="bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-w-0">
        <CardHeader className="pb-0 px-6 pt-6 sm:px-8 sm:pt-8 border-b-0">
          <CardTitle className="text-lg font-sans font-semibold text-[#0F172A] dark:text-white tracking-tight">Earnings Over Time</CardTitle>
          <CardDescription className="text-sm text-[#64748B] dark:text-[#94A3B8] font-normal mt-1 mb-2">Monthly revenue growth and outstanding payments.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-4">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="premiumGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 400 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 400 }}
                  tickFormatter={formatCurrencyValue}
                  dx={-10}
                />
                <Tooltip 
                  content={<PremiumTooltip />} 
                  cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  name="Revenue"
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#premiumGradient)" 
                  activeDot={{ 
                    r: 6, 
                    fill: '#10b981', 
                    stroke: '#fff', 
                    strokeWidth: 3,
                    style: { filter: 'drop-shadow(0px 4px 8px rgba(16, 185, 129, 0.5))' } 
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Premium Client Growth Bar Chart */}
      <Card className="bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-w-0">
        <CardHeader className="pb-0 px-6 pt-6 sm:px-8 sm:pt-8 border-b-0">
          <CardTitle className="text-lg font-sans font-semibold text-[#0F172A] dark:text-white tracking-tight">Client Growth</CardTitle>
          <CardDescription className="text-sm text-[#64748B] dark:text-[#94A3B8] font-normal mt-1 mb-2">New onboarded clients over time.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-4">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 400 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 400 }}
                  dx={-10}
                />
                <Tooltip 
                  content={({ active, payload, label }: any) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 backdrop-blur-md dark:bg-[#1A1C23]/95 border border-[#E2E8F0] dark:border-white/10 p-4 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                          <p className="font-medium text-[#64748B] dark:text-[#94A3B8] mb-3 text-[12px] tracking-wider uppercase">{label}</p>
                          {payload.map((entry: any, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-[#1447E6] shadow-[0_0_8px_rgba(20,71,230,0.6)]" />
                              <p className="text-[14px] font-normal text-[#475569] dark:text-[#CBD5E1]">
                                {entry.name}: <span className="text-[#0F172A] dark:text-white font-medium ml-1">{entry.value}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      )
                    }
                    return null
                  }}
                  cursor={{ fill: '#F1F5F9', opacity: 0.5 }}
                />
                <Bar 
                  dataKey="clients" 
                  name="Clients"
                  fill="#1447E6" 
                  radius={[4, 4, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
