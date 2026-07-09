"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Zap } from "lucide-react"
import Image from "next/image"

const baseLogos = [
  { name: "Shopify", src: "/images/logos/shopify.svg", color: "#95BF47" },
  { name: "Stripe", src: "/images/logos/stripe.svg", color: "#008CDD" },
  { name: "Notion", src: "/images/logos/notion.svg", color: "#000000" },
  { name: "Figma", src: "/images/logos/figma.svg", color: "#F24E1E" },
  { name: "Slack", src: "/images/logos/slack.svg", color: "#E01E5A" },
  { name: "Webflow", src: "/images/logos/webflow.svg", color: "#4353FF" },
  { name: "HubSpot", src: "/images/logos/hubspot.svg", color: "#FF7A59" },
  { name: "Mailchimp", src: "/images/logos/mailchimp.svg", color: "#FFE01B" },
  { name: "Canva", src: "/images/logos/canva.svg", color: "#00C4CC" },
  { name: "Asana", src: "/images/logos/asana.svg", color: "#F06A6A" },
  { name: "Monday", src: "/images/logos/monday.svg", color: "#FF3D57" },
  { name: "Zoom", src: "/images/logos/zoom.svg", color: "#2D8CFF" },
]
const logos = [...baseLogos, ...baseLogos] // 24 logos total for a dense, seamless orbit

// Generate the CSS keyframes for the 3D orbit
const generateKeyframes = () => {
  let frames = ""
  for (let i = 0; i <= 100; i++) {
    const angle = (i / 100) * Math.PI * 2
    const x = Math.cos(angle).toFixed(4)
    const z = Math.sin(angle) // 1 is front, -1 is back
    const y = z.toFixed(4)
    const scale = (0.65 + ((z + 1) / 2) * 0.35).toFixed(4)
    const opacity = (0.15 + ((z + 1) / 2) * 0.85).toFixed(4)
    const blur = Math.max(0, (1 - z) * 1.5).toFixed(4)
    
    frames += `${i}% {
      transform: translate(calc(var(--orbit-rx) * ${x}), calc(var(--orbit-ry) * ${y})) scale(${scale});
      opacity: ${opacity};
      filter: blur(${blur}px);
      z-index: ${Math.round(z * 100)};
    }\n`
  }
  return `@keyframes orbit-3d { ${frames} }`
}

export function LogoMarquee() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative py-24 sm:py-32 bg-[#FAFAFA] overflow-hidden border-y border-gray-100">
      
      {/* Subtle background particles */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <div className="absolute top-[20%] left-[10%] w-1.5 h-1.5 bg-gray-300 rounded-full blur-[1px] animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="absolute top-[60%] left-[20%] w-2 h-2 bg-gray-200 rounded-full blur-[2px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-[30%] right-[15%] w-1 h-1 bg-gray-400 rounded-full blur-[1px] animate-pulse" style={{ animationDuration: '5s' }} />
        <div className="absolute top-[75%] right-[25%] w-2.5 h-2.5 bg-gray-200 rounded-full blur-[2.5px] animate-pulse" style={{ animationDuration: '3.5s' }} />
        <div className="absolute top-[45%] left-[80%] w-1.5 h-1.5 bg-gray-300 rounded-full blur-[1.5px] animate-pulse" style={{ animationDuration: '4.5s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.215, 0.610, 0.355, 1.000] }}
        className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center"
      >
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-8">
          <Zap className="w-3.5 h-3.5 text-[#27C93F] fill-[#27C93F]" />
          <span className="text-[11px] sm:text-xs font-bold text-gray-600 uppercase tracking-widest">
            Trusted by 50+ Agencies Worldwide
          </span>
        </div>
        
        {/* Main Heading */}
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-center text-black tracking-tight max-w-[900px] leading-[1.05] mb-20 md:mb-32">
          Trusted by the teams building the <span className="text-[#27C93F]">world&apos;s best brands.</span>
        </h2>

        {/* Orbit Stage */}
        <div className="orbit-container relative w-full h-[380px] md:h-[550px] flex items-center justify-center">
          
          {/* Central Dexze Logo (The Sun) */}
          <div 
            className="absolute top-1/2 left-1/2 z-0 flex items-center justify-center pointer-events-none"
            style={{ transform: 'translate(-50%, -50%) translateZ(-100px)' }}
          >
            {/* Atmospheric Glow */}
            <div className="absolute w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0)_60%)] rounded-full -z-10" />
            <div className="absolute w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(90,82,255,0.06)_0%,rgba(90,82,255,0)_60%)] rounded-full -z-10 animate-pulse" style={{ animationDuration: '4s' }} />
            
            <Image 
              src="/images/logo.png" 
              alt="Dexze Logo" 
              width={320}
              height={320}
              priority
              className="w-40 h-40 md:w-56 md:h-56 lg:w-[320px] lg:h-[320px] object-contain relative z-10 animate-sun pointer-events-auto hover:scale-110 transition-transform duration-700"
              style={{
                filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.12)) drop-shadow(0 0 60px rgba(255,255,255,1))'
              }}
            />
          </div>

          {mounted && logos.map((logo, i) => {
            // Distribute animation delay evenly across the 40s duration
            const delay = -(i * (40 / logos.length))
            return (
              <div
                key={i}
                className="logo-orbit-wrapper group"
                style={{
                  animationDelay: `${delay}s`,
                }}
              >
                <div className="logo-inner flex items-center justify-center gap-2.5 px-3 py-2 md:px-5 md:py-2.5">
                  <div 
                    className="w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                    style={{
                      WebkitMaskImage: `url(${logo.src})`,
                      WebkitMaskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      backgroundColor: logo.color
                    }}
                  />
                  <span className="font-bold text-gray-800 text-[14px] md:text-[17px] tracking-tight">{logo.name}</span>
                </div>
              </div>
            )
          })}
        </div>

      </motion.div>

      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          /* Mobile: Circular Orbit */
          --orbit-rx: 130px;
          --orbit-ry: 130px;
        }
        @media (min-width: 640px) {
          :root {
            /* Tablet: Small Ellipse */
            --orbit-rx: 300px;
            --orbit-ry: 120px;
          }
        }
        @media (min-width: 1024px) {
          :root {
            /* Laptop: Medium Ellipse */
            --orbit-rx: 460px;
            --orbit-ry: 180px;
          }
        }
        @media (min-width: 1440px) {
          :root {
            /* Desktop: Large Ellipse */
            --orbit-rx: 620px;
            --orbit-ry: 220px;
          }
        }

        ${generateKeyframes()}

        .orbit-container {
          perspective: 1000px;
        }

        .logo-orbit-wrapper {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 130px;
          height: 50px;
          margin-top: -25px;
          margin-left: -65px;
          animation: orbit-3d 40s linear infinite;
          cursor: pointer;
          will-change: transform, opacity, filter;
        }

        @media (min-width: 768px) {
          .logo-orbit-wrapper {
            width: 170px;
            height: 60px;
            margin-top: -30px;
            margin-left: -85px;
          }
        }

        @keyframes sun-float {
          0% { transform: translateY(0px) rotateX(6deg) rotateY(-4deg); }
          50% { transform: translateY(-16px) rotateX(-6deg) rotateY(4deg); }
          100% { transform: translateY(0px) rotateX(6deg) rotateY(-4deg); }
        }

        .animate-sun {
          animation: sun-float 12s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        /* When any logo is hovered, pause the entire orbit to prevent collisions */
        .orbit-container:has(.logo-orbit-wrapper:hover) .logo-orbit-wrapper {
          animation-play-state: paused !important;
        }

        /* Hover forces the specifically hovered logo to the front/sharp */
        .logo-orbit-wrapper:hover {
          opacity: 1 !important;
          filter: blur(0px) !important;
          z-index: 1000 !important;
        }

        .logo-inner {
          width: 100%;
          height: 100%;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
          border: 1px solid rgba(0,0,0,0.06);
          box-shadow: 0 4px 12px rgba(0,0,0,0.02);
        }

        /* Inner scale, shadow, and elevation effect */
        .logo-orbit-wrapper:hover .logo-inner {
          transform: scale(1.06) translateY(-2px);
          box-shadow: 0 16px 20px -5px rgba(0,0,0,0.06), 0 6px 8px -4px rgba(0,0,0,0.03);
          border-color: rgba(0,0,0,0.1);
          background: #ffffff;
        }
      `}} />
    </section>
  )
}
