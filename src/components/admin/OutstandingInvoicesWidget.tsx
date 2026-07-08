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
  userId: string
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
    <Card className="bg-[#FDF4E7] dark:bg-[#FDF4E7]/10 border-none shadow-sm bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-0 overflow-hidden flex flex-col h-full">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start space-y-4 sm:space-y-0 pb-4 px-6 sm:px-8 pt-7 gap-3 border-b border-[#F1F5F9] dark:border-[#222]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <CardTitle className="text-2xl font-sans font-bold text-[#0F172A] dark:text-white tracking-tight">Outstanding Invoices</CardTitle>
            <CardDescription className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">
              Action required for overdue payments
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto hidden-scrollbar">
        <div className="divide-y divide-[#F1F5F9] dark:divide-[#222]">
          {visibleInvoices.map((inv) => (
            <div key={inv.id} className="p-6 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors group">
              <div>
                <h4 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2 text-[15px]">
                  {inv.clientName}
                  <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider">
                    {inv.status}
                  </span>
                </h4>
                <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">{inv.title}</p>
                <p className="text-[13px] text-[#64748B] dark:text-[#666] font-medium mt-1.5 flex items-center gap-1.5">
                  Due: <strong className="text-red-600 dark:text-red-400">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upon Receipt'}</strong> • 
                  Amount: <strong className="text-[#0F172A] dark:text-white">{formatCurrency(inv.amount, inv.currency)}</strong>
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full sm:w-auto bg-[#FAFAFA] dark:bg-[#0A0A0A] border-[#E5E7EB] dark:border-[#333] hover:border-red-300 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-700 dark:text-red-400 h-9 rounded-lg text-[13px] font-semibold transition-colors"
                  onClick={() => handleSendReminder(inv.id)}
                  disabled={sendingIds[inv.id]}
                >
                  {sendingIds[inv.id] ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Mail className="w-3.5 h-3.5 mr-2" />}
                  Send Reminder
                </Button>
                <Link href={`/admin/client/${inv.userId}`}>
                  <Button size="icon" variant="outline" className="w-9 h-9 bg-[#FAFAFA] dark:bg-[#0A0A0A] border-[#E5E7EB] dark:border-[#333] hover:bg-[#F1F5F9] dark:hover:bg-[#222] text-[#64748B] dark:text-[#888] rounded-lg hidden sm:flex">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="w-9 h-9 text-[#64748B] dark:text-[#888] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
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
