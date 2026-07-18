"use client"

import { useEffect, useState } from "react"
import { getSuperAdminAnalytics } from "@/app/actions/superadmin"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { Loader2, TrendingUp, PieChart as PieChartIcon } from "lucide-react"
import ChurnAnalyticsWidget from "@/components/superadmin/ChurnAnalyticsWidget"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const COLORS = ["#5A52FF", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6"]

export default function AnalyticsCharts() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const res = await getSuperAdminAnalytics()
      if (res?.success) {
        setData(res.data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px] w-full bg-white dark:bg-[#111111] rounded-[24px] border border-[#E9EDF4] dark:border-[#2A2E35] shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-[#5A52FF]" />
      </div>
    )
  }

  if (!data) return null

  const PremiumTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const chartData = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-md dark:bg-[#1A1C23]/95 border border-[#E2E8F0] dark:border-white/10 p-5 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] min-w-[200px] z-50">
          <p className="font-medium text-[#64748B] dark:text-[#94A3B8] mb-4 text-[12px] tracking-wider uppercase">{label}</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#5A52FF] shadow-[0_0_10px_rgba(90,82,255,0.8)]" />
                <span className="text-[14px] font-normal text-[#475569] dark:text-[#CBD5E1]">New Companies</span>
              </div>
              <span className="text-[15px] font-medium text-[#0F172A] dark:text-white">
                {chartData.agencies}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  // A basic CustomTooltip for the pie chart since it was using the generic CustomTooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md dark:bg-[#1A1C23]/95 border border-[#E2E8F0] dark:border-white/10 p-4 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-w-[150px]">
          <p className="font-medium text-[#64748B] dark:text-[#94A3B8] mb-3 text-[12px] tracking-wider uppercase">{payload[0].name}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill || COLORS[index % COLORS.length] }} />
              <p className="text-[14px] font-normal text-[#475569] dark:text-[#CBD5E1]">
                Count: <span className="text-[#0F172A] dark:text-white font-medium ml-1">{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10 h-full">
      {/* Premium Company Growth Area Chart */}
      <Card className="bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-w-0">
        <CardHeader className="pb-0 px-6 pt-6 sm:px-8 sm:pt-8 border-b-0">
          <CardTitle className="text-lg font-sans font-medium text-[#0F172A] dark:text-white tracking-tight">Company Growth</CardTitle>
          <CardDescription className="text-sm text-[#64748B] dark:text-[#94A3B8] font-normal mt-1 mb-2">New company signups over the last 6 months.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-4">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.growth} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                <defs>
                  <linearGradient id="premiumGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A52FF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#5A52FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 400 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 400 }}
                  allowDecimals={false}
                  dx={-10}
                />
                <Tooltip 
                  content={<PremiumTooltip />} 
                  cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="agencies" 
                  name="New Companies"
                  stroke="#5A52FF" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#premiumGrowthGradient)" 
                  activeDot={{ 
                    r: 6, 
                    fill: '#5A52FF', 
                    stroke: '#fff', 
                    strokeWidth: 3,
                    style: { filter: 'drop-shadow(0px 4px 8px rgba(90, 82, 255, 0.5))' } 
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Premium Subscription Plans Pie Chart */}
      <Card className="bg-[#FFFFFF] dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-w-0 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500"></div>
        <CardHeader className="pb-0 px-6 pt-6 sm:px-8 sm:pt-8 border-b-0 relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/20 dark:to-emerald-500/5 flex items-center justify-center shadow-inner border border-emerald-100 dark:border-emerald-500/20">
              <PieChartIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <CardTitle className="text-lg font-sans font-medium text-[#0F172A] dark:text-white tracking-tight">Subscription Plans</CardTitle>
          </div>
          <CardDescription className="text-sm text-[#64748B] dark:text-[#94A3B8] font-normal mt-2 mb-2 ml-1">Distribution of active tenants across plans.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 pt-4 flex-1">
          <div className="h-[280px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.planDistribution.map((entry: any, index: number) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-80 transition-opacity duration-300 outline-none"
                      style={{ filter: `drop-shadow(0px 4px 10px ${COLORS[index % COLORS.length]}66)` }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  formatter={(value) => <span className="text-[#64748B] dark:text-[#94A3B8] font-normal text-[13px] ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Move Churn Analytics out or keep it here if layout allows */}
    </div>
  )
}

