"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"

export function BeforeAfter() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  // Apply a spring physics model to the scroll progress to make the animation buttery smooth
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  // First card fades out and scales down slightly as you scroll down
  const card1Scale = useTransform(smoothProgress, [0, 1], [1, 0.6])
  const card1Opacity = useTransform(smoothProgress, [0, 1], [1, 0])
  const card1Filter = useTransform(smoothProgress, [0, 1], ["blur(0px)", "blur(12px)"])
  const card1Rotate = useTransform(smoothProgress, [0, 1], [0, 10]) // Tilts clockwise up to 10 degrees

  // Second card slides up from the bottom (offscreen to 0)
  const card2Y = useTransform(smoothProgress, [0, 1], ["100vh", "0%"])

  return (
    <div ref={containerRef} className="relative h-[200vh] bg-[#FAFAFA] mt-32 md:mt-40">
      
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center z-20 bg-[#FAFAFA] md:bg-transparent">
        
        {/* Background Title */}
        <div className="absolute top-2 lg:-top-12 left-0 right-0 flex flex-col items-center pointer-events-none z-0 hidden md:flex overflow-hidden">
          <p className="font-sans text-lg sm:text-xl font-bold text-black mb-4 tracking-wide">(Before Vs <span className="text-[#27C93F]">After</span>)</p>
          <h2 
            className="text-[80px] sm:text-[100px] lg:text-[130px] font-bold text-gray-200 tracking-tighter leading-none select-none whitespace-nowrap"
            style={{ WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 80%)' }}
          >
            Old Way vs Dexze Way
          </h2>
        </div>
        
        {/* The container for stacking */}
        <div className="relative w-full max-w-[1300px] 2xl:max-w-[1700px] min-[2000px]:max-w-[2100px] h-[550px] lg:h-[600px] mx-4 sm:mx-6 lg:mx-8 z-10 mt-12 lg:mt-16">
          
          {/* Card 1: Before */}
          <motion.div 
            style={{ scale: card1Scale, opacity: card1Opacity, filter: card1Filter, rotate: card1Rotate }}
            className="absolute inset-0 bg-[#0A0A0A] rounded-[32px] lg:rounded-[48px] p-8 lg:p-16 overflow-hidden shadow-2xl flex flex-col lg:flex-row transform-gpu origin-center"
          >
             {/* Glow */}
             <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-amber-600/15 rounded-full blur-[140px] pointer-events-none" />
             
             {/* Left Column */}
             <div className="relative z-10 w-full lg:w-[35%] flex flex-col justify-between mb-8 lg:mb-0">
                <div className="hidden lg:block">
                  <p className="text-white/70 text-lg leading-relaxed max-w-sm font-medium">
                    Before Dexze, agencies drown in endless email threads, scattered files, and delayed client approvals. It's a logistical nightmare.
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-sm font-bold tracking-widest mb-3 uppercase">01 / 02</p>
                  <h3 className="text-white text-5xl lg:text-7xl font-bold tracking-tight">The Chaos</h3>
                </div>
             </div>

             {/* Center Column (Image) */}
             <div className="relative z-10 w-full lg:w-[40%] lg:px-4 flex-1 lg:flex-none">
                <div className="w-full h-full bg-[#141414] rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center relative group">
                   <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                   <img src="/chaos.png.jpg" alt="Messy Workspace" className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700" />
                </div>
             </div>

             {/* Right Column */}
             <div className="relative z-10 hidden lg:flex w-[25%] flex-col gap-12 pl-12 xl:pl-16">
                <div>
                  <p className="text-white/40 text-sm font-medium mb-3">Status</p>
                  <p className="text-white text-3xl font-bold tracking-tight">Lost Files</p>
                </div>
                <div>
                  <p className="text-white/40 text-sm font-medium mb-3">Impact</p>
                  <p className="text-white text-lg font-medium">Client Frustration</p>
                </div>
                <div>
                  <p className="text-white/40 text-sm font-medium mb-4">Symptoms</p>
                  <ul className="text-white/90 text-sm space-y-3 font-medium">
                    <li>Scattered Communication</li>
                    <li>Delayed Payments</li>
                    <li>Scope Creep</li>
                    <li>Agency Burnout</li>
                  </ul>
                </div>
             </div>
          </motion.div>

          {/* Card 2: After */}
          <motion.div 
            style={{ y: card2Y }}
            className="absolute inset-0 bg-[#0F0A11] rounded-[32px] lg:rounded-[48px] p-8 lg:p-16 overflow-hidden shadow-[0_-20px_100px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row transform-gpu"
          >
             {/* Glow */}
             <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[#5A52FF]/20 rounded-full blur-[140px] pointer-events-none" />
             
             {/* Left Column */}
             <div className="relative z-10 w-full lg:w-[35%] flex flex-col justify-between mb-8 lg:mb-0">
                <div className="hidden lg:block">
                  <p className="text-white/70 text-lg leading-relaxed max-w-sm font-medium">
                    With Dexze, your clients get a white-labeled, premium portal. Everything is organized, approvals are instant, and you look like a million bucks.
                  </p>
                </div>
                <div>
                  <p className="text-white/50 text-sm font-bold tracking-widest mb-3 uppercase">02 / 02</p>
                  <h3 className="text-white text-5xl lg:text-7xl font-bold tracking-tight">The Clarity</h3>
                </div>
             </div>

             {/* Center Column (Image) */}
             <div className="relative z-10 w-full lg:w-[40%] lg:px-4 flex-1 lg:flex-none">
                <div className="w-full h-full bg-[#1A1820] rounded-2xl border border-[#5A52FF]/20 overflow-hidden flex items-center justify-center relative group">
                   <div className="absolute inset-0 bg-gradient-to-t from-[#5A52FF]/20 to-transparent z-10" />
                   <img src="/clarity.png.jpg" alt="Clean Dashboard" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" />
                </div>
             </div>

             {/* Right Column */}
             <div className="relative z-10 hidden lg:flex w-[25%] flex-col gap-12 pl-12 xl:pl-16">
                <div>
                  <p className="text-white/40 text-sm font-medium mb-3">Status</p>
                  <p className="text-white text-3xl font-bold tracking-tight">Centralized Hub</p>
                </div>
                <div>
                  <p className="text-white/40 text-sm font-medium mb-3">Impact</p>
                  <p className="text-white text-lg font-medium">Premium Experience</p>
                </div>
                <div>
                  <p className="text-white/40 text-sm font-medium mb-4">Features</p>
                  <ul className="text-white/90 text-sm space-y-3 font-medium">
                    <li>White-labeled Portal</li>
                    <li>1-Click Approvals</li>
                    <li>Automated Invoices</li>
                    <li>Happy Clients</li>
                  </ul>
                </div>
             </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
