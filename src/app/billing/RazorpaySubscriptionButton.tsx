"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"
import { toast } from "sonner" // assuming sonner is used, or fallback to alert

export default function RazorpaySubscriptionButton() {
  const [loading, setLoading] = useState(false)
  const [planType, setPlanType] = useState<"MONTHLY" | "YEARLY">("MONTHLY")
  const router = useRouter()

  const handleSubscribe = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/razorpay/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription")
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: "Dexze SaaS",
        description: `${planType === 'YEARLY' ? 'Yearly' : 'Monthly'} Subscription Renewal`,
        handler: async function (response: any) {
          try {
            setLoading(true)
            // 3. Verify Payment
            const verifyRes = await fetch("/api/billing/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                planType
              })
            })
            const verifyData = await verifyRes.json()
            
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Verification failed")
            }
            
            toast?.success?.("Subscription activated successfully!") || alert("Subscription activated successfully!")
            setTimeout(() => {
              window.location.href = "/admin/dashboard" // Force full refresh to clear any layout state
            }, 1000)
          } catch (err: any) {
            toast?.error?.(err.message) || alert(err.message)
            setLoading(false)
          }
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
      <div className="flex flex-col gap-3">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            type="button"
            onClick={() => setPlanType("MONTHLY")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${planType === "MONTHLY" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Monthly (₹2,500)
          </button>
          <button 
            type="button"
            onClick={() => setPlanType("YEARLY")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${planType === "YEARLY" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            Yearly (₹21,000)
          </button>
        </div>
        <button 
          onClick={handleSubscribe} 
          disabled={loading}
          className="w-full bg-[#5A52FF] text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed shadow"
        >
          {loading ? "Processing..." : `Renew ${planType === 'YEARLY' ? 'Yearly' : 'Monthly'} Subscription`}
        </button>
      </div>
    </>
  )
}
