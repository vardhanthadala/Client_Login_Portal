"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Script from "next/script"
import { useRouter } from "next/navigation"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function BillingPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubscribe() {
    setLoading(true)
    setError(null)

    try {
      // 1. Create Subscription
      const res = await fetch("/api/billing/create-subscription", {
        method: "POST"
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create subscription")
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        subscription_id: data.subscriptionId,
        name: "Dexze Services",
        description: "Monthly Platform Subscription",
        handler: async function (response: any) {
          try {
            setLoading(true)
            // 3. Verify Payment
            const verifyRes = await fetch("/api/billing/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response)
            })
            const verifyData = await verifyRes.json()
            
            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Verification failed")
            }
            
            // Redirect to dashboard to refresh layout state
            window.location.href = "/admin/dashboard"
          } catch (err: any) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Activate Your Subscription
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Your agency account is pending activation. Please subscribe to unlock your dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">Premium Plan</h3>
            <p className="text-gray-500 mt-2">Access all Dexze platform features and manage your clients seamlessly.</p>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium mb-4 bg-red-50 p-3 rounded">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubscribe}
            className="w-full flex justify-center bg-[#5A52FF] hover:bg-blue-700 text-white py-6 text-lg"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              "Pay Monthly Subscription"
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={() => window.location.href = "/api/auth/signout?callbackUrl=/login"}
            className="w-full mt-4 text-gray-500 hover:text-gray-900"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
