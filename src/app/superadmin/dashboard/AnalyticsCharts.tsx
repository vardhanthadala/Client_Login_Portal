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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#161616] border border-[#E2E8F0] dark:border-[#333] p-4 rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] min-w-[150px]">
          <p className="font-bold text-[#0F172A] dark:text-white mb-2 text-[13px] uppercase tracking-wider">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill || COLORS[index % COLORS.length] }} />
              <p className="text-[14px] font-bold text-[#334155] dark:text-[#E2E8F0]">
                {entry.name}: <span className="text-[#0F172A] dark:text-white">{entry.value}</span>
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
      <div className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 min-w-0 flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110"></div>
        <div className="pb-2 px-6 pt-6 sm:px-8 sm:pt-8 border-b border-[#F1F5F9] dark:border-[#222] relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-500/20 dark:to-indigo-500/5 flex items-center justify-center shadow-inner border border-indigo-100 dark:border-indigo-500/20 relative">
              <div className="absolute inset-0 bg-indigo-500 blur-md opacity-20 rounded-[14px]"></div>
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400 relative z-10" />
            </div>
            <h3 className="text-2xl font-sans font-bold text-[#0F172A] dark:text-white tracking-tight">Company Growth</h3>
          </div>
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1 mb-4 ml-1">New company signups over the last 6 months</p>
        </div>
        <div className="p-6 sm:p-8 pt-6 flex-1 relative z-10">
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5A52FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5A52FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" strokeOpacity={0.4} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748B', fontSize: 13, fontWeight: 500}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748B', fontSize: 13, fontWeight: 500}} 
                  allowDecimals={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#CBD5E1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="agencies" 
                  name="New Companies"
                  stroke="#5A52FF" 
                  strokeWidth={3} 
                  fill="url(#colorGrowth)"
                  activeDot={{ r: 6, fill: '#5A52FF', stroke: '#fff', strokeWidth: 2 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 min-w-0 flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-110"></div>
        <div className="pb-2 px-6 pt-6 sm:px-8 sm:pt-8 border-b border-[#F1F5F9] dark:border-[#222] relative z-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-500/20 dark:to-emerald-500/5 flex items-center justify-center shadow-inner border border-emerald-100 dark:border-emerald-500/20 relative">
              <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 rounded-[14px]"></div>
              <PieChartIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 relative z-10" />
            </div>
            <h3 className="text-2xl font-sans font-bold text-[#0F172A] dark:text-white tracking-tight">Subscription Plans</h3>
          </div>
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1 mb-4 ml-1">Distribution of active tenants across plans</p>
        </div>
        <div className="p-6 sm:p-8 pt-6 flex-1 relative z-10">
          <div className="h-[280px] w-full mt-4 flex items-center justify-center">
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
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  formatter={(value) => <span className="text-[#64748B] dark:text-[#94A3B8] font-medium text-[13px] ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Move Churn Analytics out or keep it here if layout allows */}
    </div>
  )
}

