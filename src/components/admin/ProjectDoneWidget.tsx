"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Monitor } from "lucide-react"
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from "recharts"


export default function ProjectDoneWidget({ 
  completedCount = 20, 
  totalCount = 30,
  chartData = []
}: { 
  completedCount?: number;
  totalCount?: number;
  chartData?: { day: string; value: number }[];
}) {
  return (
    <Card className="bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-0 h-full flex flex-col justify-between overflow-hidden relative">
      <CardContent className="p-6 pb-0 flex-1">
        <div className="flex justify-between items-start mb-4 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center shrink-0">
              <Monitor className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-[#0F172A] dark:text-white leading-tight">Project Done</h3>
              <p className="text-[13px] font-medium text-[#64748B] dark:text-[#94A3B8] mt-0.5">{completedCount}/{totalCount} completed</p>
            </div>
          </div>
          <div className="text-2xl font-medium text-[#0F172A] dark:text-white">
            {completedCount}/{totalCount}
          </div>
        </div>
      </CardContent>
      
      <div className="h-[100px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
            <XAxis dataKey="day" hide padding={{ left: 0, right: 0 }} />
            <defs>
              <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip 
              cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '4 4' }}
              content={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-[#1A1C23] border border-[#E2E8F0] dark:border-white/10 rounded-[8px] shadow-sm min-w-[140px] overflow-hidden">
                      <div className="bg-[#F1F5F9] dark:bg-white/5 px-3 py-2 border-b border-[#E2E8F0] dark:border-white/10">
                        <p className="font-medium text-[#475569] dark:text-[#94A3B8] text-[12px]">{payload[0].payload.day}</p>
                      </div>
                      <div className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                          <p className="text-[13px] font-medium text-[#475569] dark:text-[#CBD5E1]">
                            Completed: <span className="text-[#0F172A] dark:text-white font-semibold ml-1">{payload[0].value} Projects</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#ef4444" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#redGradient)" 
              isAnimationActive={false}
              activeDot={{ 
                r: 5, 
                fill: '#ef4444', 
                stroke: '#fff', 
                strokeWidth: 2,
                style: { filter: 'drop-shadow(0px 2px 4px rgba(239, 68, 68, 0.5))' } 
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
