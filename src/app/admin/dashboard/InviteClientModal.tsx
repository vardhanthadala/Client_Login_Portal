"use client"

import { useState } from "react"
import { inviteClientAction } from "@/app/actions/admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Loader2, Plus } from "lucide-react"

export default function InviteClientModal() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [credentials, setCredentials] = useState<{email: string, password: string} | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    
    const formData = new FormData(e.currentTarget)
    const result = await inviteClientAction(formData)
    
    if (result.error) {
      setError(result.error)
    } else if (result.success && result.credentials) {
      setCredentials(result.credentials)
    }
    
    setIsLoading(false)
  }

  const resetAndClose = () => {
    setOpen(false)
    setTimeout(() => setCredentials(null), 300)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="w-full sm:w-auto bg-[#3651C6] hover:bg-[#2B42A4] text-white rounded-[4px] px-5 h-[38px] text-[12px] font-bold uppercase tracking-[0.05em] transition-all border-0 shadow-none hover:shadow-sm" />
        }
      >
        <div className="flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          INVITE NEW CLIENT
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-y-auto max-h-[95vh] bg-white border-0 rounded-2xl shadow-2xl">
        {credentials ? (
          <div className="flex flex-col">
            <div className="bg-[#FAFAFA] border-b border-[#F1F5F9] px-6 sm:px-8 py-6">
              <DialogTitle className="text-xl sm:text-2xl font-sans font-bold text-[#0F172A]">Client Invited Successfully!</DialogTitle>
              <DialogDescription className="mt-2 text-[14px] sm:text-[15px] text-[#64748B]">
                Send these temporary credentials securely to the client.
              </DialogDescription>
            </div>
            <div className="px-6 sm:px-8 py-6 sm:py-8 space-y-4">
              <div className="bg-[#F3F5FF] p-5 sm:p-6 rounded-xl space-y-3 border border-[#22C55E]/20">
              <div>
                <span className="text-muted-foreground text-sm uppercase tracking-[0.12em]">URL: </span>
                <span className="font-mono text-sm">{typeof window !== "undefined" ? window.location.origin : ""}/login</span>
              </div>
              <div>
                <span className="text-muted-foreground text-sm uppercase tracking-[0.12em]">Email: </span>
                <span className="font-mono text-sm">{credentials.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground text-sm uppercase tracking-[0.12em]">Temp Password: </span>
                <span className="font-mono text-sm text-primary font-bold">{credentials.password}</span>
              </div>
              </div>
            </div>
            <div className="px-6 sm:px-8 py-5 bg-[#FAFAFA] border-t border-[#F1F5F9]">
              <Button onClick={resetAndClose} className="w-full bg-[#22C55E] hover:bg-[#4F46E5] text-white h-12 rounded-xl text-[15px] font-medium transition-colors">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col p-6 sm:p-10">
            <div className="mb-6 sm:mb-8">
              <DialogTitle className="text-2xl sm:text-3xl font-sans font-bold text-[#0F172A] tracking-tight">Invite New Client</DialogTitle>
              <DialogDescription className="mt-2 text-[14px] sm:text-[15px] text-[#64748B]">
                Create a portal account for a new client in seconds.
              </DialogDescription>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-7">
              <div className="grid gap-2">
                <Label htmlFor="companyName" className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] uppercase">Company Name</Label>
                <Input id="companyName" name="companyName" required className="h-12 bg-[#F8FAFC] border-transparent hover:bg-[#F1F5F9] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#22C55E]/10 focus-visible:border-[#22C55E] rounded-xl transition-all shadow-none" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientName" className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] uppercase">Contact Person</Label>
                <Input id="clientName" name="clientName" required className="h-12 bg-[#F8FAFC] border-transparent hover:bg-[#F1F5F9] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#22C55E]/10 focus-visible:border-[#22C55E] rounded-xl transition-all shadow-none" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] uppercase">Email Address</Label>
                <Input id="email" name="email" type="email" required className="h-12 bg-[#F8FAFC] border-transparent hover:bg-[#F1F5F9] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#22C55E]/10 focus-visible:border-[#22C55E] rounded-xl transition-all shadow-none" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] uppercase">Password (For Client)</Label>
                <Input id="password" name="password" type="text" placeholder="Set a password" required className="h-12 bg-[#F8FAFC] border-transparent hover:bg-[#F1F5F9] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#22C55E]/10 focus-visible:border-[#22C55E] rounded-xl transition-all shadow-none" />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="servicePurchased" className="text-[11px] font-bold tracking-[0.15em] text-[#64748B] uppercase">Service Purchased</Label>
                <Input id="servicePurchased" name="servicePurchased" placeholder="e.g. Social Media Management" required className="h-12 bg-[#F8FAFC] border-transparent hover:bg-[#F1F5F9] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#22C55E]/10 focus-visible:border-[#22C55E] rounded-xl transition-all shadow-none" />
              </div>
            </div>
            {error && <p className="text-destructive text-sm font-medium mt-4">{error}</p>}
            
            <div className="mt-8 sm:mt-10">
              <Button type="submit" disabled={isLoading} className="w-full bg-[#22C55E] hover:bg-[#4F46E5] text-white h-14 rounded-2xl text-[16px] font-bold transition-all shadow-lg shadow-[#22C55E]/20 hover:shadow-xl hover:shadow-[#22C55E]/30 hover:-translate-y-0.5">
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Client Account"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
