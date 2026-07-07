"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2 } from "lucide-react"
import { getChurnAnalyticsAction } from "@/app/actions/superadmin"

const COLORS = ["#EF4444", "#F97316", "#F59E0B", "#8B5CF6", "#EC4899", "#6B7280"]

export default function ChurnAnalyticsWidget() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const res = await getChurnAnalyticsAction()
      if (res?.success) {
        setData(res.data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Card className="shadow-sm rounded-2xl border-gray-100 flex justify-center items-center h-[380px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className="shadow-sm rounded-2xl border-gray-100">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Churn Analytics</CardTitle>
            <CardDescription>Cancellations this month</CardDescription>
          </div>
          <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-bold border border-red-100">
            {data.totalChurn} Churned
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[280px]">
        {data.totalChurn === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🎉</span>
            </div>
            <p className="font-semibold text-gray-700">Zero Churn!</p>
            <p className="text-sm text-gray-500 mt-1">No agencies have cancelled this month.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.breakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.breakdown.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
