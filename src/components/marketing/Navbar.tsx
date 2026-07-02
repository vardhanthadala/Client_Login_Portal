"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { CheckoutModal } from "./CheckoutModal"

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-[#5A52FF] rounded-lg shadow-sm flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Dexze</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors">Pricing</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="scale-90 sm:scale-100 origin-right">
              <CheckoutModal />
            </div>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
