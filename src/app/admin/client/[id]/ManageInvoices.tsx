"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createInvoiceAction, deleteInvoiceAction, updateInvoiceStatusAction, sendInvoiceReminderAction } from "@/app/actions/invoices"
import { Loader2, Plus, Trash2, Receipt, CheckCircle2, Clock, X, FileText, Send, ChevronDown, CreditCard, Mail } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-700", icon: FileText },
  SENT: { label: "Sent / Pending", className: "bg-amber-100 text-amber-700", icon: Clock },
  PAID: { label: "Paid", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  OVERDUE: { label: "Overdue", className: "bg-red-100 text-red-700", icon: Clock },
  CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-500", icon: X },
}

const StatusDropdown = ({ invoiceId, status, onChange, config }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const options = [
    { value: "SENT", label: "Pending" },
    { value: "PAID", label: "Paid" },
    { value: "OVERDUE", label: "Overdue" },
    { value: "CANCELLED", label: "Cancelled" }
  ]

  return (
    <div className="relative mt-1 flex justify-start sm:justify-end" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.05em] font-bold px-3 py-1.5 rounded-full border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] hover:bg-slate-50 dark:hover:bg-[#222] transition-colors text-slate-600 dark:text-slate-300 shadow-sm`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'PAID' ? 'bg-emerald-500' : status === 'SENT' ? 'bg-amber-500' : status === 'OVERDUE' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
        {options.find(o => o.value === status)?.label || status}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden z-50 py-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(invoiceId, option.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold ${status === option.value ? 'bg-slate-50 text-indigo-600 dark:bg-[#222] dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-[#222] dark:hover:text-slate-200'} transition-colors`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ManageInvoices({
  clientProfileId,
  initialInvoices,
}: {
  clientProfileId: string
  initialInvoices: Invoice[]
}) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [isAdding, setIsAdding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state
  const [title, setTitle] = useState("")
  const [type, setType] = useState("ONE_OFF")
  const [currency, setCurrency] = useState("INR")
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<{ description: string; quantity: number; rate: number }[]>([
    { description: "", quantity: 1, rate: 0 }
  ])

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, rate: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0)

  const handleCreate = async () => {
    if (!title || items.length === 0 || items.some(i => !i.description || i.rate <= 0)) {
      return toast.error("Please fill in the title and ensure all items have descriptions and valid rates.")
    }
    
    setIsSaving(true)
    const res = await createInvoiceAction({
      clientProfileId,
      title,
      currency,
      type,
      dueDate: dueDate || null,
      notes,
      items
    })

    if (res.success && res.data) {
      setInvoices([res.data as any, ...invoices])
      setIsAdding(false)
      // Reset form
      setTitle("")
      setDueDate("")
      setNotes("")
      setItems([{ description: "", quantity: 1, rate: 0 }])
    } else {
      toast.error(res.error)
    }
    setIsSaving(false)
  }

  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null)
  const isDeleting = deleteInvoiceId !== null

  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null)

  const handleSendReminder = async (id: string) => {
    setSendingReminderId(id)
    const res = await sendInvoiceReminderAction(id)
    if (res.success) {
      toast.success("Invoice sent successfully to client")
    } else {
      toast.error(res.error || "Failed to send invoice")
    }
    setSendingReminderId(null)
  }

  const confirmDelete = async () => {
    if (!deleteInvoiceId) return
    const id = deleteInvoiceId
    setInvoices(invoices.filter(i => i.id !== id))
    await deleteInvoiceAction(id)
    setDeleteInvoiceId(null)
    toast.success("Invoice deleted")
  }

  const handleDeleteClick = (id: string) => {
    setDeleteInvoiceId(id)
  }

  const handleStatusChange = async (id: string, status: string) => {
    setInvoices(invoices.map(i => i.id === id ? { ...i, status } : i))
    await updateInvoiceStatusAction(id, status)
  }

  return (
    <Card className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#222] shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] rounded-[24px] overflow-visible">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 pt-5 px-6 border-b border-slate-100 dark:border-[#1A1A1A] gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <CardTitle className="text-[17px] font-sans font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-[10px] bg-gradient-to-br from-slate-800 to-slate-900 dark:from-[#222] dark:to-[#111] shadow-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
              <CreditCard className="w-4 h-4 text-white drop-shadow-sm relative z-10" strokeWidth={2} />
            </div>
            Billing & Invoices
          </CardTitle>
          <CardDescription className="text-[13px] text-slate-500 font-normal mt-1.5">Manage one-off invoices and monthly retainers.</CardDescription>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" variant="outline" className="gap-2 h-9 w-full sm:w-auto shrink-0 bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-[#E2E8F0] border-slate-200 dark:border-[#333] hover:bg-slate-50 dark:hover:bg-[#222] transition-colors rounded-xl shadow-sm text-[13px] font-medium">
            <Plus className="w-4 h-4" /> Create Invoice
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-6">
        {isAdding && (
          <div className="bg-muted/30 p-5 rounded-xl border border-border mb-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-wider mb-2 block">Invoice Title *</Label>
                <Input placeholder="e.g., Website Redesign Phase 1" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider mb-2 block">Type</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="ONE_OFF">One-off Payment</option>
                  <option value="RETAINER">Monthly Retainer</option>
                </select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider mb-2 block">Due Date (Optional)</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider mb-2 block">Currency</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-2 flex items-center justify-between">
                <Label className="text-xs uppercase tracking-wider font-bold">Line Items</Label>
                <Button variant="ghost" size="sm" onClick={handleAddItem} className="h-7 text-xs gap-1"><Plus className="w-3 h-3"/> Add Item</Button>
              </div>
              <div className="p-4 space-y-3 bg-card">
                {items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-1">
                      <Input placeholder="Description (e.g., Web Design)" value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)} />
                    </div>
                    <div className="w-24">
                      <Input type="number" min="1" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value) || 1)} />
                    </div>
                    <div className="w-32">
                      <Input type="number" min="0" placeholder="Rate" value={item.rate || ""} onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="w-32 flex items-center h-10 px-3 bg-muted/50 rounded-md border border-border">
                      <span className="text-sm font-medium">{currency} {item.quantity * item.rate}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="text-destructive hover:bg-destructive/10 hover:text-destructive h-10 w-10 shrink-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex justify-end pt-4 border-t border-border mt-4">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold text-foreground">{currency} {totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block">Notes for Client (Optional)</Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Thank you for your business!"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreate} disabled={isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Create & Send Invoice
              </Button>
            </div>
          </div>
        )}

        {/* Invoices List */}
        {invoices.length > 0 ? (
          <div className="flex flex-col border border-slate-200 dark:border-[#333] rounded-2xl overflow-hidden bg-white dark:bg-[#111] shadow-sm">
            {invoices.map((invoice) => {
              const config = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT
              const StatusIcon = config.icon

              return (
                <div key={invoice.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-slate-100 dark:border-[#222] last:border-0 hover:bg-slate-50/80 dark:hover:bg-[#161616] transition-colors gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 bg-slate-100/80 dark:bg-[#222] border border-slate-200/60 dark:border-[#333]">
                      <Receipt className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[14.5px] text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                        {invoice.title}
                        {invoice.type === "RETAINER" && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400">Retainer</span>
                        )}
                      </h4>
                      <p className="text-[12.5px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                        {invoice.dueDate && ` • Due: ${new Date(invoice.dueDate).toLocaleDateString()}`}
                      </p>
                      {invoice.items?.length > 0 && (
                        <p className="text-[12px] text-slate-500 mt-1.5 flex items-start gap-1.5 break-words whitespace-pre-wrap">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{invoice.items.length} item(s)</span> — {invoice.items[0].description} {invoice.items.length > 1 && '...'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end pl-14 sm:pl-0">
                    <div className="text-left sm:text-right flex flex-col sm:items-end gap-2">
                      <p className="font-mono font-semibold text-[17px] text-slate-900 dark:text-slate-100 tracking-tight">
                        <span className="text-slate-400 text-[13px] mr-1 font-sans font-medium">{invoice.currency}</span> 
                        {invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <StatusDropdown 
                        invoiceId={invoice.id} 
                        status={invoice.status} 
                        onChange={handleStatusChange} 
                        config={config} 
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleSendReminder(invoice.id)} 
                        disabled={sendingReminderId === invoice.id || invoice.status === "PAID" || invoice.status === "CANCELLED"}
                        className="text-slate-400 hover:text-indigo-600 p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors disabled:opacity-50"
                        title="Send Invoice to Client"
                      >
                        {sendingReminderId === invoice.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDeleteClick(invoice.id)} className="text-red-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          !isAdding && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No invoices created yet.</p>
            </div>
          )
        )}
      </CardContent>
      <AlertDialog open={deleteInvoiceId !== null} onOpenChange={(open) => !open && setDeleteInvoiceId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
