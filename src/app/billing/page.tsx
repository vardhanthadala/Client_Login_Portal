import { redirect } from "next/navigation"
import { auth } from "@/auth"
import RazorpaySubscriptionButton from "./RazorpaySubscriptionButton"

export default async function BillingPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-10 rounded-2xl shadow max-w-lg text-center border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Subscription Expired</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your company's subscription has expired or is currently inactive. Please renew your subscription to restore access for you and your clients.
        </p>
        
        <div className="space-y-4">
          <RazorpaySubscriptionButton />
          <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
