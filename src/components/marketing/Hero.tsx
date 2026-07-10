"use client"

import { motion, useInView, animate } from "framer-motion"
import { useEffect, useRef } from "react"
import { ArrowRight } from "lucide-react"
import Lanyard from "./Lanyard"


function CountUp({ from, to, duration = 1.2, delay = 0, suffix = "" }: { from: number, to: number, duration?: number, delay?: number, suffix?: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(from, to, {
      duration,
      delay,
      onUpdate(value) {
        if (nodeRef.current) {
          nodeRef.current.textContent = Math.round(value) + suffix;
        }
      },
    });
    return () => controls.stop();
  }, [from, to, duration, delay, inView, suffix]);

  return <span ref={nodeRef}>{from}{suffix}</span>;
}

export function Hero() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-white min-h-[95vh] md:min-h-screen lg:max-h-[1000px] pt-32 lg:pt-36 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto w-full flex-1 flex flex-col md:flex-row items-stretch">
        
        {/* Left Column */}
        <div className="w-full md:w-[55%] flex flex-col">
          
          {/* Dark Top Box (Text Content) */}
          <div className="bg-[#020611] rounded-t-[40px] md:rounded-tr-none md:rounded-bl-[40px] p-10 sm:p-12 lg:p-16 flex-1 flex flex-col justify-center">
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(2.25rem,6vw,3rem)] font-bold tracking-tight text-white leading-[1.1] mb-6 lg:mb-8"
            >
              Stop Chasing<br />Clients. Start<br /><span className="text-[#27C93F]">Scaling.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(1rem,2.5vw,1.125rem)] text-white/60 mb-10 leading-relaxed max-w-lg"
            >
              Speed up your agency workflow with our ultimate client portal. Enjoy high-quality, customizable dashboards for a seamless, stunning user experience.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button 
                onClick={() => scrollToSection('pricing')}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black rounded-full font-semibold text-sm sm:text-base transition-all hover:bg-black hover:text-white hover:scale-105 active:scale-95"
              >
                Join now <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[#1F232B] text-white rounded-full font-medium text-sm sm:text-base transition-transform hover:bg-[#2A2E37]"
              >
                Learn more
              </button>
            </motion.div>
          </div>
          
          {/* Light Bottom Box (Stats) */}
          <div className="relative pt-10 sm:pt-12 pb-4 sm:pb-8 pl-4 sm:pl-12 lg:pl-16 pr-4 sm:pr-8 bg-white md:bg-transparent">
            {/* Desktop Magic Corner for inverted curve */}
            <div className="hidden md:block absolute top-0 right-0 w-[60px] h-[60px] bg-[#020611]" />
            <div className="hidden md:block absolute inset-0 bg-white rounded-tr-[40px]" />
            
            <div className="relative z-10 flex flex-wrap gap-x-8 gap-y-6 lg:gap-x-12">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <div className="text-[clamp(1.875rem,5vw,2.25rem)] font-bold text-gray-900 mb-1"><CountUp from={0} to={50} delay={0.4} suffix="+" /></div>
                <div className="text-xs sm:text-sm font-medium text-gray-400">Agencies</div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <div className="text-[clamp(1.875rem,5vw,2.25rem)] font-bold text-gray-900 mb-1"><CountUp from={0} to={100} delay={0.5} suffix="%" /></div>
                <div className="text-xs sm:text-sm font-medium text-gray-400">White-label</div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <div className="text-[clamp(1.875rem,5vw,2.25rem)] font-bold text-gray-900 mb-1">Zero</div>
                <div className="text-xs sm:text-sm font-medium text-gray-400">Code Needed</div>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                <div className="text-[clamp(1.875rem,5vw,2.25rem)] font-bold text-gray-900 mb-1"><CountUp from={0} to={24} delay={0.7} suffix="/7" /></div>
                <div className="text-xs sm:text-sm font-medium text-gray-400">Support</div>
              </motion.div>
            </div>
          </div>

        </div>

        {/* Right Column (Lanyard Container) */}
        <div className="hidden md:flex w-full md:w-[45%] relative h-[400px] md:h-auto rounded-[40px] md:rounded-tl-none md:rounded-bl-[40px] md:rounded-tr-[40px] md:rounded-br-[40px] overflow-hidden mt-8 md:mt-0 items-center justify-center bg-[#020611]">
          {/* Flexbox sub-pixel gap patch */}
          <div className="hidden md:block absolute top-0 bottom-0 -left-[1px] w-[2px] bg-[#020611] z-20" />
          <Lanyard 
            position={[0, 0, 16]} 
            gravity={[0, -40, 0]} 
            frontImage="/card_front.svg" 
            backImage="/card_back.svg"
            lanyardImage="/lanyard_green.svg"
            imageFit="cover" 
          />
        </div>

      </div>
    </div>
  )
}
