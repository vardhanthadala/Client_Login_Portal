"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { CheckoutModal } from "./CheckoutModal"

export function Pricing() {
  return (
    <div id="pricing" className="bg-gray-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple, transparent pricing</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            One flat monthly rate to manage all your agency's clients. Cancel anytime.
          </p>
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto mt-16 max-w-2xl rounded-3xl ring-1 ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none bg-white shadow-xl"
        >
          <div className="p-8 sm:p-10 lg:flex-auto">
            <h3 className="text-2xl font-bold tracking-tight text-gray-900">Agency Premium</h3>
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
                <p className="text-base font-semibold text-gray-600">Pay monthly, cancel anytime</p>
                <p className="mt-6 flex items-baseline justify-center gap-x-2">
                  <span className="text-5xl font-bold tracking-tight text-gray-900">₹2500</span>
                  <span className="text-sm font-semibold leading-6 tracking-wide text-gray-600">/month</span>
                </p>
                <div className="mt-10">
                  <CheckoutModal />
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
