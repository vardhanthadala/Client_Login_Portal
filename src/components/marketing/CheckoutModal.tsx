"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

declare global {
  interface Window {
    Razorpay: any
  }
}

const checkoutSchema = z.object({
  agencyName: z.string().min(2, "Agency name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

import Script from "next/script"

export function CheckoutModal({ triggerClassName, buttonText }: { triggerClassName?: string, buttonText?: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      agencyName: "",
      email: "",
    },
  })

  async function onSubmit(data: CheckoutFormValues) {
    setLoading(true)
    setError(null)

    if (!window.Razorpay) {
      setError("Payment gateway is still loading. Please try again.")
      setLoading(false)
      return
    }

    try {
      // 1. Create Subscription
      const res = await fetch("/api/onboarding/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      const apiData = await res.json()

      if (!res.ok) {
        throw new Error(apiData.error || "Failed to create subscription")
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: apiData.subscriptionId,
        name: "Dexze Services",
        description: "Monthly Platform Subscription",
        handler: async function (response: any) {
          try {
            setLoading(true)
            // 3. Verify Payment
            const verifyRes = await fetch("/api/onboarding/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                email: data.email,
                agencyName: data.agencyName
              })
            })
            const verifyData = await verifyRes.json()
            
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Verification failed")
            }
            
            setSuccess(true)
          } catch (err: any) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: data.agencyName,
          email: data.email,
        },
        theme: {
          color: "#5A52FF"
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", function (response: any) {
        setError(response.error.description || "Payment failed")
        setLoading(false)
      })
      rzp.open()

    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={triggerClassName || "bg-[#5A52FF] hover:bg-blue-700 text-white font-bold py-6 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"}>
        {buttonText || "Purchase Subscription"}
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-[400px] p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] gap-0 border-0 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:bg-[#111111]">
        {success ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full bg-green-400/20 blur-md animate-pulse"></div>
              <CheckCircle2 className="w-10 h-10 text-green-500 relative z-10" strokeWidth={2.5} />
            </div>
            <DialogTitle className="text-2xl font-bold font-sans text-[#0F172A] dark:text-white tracking-tight mb-3">
              Registration Successful!
            </DialogTitle>
            <DialogDescription className="text-[15px] font-medium text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-8 px-2">
              Your workspace has been created. We have sent an email with your temporary password.
            </DialogDescription>
            <Button onClick={() => window.location.href = "/client-login"} className="w-full rounded-[16px] h-12 text-[15px] font-semibold bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-[#E2E8F0] dark:text-black text-white transition-colors">
              Go to Login
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Illustrative Icon */}
            <div className="w-24 h-24 mb-6 rounded-full bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full bg-indigo-400/20 blur-md animate-pulse"></div>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500 relative z-10"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </div>

            <DialogTitle className="text-2xl font-bold font-sans text-[#0F172A] dark:text-white tracking-tight mb-3 text-center">
              Subscribe to Dexze
            </DialogTitle>
            <DialogDescription className="text-[15px] font-medium text-[#64748B] dark:text-[#94A3B8] leading-relaxed mb-6 px-2 text-center">
              Purchase your subscription for ₹2500/month to get unlimited access to the agency dashboard.
            </DialogDescription>

            <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="agencyName" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Agency Name</Label>
                <Input 
                  id="agencyName" 
                  {...register("agencyName")}
                  placeholder="Acme Corp" 
                  className={`h-12 rounded-[14px] border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1A1A] focus-visible:ring-indigo-500 ${errors.agencyName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.agencyName && (
                  <p className="text-xs text-red-500 font-medium">{errors.agencyName.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Admin Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...register("email")}
                  placeholder="admin@acme.com" 
                  className={`h-12 rounded-[14px] border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1A1A] focus-visible:ring-indigo-500 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 mt-2 rounded-[12px] bg-red-50 dark:bg-red-500/10 text-[13px] text-red-600 dark:text-red-400 font-medium border border-red-100 dark:border-red-500/20 text-center">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="w-full sm:flex-1 rounded-[16px] h-12 text-[15px] font-semibold border-[#E2E8F0] dark:border-[#333] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A]"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:flex-1 rounded-[16px] h-12 text-[15px] font-semibold bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:hover:bg-[#E2E8F0] dark:text-black text-white transition-colors"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pay & Register"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}
