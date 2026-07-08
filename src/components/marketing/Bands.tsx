"use client"

import { motion } from "framer-motion"

const texts1 = [
  "White-labeled Portal",
  "1-Click Approvals",
  "File Management",
  "Custom Branding",
  "Automated Invoices",
  "Secure Login",
  "Client Dashboard"
]

const texts2 = [
  "No More Scattered Emails",
  "Seamless Communication",
  "Premium Experience",
  "Happy Clients",
  "Organized Workflows",
  "Faster Payments",
  "Agency Growth"
]

function StarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-4 sm:mx-8 scale-[0.45]">
      <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="currentColor"/>
    </svg>
  )
}

function MarqueeRow({ items, className, reverse = false }: { items: string[], className: string, reverse?: boolean }) {
  return (
    <div className={`flex overflow-hidden whitespace-nowrap py-0.5 sm:py-1 ${className}`}>
      <motion.div
        initial={{ x: reverse ? "-50%" : "0%" }}
        animate={{ x: reverse ? "0%" : "-50%" }}
        transition={{ duration: 70, repeat: Infinity, ease: "linear" }}
        className="flex items-center min-w-max"
      >
        {[...items, ...items, ...items, ...items, ...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center">
            <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight px-2 leading-none">{text}</span>
            <StarIcon />
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function Bands() {
  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden flex items-center justify-center bg-transparent mt-16 md:mt-24 mb-16 z-30">
      
      {/* Floating container for the "moving up and down" effect */}
      <motion.div
        animate={{ y: [-15, 15, -15] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        {/* White band (tilted up slightly) */}
        <div className="absolute top-1/2 left-[-10vw] w-[120vw] -translate-y-1/2 -rotate-[6deg] transform-gpu z-10 shadow-2xl">
          <MarqueeRow 
            items={texts2} 
            className="bg-[#F8F9FA] text-[#0A0A0A]" 
            reverse={false}
          />
        </div>

        {/* Orange band (tilted down slightly) */}
        <div className="absolute top-1/2 left-[-10vw] w-[120vw] -translate-y-1/2 rotate-[6deg] transform-gpu z-20 shadow-2xl">
          <MarqueeRow 
            items={texts1} 
            className="bg-[#27C93F] text-white" 
            reverse={true}
          />
        </div>
      </motion.div>
    </div>
  )
}
