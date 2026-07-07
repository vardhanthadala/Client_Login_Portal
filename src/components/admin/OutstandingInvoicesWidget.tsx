"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Mail, Loader2, ArrowRight, X } from "lucide-react"
import { toast } from "sonner"
import { sendInvoiceReminderAction } from "@/app/actions/invoices"
import Link from "next/link"

export type OverdueInvoice = {
  id: string
  title: string
  amount: number
  currency: string
  dueDate: string | null
  status: string
  clientName: string
  clientProfileId: string
}

export default function OutstandingInvoicesWidget({ invoices }: { invoices: OverdueInvoice[] }) {
  const [sendingIds, setSendingIds] = useState<Record<string, boolean>>({})
  const [dismissedIds, setDismissedIds] = useState<Record<string, boolean>>({})

  const handleSendReminder = async (invoiceId: string) => {
    setSendingIds(prev => ({ ...prev, [invoiceId]: true }))
    try {
      const result = await sendInvoiceReminderAction(invoiceId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Reminder email sent successfully")
        setDismissedIds(prev => ({ ...prev, [invoiceId]: true }))
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
    } finally {
      setSendingIds(prev => ({ ...prev, [invoiceId]: false }))
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
  }

  const visibleInvoices = invoices.filter(inv => !dismissedIds[inv.id])

  if (visibleInvoices.length === 0) {
    return null
  }

  return (
    <Card className="border-red-200 bg-red-50/30 shadow-sm mb-10">
      <CardHeader className="pb-3 border-b border-red-100 bg-red-50/50">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <CardTitle className="text-red-900 text-lg">Action Required: Outstanding Invoices</CardTitle>
        </div>
        <CardDescription className="text-red-700/80">
          The following clients have overdue or unpaid invoices that require attention.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <div className="divide-y divide-red-100">
          {visibleInvoices.map((inv) => (
            <div key={inv.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-red-50/50 transition-colors">
              <div>
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  {inv.clientName}
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold uppercase tracking-wider">
                    {inv.status}
                  </span>
                </h4>
                <p className="text-sm text-gray-600 mt-1">{inv.title}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Due: <strong className="text-red-600">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upon Receipt'}</strong> • 
                  Amount: <strong className="text-gray-900 ml-1">{formatCurrency(inv.amount, inv.currency)}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 bg-white"
                  onClick={() => handleSendReminder(inv.id)}
                  disabled={sendingIds[inv.id]}
                >
                  {sendingIds[inv.id] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                  Send Reminder
                </Button>
                <Link href={`/admin/client/${inv.clientProfileId}`}>
                  <Button size="icon" variant="ghost" className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 hidden sm:flex">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="text-gray-400 hover:text-red-600 hover:bg-red-100"
                  onClick={() => setDismissedIds(prev => ({ ...prev, [inv.id]: true }))}
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
