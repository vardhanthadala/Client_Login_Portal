import Razorpay from "razorpay"
import { AlertTriangle } from "lucide-react"

export async function SubscriptionBanner({ razorpaySubscriptionId }: { razorpaySubscriptionId: string | null }) {
  if (!razorpaySubscriptionId) return null

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  try {
    const subscription = await razorpay.subscriptions.fetch(razorpaySubscriptionId)
    
    // current_end is a Unix timestamp in seconds
    if (!subscription.current_end) return null
    
    const endDate = new Date(subscription.current_end * 1000)
    const now = new Date()
    
    // Calculate difference in days
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Show banner if subscription is active and ending within 5 days
    if (subscription.status === "active" && diffDays > 0 && diffDays <= 5) {
      return (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-700 font-medium">
              Your subscription billing cycle ends in {diffDays} {diffDays === 1 ? 'day' : 'days'} ({endDate.toLocaleDateString()}). 
              It will automatically renew and debit from your saved payment method.
            </p>
          </div>
        </div>
      )
    }
  } catch (error) {
    console.error("Failed to fetch subscription for banner:", error)
  }

  return null
}
