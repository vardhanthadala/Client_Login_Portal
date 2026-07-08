"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Receipt, CheckCircle2, Clock, AlertCircle, Download, FileText, Wallet, ReceiptText, ArrowUpRight, Check, TriangleAlert, HandCoins, WalletCards } from "lucide-react"
import { toast } from "sonner"

// Ensure razorpay is loaded globally
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

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  DRAFT: { label: "Draft", className: "bg-[#F1F5F9] text-[#64748B] dark:bg-[#222] dark:text-[#888]", icon: FileText },
  SENT: { label: "Pending", className: "bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20", icon: Clock },
  PAID: { label: "Paid", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20", icon: Check },
  OVERDUE: { label: "Overdue", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20", icon: TriangleAlert },
  CANCELLED: { label: "Cancelled", className: "bg-[#F1F5F9] text-[#64748B] dark:bg-[#222] dark:text-[#888]", icon: AlertCircle },
}

export default function ClientInvoices({ invoices, clientProfile }: { invoices: Invoice[], clientProfile: any }) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handlePayment = async (invoice: Invoice) => {
    setLoadingId(invoice.id)
    try {
      // 1. Create order on server
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create order")
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: data.razorpayKeyId,
        amount: data.amount,
        currency: data.currency,
        name: clientProfile.companyName || "Our Company",
        description: invoice.title,
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Verify payment
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
        prefill: {
          name: clientProfile.clientName,
          // email: "", // could add email if passed
        },
        theme: {
          color: "#0f172a" // primary color
        }
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
    // Dynamically import html2pdf only on client side
    const html2pdf = (await import('html2pdf.js')).default

    // Create a temporary div for the invoice
    const element = document.createElement('div')
    element.innerHTML = `
      <div style="padding: 60px; font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; background: #fff;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div>
            <h1 style="font-size: 42px; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -1px; line-height: 1;">INVOICE</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 8px; font-weight: 500; letter-spacing: 0.5px;">INV-${invoice.id.substring(0,8).toUpperCase()}</p>
          </div>
          <div style="text-align: right;">
            <h2 style="font-size: 22px; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.5px;">Sreehisoft Company</h2>
            <p style="color: #475569; font-size: 13px; margin: 6px 0 0 0; line-height: 1.6;">
              123 Innovation Drive<br>
              Tech Park, Suite 400<br>
              San Francisco, CA 94105<br>
              contact@sreehisoft.com<br>
              +1 (555) 123-4567
            </p>
          </div>
        </div>
        
        <!-- Divider -->
        <div style="height: 2px; background: #f1f5f9; margin-bottom: 40px;"></div>
        
        <!-- Billing Details -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px; background: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9;">
          <div style="flex: 1;">
            <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 10px 0;">Billed To</p>
            <h3 style="margin: 0 0 6px 0; font-size: 18px; font-weight: 700; color: #0f172a;">${clientProfile.companyName || 'Client Company'}</h3>
            <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.5; font-weight: 500;">Attn: ${clientProfile.clientName}</p>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px; line-height: 1.5;">
              Client Address Line 1<br>
              City, State, ZIP
            </p>
          </div>
          <div style="display: flex; gap: 40px; text-align: right;">
            <div>
              <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 10px 0;">Invoice Date</p>
              <p style="margin: 0; font-size: 15px; font-weight: 600; color: #0f172a;">${new Date(invoice.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div>
              <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 10px 0;">Due Date</p>
              <p style="margin: 0; font-size: 15px; font-weight: 700; color: ${invoice.status === 'OVERDUE' ? '#ef4444' : '#0f172a'};">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Upon Receipt'}</p>
            </div>
          </div>
        </div>
        
        <!-- Items Table -->
        <div style="margin-bottom: 40px;">
          <table style="width: 100%; border-collapse: separate; border-spacing: 0;">
            <thead>
              <tr>
                <th style="padding: 12px 16px; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-align: left; border-bottom: 2px solid #e2e8f0;">Description</th>
                <th style="padding: 12px 16px; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-align: center; border-bottom: 2px solid #e2e8f0;">Qty</th>
                <th style="padding: 12px 16px; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-align: right; border-bottom: 2px solid #e2e8f0;">Rate</th>
                <th style="padding: 12px 16px; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; text-align: right; border-bottom: 2px solid #e2e8f0;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items.map((item, index) => `
                <tr>
                  <td style="padding: 16px; font-size: 14px; color: #0f172a; font-weight: 500; border-bottom: 1px solid #f1f5f9;">${item.description}</td>
                  <td style="padding: 16px; font-size: 14px; color: #475569; text-align: center; border-bottom: 1px solid #f1f5f9;">${item.quantity}</td>
                  <td style="padding: 16px; font-size: 14px; color: #475569; text-align: right; border-bottom: 1px solid #f1f5f9;">${invoice.currency} ${item.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style="padding: 16px; font-size: 14px; color: #0f172a; font-weight: 600; text-align: right; border-bottom: 1px solid #f1f5f9;">${invoice.currency} ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <!-- Payment Info -->
          <div style="width: 50%; padding-right: 40px;">
            <p style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 12px 0;">Payment Details</p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #f1f5f9;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-size: 12px; width: 40%;">Bank Name:</td>
                  <td style="padding: 4px 0; color: #0f172a; font-size: 12px; font-weight: 600;">Global Tech Bank</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-size: 12px;">Account Name:</td>
                  <td style="padding: 4px 0; color: #0f172a; font-size: 12px; font-weight: 600;">Sreehisoft LLC</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-size: 12px;">Account Number:</td>
                  <td style="padding: 4px 0; color: #0f172a; font-size: 12px; font-weight: 600;">xxxx-xxxx-1234</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #64748b; font-size: 12px;">Routing / SWIFT:</td>
                  <td style="padding: 4px 0; color: #0f172a; font-size: 12px; font-weight: 600;">GTBXXX</td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Totals -->
          <div style="width: 40%;">
            <div style="display: flex; justify-content: space-between; padding: 8px 16px; color: #475569; font-size: 14px;">
              <span>Subtotal</span>
              <span style="font-weight: 500;">${invoice.currency} ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 16px; color: #475569; font-size: 14px;">
              <span>Tax (0%)</span>
              <span style="font-weight: 500;">${invoice.currency} 0.00</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 16px; background: #0f172a; color: white; border-radius: 8px; margin-top: 12px; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1);">
              <span style="font-weight: 600; font-size: 16px;">Total Due</span>
              <span style="font-weight: 700; font-size: 20px;">${invoice.currency} ${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            
            ${invoice.status === 'PAID' ? `
              <div style="margin-top: 16px; padding: 12px; background-color: #ecfdf5; color: #059669; text-align: center; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: 1px; border: 1px solid #a7f3d0; text-transform: uppercase;">
                ✓ Paid in Full
              </div>
            ` : ''}
          </div>
        </div>
        
        <!-- Notes -->
        ${invoice.notes ? `
          <div style="padding: 24px; background: #fff8f1; border-radius: 8px; border: 1px solid #ffedd5; margin-bottom: 40px;">
            <p style="margin: 0 0 8px 0; color: #9a3412; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Notes & Terms</p>
            <p style="margin: 0; color: #c2410c; font-size: 13px; line-height: 1.6;">${invoice.notes}</p>
          </div>
        ` : `
          <div style="padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; margin-bottom: 40px;">
            <p style="margin: 0 0 6px 0; color: #64748b; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">Terms & Conditions</p>
            <p style="margin: 0; color: #475569; font-size: 12px; line-height: 1.5;">Please pay within 15 days of receiving this invoice. Late payments may be subject to a 1.5% monthly fee.</p>
          </div>
        `}
        
        <!-- Footer -->
        <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 13px; font-weight: 500;">
          <p style="margin: 0;">Thank you for your business. We appreciate working with you.</p>
        </div>
      </div>
    `

    const opt = {
      margin:       0,
      filename:     `Invoice-${invoice.id.substring(0,8)}.pdf`,
      image:        { type: "jpeg" as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    }

    html2pdf().set(opt as any).from(element).save()
  }

  const activeInvoices = invoices.filter(i => i.status !== "DRAFT")

  if (activeInvoices.length === 0) return null

  // Calculate metrics securely ensuring numeric types and ignoring DRAFT invoices
  const totalPaid = activeInvoices.filter(i => i.status === "PAID").reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  const pendingInvoices = activeInvoices.filter(i => i.status === "SENT" || i.status === "OVERDUE")
  const totalPending = pendingInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0)
  
  const nextDueInvoice = pendingInvoices
    .filter(i => i.dueDate)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0]
  
  const nextDueText = nextDueInvoice ? new Date(nextDueInvoice.dueDate!).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'None'

  return (
    <div className="flex flex-col gap-8 w-full pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Premium Header */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 bg-white dark:bg-[#111111] p-8 rounded-[24px] border border-[#E9EDF4] dark:border-[#2A2E35] shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white font-sans tracking-tight mb-1">Billing & Payments</h2>
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium max-w-md">Manage invoices, payment history, subscriptions and transactions.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-[#171717] border border-[#E2E8F0] dark:border-[rgba(255,255,255,0.08)] px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-[pulse_4s_ease-in-out_infinite]" />
            <span className="text-[13px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Total Paid <span className="ml-1 text-[#64748B] dark:text-[#888]">₹{totalPaid.toLocaleString()}</span></span>
          </div>
          <div className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-[#171717] border border-[#E2E8F0] dark:border-[rgba(255,255,255,0.08)] px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-[pulse_4s_ease-in-out_infinite_1s]" />
            <span className="text-[13px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Pending <span className="ml-1 text-[#64748B] dark:text-[#888]">₹{totalPending.toLocaleString()}</span></span>
          </div>
          {nextDueInvoice && (
            <div className="flex items-center gap-2 bg-[#F8FAFC] dark:bg-[#171717] border border-[#E2E8F0] dark:border-[rgba(255,255,255,0.08)] px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[13px] font-semibold text-[#0F172A] dark:text-[#E2E8F0]">Next Invoice <span className="ml-1 text-[#64748B] dark:text-[#888]">{nextDueText}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* Billing Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: "Total Paid", value: `₹${totalPaid.toLocaleString()}`, subtext: "Lifetime", icon: Wallet, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Pending", value: `₹${totalPending.toLocaleString()}`, subtext: `${pendingInvoices.length} invoices`, icon: HandCoins, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Invoices", value: activeInvoices.length, subtext: "This Year", icon: ReceiptText, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Next Due", value: nextDueText, subtext: "Auto Reminder", icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" }
        ].map((stat, i) => (
          <div key={i} className={`bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group`} style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mb-1">{stat.label}</p>
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white tabular-nums tracking-tight mb-1">{stat.value}</h3>
            <p className="text-[12px] font-medium text-[#64748B] dark:text-[#666]">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Invoice Cards */}
      <div className="flex flex-col gap-6">
        {activeInvoices.map((invoice, i) => {
          const config = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.SENT
          const StatusIcon = config.icon
          const isPending = invoice.status === "SENT" || invoice.status === "OVERDUE"
          const isLoading = loadingId === invoice.id

          return (
            <div 
              key={invoice.id} 
              className={`flex flex-col lg:flex-row gap-6 justify-between bg-white dark:bg-[#111111] p-6 sm:p-8 rounded-[24px] border transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 group ${
                isPending 
                  ? 'border-orange-500/30 shadow-[0_4px_24px_rgba(249,115,22,0.05)] dark:shadow-[0_4px_24px_rgba(249,115,22,0.02)] hover:border-orange-500/60 hover:shadow-[0_8px_32px_rgba(249,115,22,0.1)]' 
                  : 'border-[#E9EDF4] dark:border-[#2A2E35] shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-none hover:border-[#CBD5E1] dark:hover:border-[#444] hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)]'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              
              {/* Left Info */}
              <div className="flex items-start gap-6 flex-1">
                <div className="w-[52px] h-[52px] rounded-2xl bg-[#F8FAFC] dark:bg-[#171717] border border-[#E2E8F0] dark:border-[rgba(255,255,255,0.08)] flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-3 transition-transform duration-300">
                  <WalletCards className={`w-6 h-6 ${isPending ? 'text-orange-500' : 'text-[#64748B] dark:text-[#888]'}`} />
                </div>
                
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-[#0F172A] dark:text-white tracking-tight">{invoice.title}</h3>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold border backdrop-blur-md ${config.className}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {config.label}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[13px] font-medium text-[#64748B] dark:text-[#888] mb-3">
                    <div className="flex items-center gap-1.5">
                      <ReceiptText className="w-3.5 h-3.5" />
                      <span>INV-{invoice.id.substring(0,8).toUpperCase()}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-[#CBD5E1] dark:bg-[#333]" />
                    <span>{new Date(invoice.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {invoice.dueDate && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[#CBD5E1] dark:bg-[#333]" />
                        <span className={invoice.status === "OVERDUE" ? "text-red-500 font-bold" : ""}>
                          Due: {new Date(invoice.dueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {invoice.items?.length > 0 && (
                    <p className="text-[13px] text-[#475569] dark:text-[#999] line-clamp-1 max-w-lg leading-relaxed">
                      {invoice.items.length} item(s): {invoice.items.map(i => i.description).join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Totals & Actions */}
              <div className="flex flex-col items-start lg:items-end gap-5 justify-center lg:pl-8 lg:border-l border-[#E2E8F0] dark:border-[rgba(255,255,255,0.08)] mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 w-full lg:w-auto">
                
                <div className="text-left lg:text-right group-hover:scale-[1.02] transition-transform duration-300 transform-origin-right">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mb-1.5">Invoice Total</p>
                  <p className="text-2xl font-bold text-[#0F172A] dark:text-white tabular-nums tracking-tight">
                    <span className="text-[15px] text-[#64748B] dark:text-[#666] mr-1">{invoice.currency}</span>
                    {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#E2E8F0] dark:via-[#333] to-transparent mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
                  <button 
                    className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold text-[#0F172A] dark:text-white bg-transparent border border-[#E2E8F0] dark:border-[rgba(255,255,255,0.12)] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] hover:-translate-y-0.5 transition-all duration-300" 
                    onClick={() => downloadPDF(invoice)}
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                  
                  {isPending && (
                    <button 
                      className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(79,70,229,0.3)] transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
                      onClick={() => handlePayment(invoice)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
                      {isLoading ? 'Processing...' : 'Pay Now'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          )
        })}
      </div>
    </div>
  )
}
