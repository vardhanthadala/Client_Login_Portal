"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function ExportCsvButton({ tenants }: { tenants: any[] }) {
  const exportToCsv = () => {
    const headers = ["ID", "Name", "Plan", "Status", "Admin Email", "Client Count", "Sub Starts", "Sub Ends"]
    const rows = tenants.map(t => [
      t.id,
      `"${t.name}"`,
      t.subscriptionPlan,
      t.subscriptionStatus,
      `"${t.users?.[0]?.email || ''}"`,
      t._count?.clientProfiles || 0,
      t.subscriptionStart || '',
      t.subscriptionEnd || ''
    ])

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `agencies_export_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" onClick={exportToCsv} className="flex items-center gap-2 h-10">
      <Download className="w-4 h-4" />
      Export CSV
    </Button>
  )
}
