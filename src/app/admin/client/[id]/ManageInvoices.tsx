"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createInvoiceAction, deleteInvoiceAction, updateInvoiceStatusAction } from "@/app/actions/invoices"
import { Loader2, Plus, Trash2, Receipt, CheckCircle2, Clock, X, FileText, Send } from "lucide-react"
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
    <Card className="hover:border-primary/50 transition-all duration-200">
      <CardHeader className="flex flex-row items-start justify-between pb-4 border-b border-border/50">
        <div>
          <CardTitle className="text-lg font-bold">💳 Billing & Invoices</CardTitle>
          <CardDescription>Manage one-off invoices and monthly retainers.</CardDescription>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Create Invoice
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-6">
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
          <div className="space-y-4">
            {invoices.map((invoice) => {
              const config = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.DRAFT
              const StatusIcon = config.icon

              return (
                <div key={invoice.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-border rounded-xl hover:border-primary/30 transition-colors bg-card gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${invoice.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                        {invoice.title}
                        {invoice.type === "RETAINER" && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700">Retainer</span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(invoice.createdAt).toLocaleDateString()}
                        {invoice.dueDate && ` • Due: ${new Date(invoice.dueDate).toLocaleDateString()}`}
                      </p>
                      {invoice.items?.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          {invoice.items.length} item(s) — {invoice.items[0].description} {invoice.items.length > 1 && '...'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <p className="font-bold text-lg">{invoice.currency} {invoice.amount.toLocaleString()}</p>
                      <select 
                        className={`mt-1 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full outline-none cursor-pointer border ${config.className} border-current/20`}
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                      >
                        <option value="SENT">Pending</option>
                        <option value="PAID">Paid</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                    <button onClick={() => handleDeleteClick(invoice.id)} className="text-destructive hover:text-destructive/80 p-2 rounded-full hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
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
