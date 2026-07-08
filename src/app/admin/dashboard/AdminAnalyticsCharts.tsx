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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts"

type ChartData = {
  month: string
  earnings: number
  clients: number
}

export default function AdminAnalyticsCharts({ data }: { data: ChartData[] }) {
  // Custom tooltip for currency
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-[#E5E7EB] p-3 rounded-lg shadow-lg">
          <p className="font-bold text-[#0F172A] mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className={`text-sm font-medium ${entry.dataKey === 'earnings' ? 'text-green-600' : 'text-[#5A52FF]'}`}>
              {entry.name}: {entry.dataKey === 'earnings' 
                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      {/* Earnings Chart */}
      <Card className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-0">
        <CardHeader className="pb-2 px-6 pt-6 sm:px-8 sm:pt-8 border-b border-[#F1F5F9] dark:border-[#222]">
          <CardTitle className="text-2xl font-sans font-bold text-[#0F172A] dark:text-white tracking-tight">Earnings Over Time</CardTitle>
          <CardDescription className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1 mb-4">Total paid invoices in the last 6 months (converted to base currency).</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.4} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F1F5F9', opacity: 0.4 }} />
                <Bar dataKey="earnings" name="Earnings" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Client Growth Chart */}
      <Card className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-0">
        <CardHeader className="pb-2 px-6 pt-6 sm:px-8 sm:pt-8 border-b border-[#F1F5F9] dark:border-[#222]">
          <CardTitle className="text-2xl font-sans font-bold text-[#0F172A] dark:text-white tracking-tight">Client Growth</CardTitle>
          <CardDescription className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1 mb-4">New clients onboarded over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-6">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.4} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '5 5' }} />
                <Line 
                  type="monotone" 
                  dataKey="clients" 
                  name="New Clients"
                  stroke="#5A52FF" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#5A52FF', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#5A52FF', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
