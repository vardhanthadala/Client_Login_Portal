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

export function CheckoutModal() {
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
      <DialogTrigger className="bg-[#5A52FF] hover:bg-blue-700 text-white font-bold py-6 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
        Purchase Subscription
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {success ? (
          <div className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Registration Successful!</h3>
            <p className="text-gray-500">
              Your workspace has been created. We have sent an email with your temporary password.
            </p>
            <Button onClick={() => window.location.href = "/login"} className="w-full mt-4 bg-[#5A52FF]">
              Go to Login
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Subscribe to Dexze</DialogTitle>
              <DialogDescription>
                Fill out this form to purchase your subscription. For ₹2500/month, you get unlimited access to the agency dashboard and client portals.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="agencyName">Agency Name</Label>
                <Input 
                  id="agencyName" 
                  {...register("agencyName")}
                  placeholder="Acme Corp" 
                  className={errors.agencyName ? "border-red-500" : ""}
                />
                {errors.agencyName && (
                  <p className="text-sm text-red-500">{errors.agencyName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...register("email")}
                  placeholder="admin@acme.com" 
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 rounded bg-red-50 text-sm text-red-500 font-medium border border-red-100">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-[#5A52FF] hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pay & Register"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  )
}
