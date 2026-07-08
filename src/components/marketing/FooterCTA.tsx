"use client"

import { motion } from "framer-motion"

export function FooterCTA() {
  const scrollToPricing = () => {
    const element = document.getElementById('pricing')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-[#FAFAFA] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1200px] mx-auto relative pt-20 pb-28 sm:pt-28 sm:pb-36 overflow-hidden rounded-[32px] sm:rounded-[40px] bg-gradient-to-b from-[#050505] via-[#111111] to-[#0A0A0A] shadow-sm">
        
        {/* SVG Dunes Background */}
        <svg 
          viewBox="0 0 1440 320" 
          preserveAspectRatio="none" 
          className="absolute bottom-0 left-0 w-full h-[120px] sm:h-[250px] pointer-events-none z-0"
        >
          <defs>
            <linearGradient id="dune1" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stopColor="#146620" stopOpacity="0.8" />
  <stop offset="100%" stopColor="#050505" stopOpacity="1" />
</linearGradient>
            <linearGradient id="dune2" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stopColor="#1d9931" stopOpacity="0.9" />
  <stop offset="100%" stopColor="#050505" stopOpacity="1" />
</linearGradient>
            <linearGradient id="dune3" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stopColor="#27C93F" stopOpacity="1" />
  <stop offset="100%" stopColor="#050505" stopOpacity="1" />
</linearGradient>
          </defs>
          
          {/* Back Dune (Right bias) */}
          <path fill="url(#dune1)" d="M0,128 C380,256, 720,32, 1160,128 C1300,160, 1380,144, 1440,128 L1440,320 L0,320 Z"></path>
          
          {/* Middle Dune (Left bias) */}
          <path fill="url(#dune2)" d="M0,224 C480,320, 820,64, 1440,192 L1440,320 L0,320 Z"></path>
          
          {/* Front Dune (Soft Lavender instead of white) */}
          <path fill="url(#dune3)" d="M0,280 C600,128, 1000,340, 1440,256 L1440,320 L0,320 Z"></path>
        </svg>

        {/* Content */}
        <div className="relative z-10 max-w-[800px] mx-auto px-4 sm:px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl md:text-5xl leading-[1.1] font-serif tracking-tight text-white mb-8 sm:mb-10"
          >
          Bring clarity, structure, and speed to your client portals
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <button 
            onClick={scrollToPricing}
            className="px-8 py-3.5 bg-[#27C93F] text-black hover:bg-white hover:text-black rounded-full font-medium text-[15px] transition-colors duration-300 shadow-lg"
          >
            Start your Workspace
          </button>
        </motion.div>
      </div>
    </div>
    </div>
  )
}
