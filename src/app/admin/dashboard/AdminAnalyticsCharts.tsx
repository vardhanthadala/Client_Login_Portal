"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell
} from "recharts"

type ChartData = {
  month: string
  earnings: number
  clients: number
}

export default function AdminAnalyticsCharts({ data }: { data: ChartData[] }) {
  // Find the maximum earnings to highlight the tallest bar (like in screenshot)
  const maxEarnings = Math.max(...data.map(d => d.earnings));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#161616] border border-[#E2E8F0] dark:border-[#333] p-4 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
          <p className="font-bold text-[#0F172A] dark:text-white mb-2 text-[13px] uppercase tracking-wider">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <p className="text-[14px] font-bold text-[#334155] dark:text-[#E2E8F0]">
                {entry.name}: <span className="text-[#0F172A] dark:text-white">
                  {entry.dataKey === 'earnings' 
                    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(entry.value)
                    : entry.value}
                </span>
              </p>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Custom label for BarChart to match screenshot (numbers above bars)
  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, value } = props;
    if (value === 0) return null;
    return (
      <text 
        x={x + width / 2} 
        y={y - 10} 
        fill="#FFFFFF" 
        className="text-[13px] font-bold"
        textAnchor="middle" 
        dominantBaseline="middle"
      >
        ${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      {/* Premium Earnings Bar Chart */}
      <Card className="bg-[#2B9883] dark:bg-[#2B9883] border-none rounded-[24px] shadow-[0_20px_60px_rgba(43,152,131,0.25)] min-w-0">
        <CardHeader className="pb-0 px-6 pt-6 sm:px-8 sm:pt-8 border-b-0">
          <CardTitle className="text-[28px] font-sans font-[650] text-white tracking-tight">Earnings Over Time</CardTitle>
          <CardDescription className="text-[15px] text-white/80 font-medium mt-1 mb-2">Monthly revenue breakdown.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-6">
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 30, right: 10, left: 10, bottom: 0 }} barSize={56}>
                <defs>
                  <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" stopOpacity={1} />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity={1} />
                  </linearGradient>
                  <linearGradient id="emeraldGradientLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dcfce7" stopOpacity={1} />
                    <stop offset="100%" stopColor="#bbf7d0" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}
                  tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                  dx={-10}
                />
                <Tooltip 
                  content={<CustomTooltip />} 
                  cursor={{ fill: '#F8FAFC', opacity: 0.5 }} 
                />
                <Bar 
                  dataKey="earnings" 
                  name="Earnings" 
                  radius={[12, 12, 12, 12]}
                  label={renderCustomBarLabel}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.earnings === maxEarnings && maxEarnings > 0 ? "url(#emeraldGradient)" : "#EBF7EE"} 
                      className="transition-all duration-300 opacity-90 hover:opacity-100"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Premium Client Growth Area Chart */}
      <Card className="bg-[#FFFFFF] dark:bg-[#171A21] border border-[#0F172A]/5 dark:border-white/5 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)] min-w-0">
        <CardHeader className="pb-0 px-6 pt-6 sm:px-8 sm:pt-8 border-b-0">
          <CardTitle className="text-[28px] font-sans font-[650] text-[#0F172A] dark:text-white tracking-tight">Client Growth</CardTitle>
          <CardDescription className="text-[15px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1 mb-2">New onboarded clients over time.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-6">
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 13, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 13, fontWeight: 600 }}
                  allowDecimals={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="clients" 
                  name="New Clients"
                  stroke="#22C55E" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#greenGradient)"
                  activeDot={{ r: 6, fill: '#22C55E', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
