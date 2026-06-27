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
import { Loader2 } from "lucide-react"

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
        render={<Button />}
      >
        Invite New Client
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {credentials ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Client Invited Successfully!</DialogTitle>
              <DialogDescription>
                Send these temporary credentials securely to the client.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/50 p-4 rounded-xl space-y-2 border border-border">
              <div>
                <span className="text-muted-foreground text-sm uppercase tracking-[0.12em]">URL: </span>
                <span className="font-mono text-sm">{window.location.origin}/login</span>
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
            <DialogFooter>
              <Button onClick={resetAndClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Invite New Client</DialogTitle>
              <DialogDescription>
                Create a portal account for a new client.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid gap-2">
                <Label htmlFor="companyName" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Company Name</Label>
                <Input id="companyName" name="companyName" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="clientName" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Contact Person Name</Label>
                <Input id="clientName" name="clientName" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Email Address</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Password (For Client)</Label>
                <Input id="password" name="password" type="text" placeholder="Set a password for the client" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="servicePurchased" className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Service Purchased</Label>
                <Input id="servicePurchased" name="servicePurchased" placeholder="e.g. Social Media Management" required />
              </div>
              {error && <p className="text-destructive text-sm font-medium">{error}</p>}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Client Account"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
