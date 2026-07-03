"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminResetClientPassword } from "@/app/actions/client"
import { KeyRound, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function ResetPasswordButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    const res = await adminResetClientPassword(clientId, newPassword)
    setLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success("Password reset successfully. An email has been sent to the client.")
      setOpen(false)
      setNewPassword("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-white h-9 px-4 py-2 border-[#E5E7EB] text-[#475569] hover:text-[#5A52FF] hover:border-[#5A52FF]/30 hover:bg-[#F8FAFC] shadow-sm"
      >
        <KeyRound className="w-4 h-4 mr-2" />
        Reset Password
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Client Password</DialogTitle>
          <DialogDescription>
            Enter a new password for this client. They will receive an email with their new login details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleReset} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[12px] text-gray-500">Must be at least 8 characters.</p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-[#5A52FF] hover:bg-[#4a42e6]">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save & Send Email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
