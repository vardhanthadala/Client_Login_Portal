"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { CheckoutModal } from "./CheckoutModal"

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div id="pricing" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            One flat rate to manage all your company&apos;s clients. Choose what works best for you.
          </p>
          <div className="mt-8 flex justify-center items-center gap-4">
            <span className={`text-sm font-semibold ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <button
              type="button"
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[#5A52FF] transition-colors duration-200 ease-in-out focus:outline-none"
              role="switch"
              aria-checked={isYearly}
              onClick={() => setIsYearly(!isYearly)}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isYearly ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
            <span className={`text-sm font-semibold ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly <span className="text-[#5A52FF] bg-blue-50 px-2 py-0.5 rounded-full text-xs ml-1">Save 30%</span>
            </span>
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none bg-white shadow-xl"
        >
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Company Premium</h3>
            <p className="mt-6 text-base leading-7 text-gray-600">
              Get full access to the Dexze platform. Invite unlimited clients, use our Gemini AI integration, and white-label your onboarding experience.
            </p>
            <div className="mt-10 flex items-center gap-x-4">
              <h4 className="flex-none text-sm font-semibold leading-6 text-[#5A52FF]">What’s included</h4>
              <div className="h-px flex-auto bg-gray-100"></div>
            </div>
            <ul role="list" className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600 sm:grid-cols-2 sm:gap-6">
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-[#5A52FF]" /> Unlimited Client Portals</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-[#5A52FF]" /> AI Summaries & Insights</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-[#5A52FF]" /> Custom Onboarding Wizards</li>
              <li className="flex gap-x-3"><Check className="h-6 w-5 flex-none text-[#5A52FF]" /> Real-time Admin Dashboard</li>
            </ul>
          </div>
          <div className="-mt-2 p-2 lg:mt-0 lg:w-full lg:max-w-md lg:flex-shrink-0">
            <div className="rounded-2xl bg-gray-50 py-10 text-center ring-1 ring-inset ring-gray-900/5 lg:flex lg:flex-col lg:justify-center lg:py-16 h-full">
              <div className="mx-auto max-w-xs px-8">
                <p className="text-base font-semibold text-gray-600">Pay {isYearly ? 'yearly' : 'monthly'}, cancel anytime</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">₹{isYearly ? '21000' : '2500'}</span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">/{isYearly ? 'year' : 'month'}</span>
                </p>
                <div className="mt-10">
                  <CheckoutModal 
                    planType={isYearly ? 'YEARLY' : 'MONTHLY'} 
                    price={isYearly ? '₹21000/year' : '₹2500/month'}
                  />
                </div>
                <p className="mt-6 text-xs leading-5 text-gray-600">
                  Invoices and receipts available for easy company reimbursement
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

