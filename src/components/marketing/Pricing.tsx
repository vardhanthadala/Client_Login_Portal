"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Check, Sparkles, Rocket, Zap } from "lucide-react"
import { CheckoutModal } from "./CheckoutModal"
import { useRef, useState } from "react"

type Currency = 'INR' | 'USD'

export function Pricing() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currency, setCurrency] = useState<Currency>('INR')
  
  // Track scroll progress through the stacking container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // The standard card shrinks and fades slightly as the premium card scrolls up over it
  const standardScale = useTransform(scrollYProgress, [0, 0.4, 1], [1, 1, 0.95])
  const standardOpacity = useTransform(scrollYProgress, [0, 0.4, 1], [1, 1, 0.7])

  const features = [
    "Unlimited Client Portals",
    "AI Summaries & Insights",
    "Custom Onboarding Wizards",
    "Real-time Admin Dashboard"
  ]

  return (
    <div id="pricing" className="bg-[#FAFAFA] py-24 sm:py-32 relative">
      
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-4">
          <Zap className="w-3.5 h-3.5 text-[#27C93F] fill-[#27C93F]" />
          <span className="text-[11px] sm:text-xs font-bold text-gray-600 uppercase tracking-widest">
            Premium Subscriptions
          </span>
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111111] mb-6 whitespace-nowrap">
          World-Class Design, <span className="text-[#27C93F]">Flexible Terms</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Get elite agency-level design delivery on a predictable subscription. Pause or cancel anytime to perfectly match your project flow.
        </p>
      </div>

      {/* Currency Toggle */}
      <div className="flex justify-center mb-16 sm:mb-24 relative z-10">
        <div className="bg-[#D1D1D1]/40 backdrop-blur-sm p-1 rounded-full inline-flex border border-[#C1C1C1]/50 shadow-inner">
          <button
            onClick={() => setCurrency('INR')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              currency === 'INR' 
                ? 'bg-white text-black shadow-md transform scale-105' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            INR (₹)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              currency === 'USD' 
                ? 'bg-white text-black shadow-md transform scale-105' 
                : 'text-gray-600 hover:text-black'
            }`}
          >
            USD ($)
          </button>
        </div>
      </div>

      {/* Stacking Cards Container */}
      <div ref={containerRef} className="relative mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        
        {/* Monthly Plan (Sticky) */}
        <motion.div 
          style={{ scale: standardScale, opacity: standardOpacity }}
          className="sticky top-[100px] sm:top-[120px] z-0 w-full transform-gpu"
        >
          <div className="w-full bg-[#F5F5F5] rounded-[24px] sm:rounded-[32px] p-8 sm:p-12 flex flex-col md:flex-row gap-12 md:gap-8 shadow-2xl border border-white/50">
            
            {/* Left Column */}
            <div className="flex-1 flex flex-col">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-black mb-4">Monthly Plan</h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8 max-w-[90%]">
                Get full access to the Dexze platform. Invite unlimited clients, use our Gemini AI integration, and white-label your onboarding experience.
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-bold text-[#27C93F]">What's included</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 flex-1 content-start">
                {features.map((feature) => (
                  <div key={feature} className="flex gap-x-3 items-center">
                    <Check className="h-4 w-4 text-[#27C93F] flex-none" strokeWidth={3} />
                    <span className="text-gray-700 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-[0.8] flex flex-col items-center justify-center">
              <span className="text-gray-600 font-medium mb-4 text-center">Pay monthly, cancel anytime</span>
              <div className="flex items-baseline gap-x-2 mb-8">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-black">
                  {currency === 'INR' ? '₹2500' : '$99'}
                </span>
                <span className="text-sm font-bold text-gray-500">/month</span>
              </div>
              
              <CheckoutModal 
                buttonText="Purchase Subscription"
                triggerClassName="w-full max-w-[280px] py-3.5 rounded-full bg-zinc-900 text-white hover:bg-white hover:text-black text-[15px] font-bold transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_20px_-4px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 mb-6 border border-zinc-700/50 hover:border-white"
              />
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Invoices and receipts available for easy company reimbursement
              </p>
            </div>
          </div>
        </motion.div>

        {/* Yearly Plan (Also Sticky so it perfectly locks on top of the standard plan) */}
        <div className="sticky top-[100px] sm:top-[120px] z-10 w-full mt-[30vh] sm:mt-[40vh]">
          <div className="w-full rounded-[24px] sm:rounded-[32px] p-8 sm:p-12 flex flex-col md:flex-row gap-12 md:gap-8 shadow-[0_-20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden border border-gray-800 bg-black">
            
            {/* Vertical Blue Aurora / Ribbed Curtain Backdrop */}
            <div 
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                background: `
                  linear-gradient(to right, #000000 0%, #000000 35%, transparent 90%),
                  repeating-linear-gradient(to right, 
                    rgba(15, 23, 42, 0) 0%, 
                    rgba(59, 130, 246, 0.35) 3%, 
                    rgba(0, 0, 0, 0.4) 6%, 
                    rgba(15, 23, 42, 0) 9%
                  ),
                  repeating-linear-gradient(to right, 
                    rgba(15, 23, 42, 0) 0%, 
                    rgba(59, 130, 246, 0.45) 8%, 
                    rgba(0, 0, 0, 0.5) 16%, 
                    rgba(15, 23, 42, 0) 24%
                  ),
                  linear-gradient(to right, #000000 0%, #000000 20%, #020617 35%, #0F2A66 55%, #1D4ED8 80%, #3B82F6 100%)
                `
              }}
            />

            {/* Left Column */}
            <div className="flex-1 flex flex-col relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-4">Yearly Plan</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 max-w-[90%]">
                Get full access to the Dexze platform. Invite unlimited clients, use our Gemini AI integration, and white-label your onboarding experience.
              </p>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-bold text-[#3B82F6]">What's included</span>
                <div className="flex-1 h-px bg-gray-800/80" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 flex-1 content-start">
                {features.map((feature) => (
                  <div key={feature} className="flex gap-x-3 items-center">
                    <Check className="h-4 w-4 text-[#3B82F6] flex-none" strokeWidth={3} />
                    <span className="text-gray-200 text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="flex-[0.8] flex flex-col items-center justify-center relative z-10">
              <span className="text-gray-400 font-medium mb-4 text-center">Pay yearly, cancel anytime</span>
              <div className="flex items-baseline gap-x-2 mb-8">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                  {currency === 'INR' ? '₹21000' : '$990'}
                </span>
                <span className="text-sm font-bold text-gray-400">/year</span>
              </div>
              
              <CheckoutModal 
                buttonText="Purchase Subscription"
                triggerClassName="w-full max-w-[280px] py-3.5 rounded-full bg-blue-600 text-white hover:bg-white hover:text-blue-600 text-[15px] font-bold transition-all duration-300 shadow-[0_8px_16px_-4px_rgba(37,99,235,0.4)] hover:shadow-[0_12px_24px_-4px_rgba(255,255,255,0.5)] hover:-translate-y-0.5 mb-6 border border-blue-400/30 hover:border-white"
              />
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                Invoices and receipts available for easy company reimbursement
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
