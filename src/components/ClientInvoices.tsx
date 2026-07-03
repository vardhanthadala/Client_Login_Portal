"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Receipt, CheckCircle2, Clock, AlertCircle, Download, FileText } from "lucide-react"
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
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-700", icon: FileText },
  SENT: { label: "Pending Payment", className: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  PAID: { label: "Paid", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  OVERDUE: { label: "Overdue", className: "bg-red-100 text-red-700 border-red-200", icon: AlertCircle },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-500", icon: AlertCircle },
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

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold">💳 Billing & Invoices</h2>
        {activeInvoices.some(i => i.status === "SENT" || i.status === "OVERDUE") && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 animate-pulse">
            Action required
          </span>
        )}
      </div>

      <div className="grid gap-4">
        {activeInvoices.map((invoice) => {
          const config = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.SENT
          const StatusIcon = config.icon
          const isPending = invoice.status === "SENT" || invoice.status === "OVERDUE"
          const isLoading = loadingId === invoice.id

          return (
            <Card key={invoice.id} className={`overflow-hidden transition-all duration-200 border ${isPending ? 'border-amber-200 shadow-md' : 'border-border/50 bg-card hover:border-primary/30'}`}>
              <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between">
                
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isPending ? 'bg-amber-100 text-amber-600' : invoice.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-base">{invoice.title}</h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${config.className}`}>
                        <StatusIcon className="w-3 h-3" />{config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{new Date(invoice.createdAt).toLocaleDateString()}</span>
                      {invoice.dueDate && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-border" />
                          <span className={invoice.status === "OVERDUE" ? "text-red-500 font-semibold" : ""}>
                            Due: {new Date(invoice.dueDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>
                    {invoice.items?.length > 0 && (
                      <p className="text-sm mt-2 text-foreground/80 line-clamp-1">
                        {invoice.items.length} item(s): {invoice.items.map(i => i.description).join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 justify-center sm:pl-4 sm:border-l border-border/50">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground mb-0.5">Total Amount</p>
                    <p className="text-2xl font-bold">{invoice.currency} {invoice.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => downloadPDF(invoice)}>
                      <Download className="w-3.5 h-3.5" /> PDF
                    </Button>
                    {isPending && (
                      <Button 
                        size="sm" 
                        className="h-8 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90" 
                        onClick={() => handlePayment(invoice)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isLoading ? 'Processing...' : 'Pay Now'}
                      </Button>
                    )}
                  </div>
                </div>

              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
