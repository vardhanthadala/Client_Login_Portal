"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { toast } from "sonner" // assuming sonner is used, or fallback to alert

export default function RazorpaySubscriptionButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/razorpay/subscription", {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription")
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: "Dexze SaaS",
        description: "Agency Subscription",
        handler: function (response: any) {
          // Razorpay returns razorpay_payment_id, razorpay_subscription_id, razorpay_signature
          // Verification should ideally happen on the backend via webhook,
          // but we can optimistic-reload here or call a verify endpoint.
          toast?.success?.("Subscription activated successfully!") || alert("Subscription activated successfully!")
          setTimeout(() => {
            router.push("/admin/dashboard") // Or force refresh
            router.refresh()
          }, 2000)
        },
        theme: {
          color: "#5A52FF",
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error: any) {
      console.error(error)
      toast?.error?.(error.message) || alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <button 
        onClick={handleSubscribe} 
        disabled={loading}
        className="w-full bg-[#5A52FF] text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Processing..." : "Renew Subscription"}
      </button>
    </>
  )
}
