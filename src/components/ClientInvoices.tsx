"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Receipt, CheckCircle2, Clock, AlertCircle, Download, FileText, Wallet, ReceiptText, ArrowUpRight, Check, TriangleAlert, HandCoins, WalletCards, MoreVertical, MoreHorizontal } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

declare global {
  interface Window {
    Razorpay: any
  }
}

type InvoiceItem = {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

type Invoice = {
  id: string
  title: string
  amount: number
  currency: string
  status: string
  type: string
  dueDate: string | null
  notes: string | null
  items: InvoiceItem[]
  createdAt: string
  clientProfile?: {
    companyName: string
    clientName: string
  }
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-[#F1F5F9] text-[#64748B] dark:bg-[#222] dark:text-[#888]" },
  SENT: { label: "Pending", className: "bg-[#F59E0B]/10 text-[#F59E0B]" },
  PAID: { label: "Paid", className: "bg-[#10B981]/10 text-[#10B981]" },
  OVERDUE: { label: "Overdue", className: "bg-[#EF4444]/10 text-[#EF4444]" },
  CANCELLED: { label: "Cancelled", className: "bg-[#F1F5F9] text-[#64748B] dark:bg-[#222] dark:text-[#888]" },
}

export default function ClientInvoices({ invoices, clientProfile }: { invoices: Invoice[], clientProfile: any }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handlePayment = async (invoice: Invoice) => {
    setLoadingId(invoice.id)
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create order")

      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        name: clientProfile.companyName || "Our Company",
        description: invoice.title,
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              invoiceId: invoice.id
            })
          })
          const verifyData = await verifyRes.json()
          if (verifyRes.ok) {
            toast.success("Payment successful!")
            window.location.reload()
          } else {
            toast.error("Payment verification failed: " + verifyData.error)
          }
        },
        prefill: { name: clientProfile.clientName },
        theme: { color: "#3454D1" }
      }

      const rzp1 = new window.Razorpay(options)
      rzp1.on('payment.failed', function (response: any){
        toast.error("Payment Failed: " + response.error.description)
      })
      rzp1.open()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoadingId(null)
    }
  }

  const downloadPDF = async (invoice: Invoice) => {
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.createElement('div')
    element.innerHTML = `
      <div style="padding: 60px; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; background: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div>
            <h1 style="font-size: 42px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -1px; line-height: 1;">INVOICE</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 8px; font-weight: 500; letter-spacing: 0.5px;">INV-${invoice.id.substring(0,8).toUpperCase()}</p>
          </div>
          <div style="text-align: right;">
            <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.5px;">Sreehisoft Company</h2>
            <p style="color: #475569; font-size: 13px; margin: 6px 0 0 0; line-height: 1.6;">
              123 Innovation Drive<br>
              contact@sreehisoft.com
            </p>
          </div>
        </div>
      </div>
    `
    const opt = {
      margin: 0,
      filename: `Invoice-${invoice.id.substring(0,8)}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }
    html2pdf().set(opt as any).from(element).save()
  }

  const activeInvoices = invoices.filter(i => i.status !== "DRAFT")
  if (activeInvoices.length === 0) return null

  const totalPaid = activeInvoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  const pendingInvoices = activeInvoices.filter(i => i.status === "SENT" || i.status === "OVERDUE")
  const totalPending = pendingInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)

  return (
    <div className="flex flex-col gap-[25px] w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-[25px]">
        <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[15px] p-[25px] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[22px] font-semibold text-[#0F172A] dark:text-white leading-none mb-1">₹{totalPaid.toLocaleString()}</span>
            <span className="text-[14px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Total Paid</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0">
            <WalletCards size={20} className="text-[#10B981]" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[15px] p-[25px] shadow-sm flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[22px] font-semibold text-[#0F172A] dark:text-white leading-none mb-1">₹{totalPending.toLocaleString()}</span>
            <span className="text-[14px] font-semibold text-[#64748B] dark:text-[#94A3B8]">Total Pending</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
            <Clock size={20} className="text-[#F59E0B]" />
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[15px] shadow-sm flex flex-col relative w-full overflow-hidden">
        <div className="flex items-center justify-between p-[25px] border-b border-[#E2E8F0] dark:border-[#222]">
          <h2 className="text-[16px] font-bold text-[#0F172A] dark:text-white">Latest Invoices</h2>

        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] dark:bg-[#1A1A1A] border-b border-[#E2E8F0] dark:border-[#222]">
                <th className="px-6 py-4 text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Invoice ID</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Title</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[13px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeInvoices.map((invoice, i) => {
                const config = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.SENT
                const isPending = invoice.status === "SENT" || invoice.status === "OVERDUE"
                const isLoading = loadingId === invoice.id

                return (
                  <tr key={invoice.id} className="border-b border-[#E2E8F0] dark:border-[#222] hover:bg-[#F8FAFC] dark:hover:bg-[#161616] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[8px] bg-[#F1F5F9] dark:bg-[#222] flex items-center justify-center text-[#3454D1] font-semibold text-[12px]">
                          INV
                        </div>
                        <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">
                          #{invoice.id.substring(0, 6).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">{invoice.title}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">
                        {new Date(invoice.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">
                        {invoice.currency} {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center min-w-[85px] px-2.5 py-1 rounded-[6px] text-[11px] font-semibold uppercase tracking-wider ${config.className}`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isPending && (
                          <button 
                            onClick={() => handlePayment(invoice)}
                            disabled={isLoading}
                            className="px-3 py-1.5 rounded-[6px] bg-[#3454D1] text-white text-[12px] font-bold hover:bg-[#2842A8] transition-colors flex items-center gap-2 disabled:opacity-70"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Pay Now"}
                          </button>
                        )}
                        <button 
                          onClick={() => downloadPDF(invoice)}
                          className="w-8 h-8 flex items-center justify-center rounded-[6px] text-[#64748B] hover:bg-[#F1F5F9] dark:hover:bg-[#222] transition-colors"
                          title="Download PDF"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
