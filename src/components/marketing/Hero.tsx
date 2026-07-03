"use client"

import { motion } from "framer-motion"

export function Hero() {
  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8">
            Manage your clients with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5A52FF] to-fuchsia-500">
              absolute clarity.
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto mb-10">
            The ultimate client portal and onboarding platform for marketing agencies. Automate data collection, track progress, and generate AI insights in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center"
        >
          <a 
            href="#pricing"
            className="inline-block bg-[#5A52FF] hover:bg-blue-700 text-white font-bold py-4 px-10 text-lg rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
          >
            Purchase Subscription
          </a>
        </motion.div>
        
        {/* Mock App Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 mx-auto max-w-5xl relative"
        >
          <div className="rounded-2xl border border-gray-200 bg-white/50 backdrop-blur-xl shadow-2xl p-2 sm:p-4">
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 aspect-[16/9] flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <p className="text-gray-500 font-medium">Dashboard Interface Preview</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
