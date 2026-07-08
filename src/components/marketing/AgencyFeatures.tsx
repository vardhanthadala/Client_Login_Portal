"use client"

import { motion } from "framer-motion"
import { Palette, Layers, Sparkles } from "lucide-react"

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full aspect-[4/3] lg:aspect-[16/10] bg-white rounded-xl border border-black overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="h-8 border-b-[3px] border-black bg-[#f8f9fa] flex items-center px-3 gap-1.5 shrink-0">
        <div className="flex gap-1">
          <div className="w-2.5 h-2.5 rounded-full border-2 border-black bg-gray-200" />
          <div className="w-2.5 h-2.5 rounded-full border-2 border-black bg-gray-300" />
          <div className="w-2.5 h-2.5 rounded-full border-2 border-black bg-gray-400" />
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export function AgencyFeatures() {
  const features = [
    {
      id: "brand",
      icon: Palette,
      iconBg: "bg-indigo-100", // Premium indigo
      title: "Your Brand",
      description: "Connect your custom domain and upload your agency logo. To your clients, it looks like you spent $50,000 building custom software just for them.",
      buttonText: "Explore custom branding",
      replaces: ["Generic Portals", "WordPress", "Custom Dev"],
      visual: (
        <BrowserFrame>
          <div className="p-3 md:p-6 h-full flex flex-col bg-gray-50/50">
            {/* Mockup for Custom Branding */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-20 md:w-28 h-5 bg-white rounded border-2 border-black" />
              <div className="w-6 h-6 rounded-full bg-[#FCE7D1] border-2 border-black" />
            </div>
            <div className="flex-1 border-2 border-black rounded-lg bg-white flex flex-col items-center justify-center relative overflow-hidden p-3 text-center">
               <motion.div 
                 animate={{ scale: [0.95, 1.05, 0.95] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                 className="w-12 h-12 md:w-16 md:h-16 bg-[#5A52FF] rounded-xl   flex items-center justify-center mb-3"
               >
                 <span className="text-white font-black text-lg md:text-2xl tracking-tighter">YA</span>
               </motion.div>
               <h3 className="text-base md:text-lg font-bold text-black mb-2">portal.youragency.com</h3>
               <div className="w-full max-w-[150px] space-y-1.5">
                 <div className="h-4 bg-gray-100 rounded border-2 border-black w-full" />
                 <div className="h-4 bg-black rounded border-2 border-black w-full" />
               </div>
            </div>
          </div>
        </BrowserFrame>
      )
    },
    {
      id: "command",
      icon: Layers,
      iconBg: "bg-violet-100", // Premium violet
      title: "Command Central",
      description: "Manage 10 or 100 clients from a single, powerful admin dashboard. See project statuses, pending approvals, and outstanding invoices at a glance.",
      buttonText: "Explore the team hub",
      replaces: ["Asana", "Slack", "Trello"],
      visual: (
        <BrowserFrame>
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="hidden sm:block w-1/3 border-r-[3px] border-black p-2 md:p-3 bg-white space-y-2">
              <div className="flex items-center gap-1.5 mb-4">
                 <div className="w-4 h-4 rounded border-2 border-black bg-blue-100" />
                 <div className="h-2 w-12 bg-gray-200 rounded border-2 border-black" />
              </div>
              <div className="h-2 w-3/4 bg-gray-100 rounded border-2 border-black" />
              <div className="h-2 w-1/2 bg-gray-100 rounded border-2 border-black" />
              <div className="h-2 w-5/6 bg-gray-100 rounded border-2 border-black" />
              
              <div className="mt-4 pt-4 border-t-2 border-black space-y-2">
                 <div className="h-2 w-2/3 bg-gray-100 rounded border-2 border-black" />
                 <div className="h-2 w-4/5 bg-gray-100 rounded border-2 border-black" />
              </div>
            </div>
            {/* Main Content */}
            <div className="flex-1 p-2 md:p-4 flex flex-col gap-3 bg-gray-50/30">
              <div className="flex gap-3 items-center bg-white p-2 rounded-md border-2 border-black ">
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                   className="w-8 h-8 rounded-full border-2 border-black border-t-[#5A52FF] border-r-transparent"
                />
                <div className="flex-1 space-y-1.5">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full border border-black" />
                  <div className="h-1.5 w-3/4 bg-gray-200 rounded-full border border-black" />
                </div>
              </div>
              <div className="flex-1 border-2 border-black rounded-md bg-white p-2  overflow-hidden">
                <div className="h-3 w-1/3 bg-[#FFE4D6] rounded border border-black mb-2" />
                <div className="space-y-1.5">
                  <motion.div 
                    initial={{ x: -5 }}
                    animate={{ x: 0 }}
                    transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                    className="h-6 w-full bg-green-50 rounded border border-black flex items-center px-1.5 gap-1.5"
                  >
                     <div className="w-2 h-2 rounded-full bg-green-400 border border-black" />
                     <div className="h-1 w-1/2 bg-green-200 rounded border border-black" />
                  </motion.div>
                  <div className="h-6 w-full bg-red-50 rounded border border-black flex items-center px-1.5 gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-red-400 border border-black" />
                     <div className="h-1 w-2/3 bg-red-200 rounded border border-black" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </BrowserFrame>
      )
    },
    {
      id: "ai",
      icon: Sparkles,
      iconBg: "bg-blue-100", // Premium blue
      title: "AI Onboarding",
      description: "Our AI-powered wizard collects brand assets, competitors, and preferences effortlessly. We even generate an AI summary of their brand voice.",
      buttonText: "Explore AI features",
      replaces: ["Typeform", "Google Forms", "PDFs"],
      visual: (
        <BrowserFrame>
          <div className="p-3 md:p-6 h-full flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FFF0D4]/40 to-white">
             <motion.div 
               animate={{ y: [-2, 2, -2] }}
               transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
               className="w-full max-w-[220px] border-2 border-black rounded-lg bg-white p-3 "
             >
               <div className="flex items-center gap-2 mb-3 border-b border-black pb-2">
                 <div className="w-6 h-6 rounded bg-yellow-100 border border-black flex items-center justify-center">
                   <Sparkles className="w-3 h-3 text-black" />
                 </div>
                 <h4 className="font-black text-sm md:text-base">Brand Voice AI</h4>
               </div>
               <div className="space-y-2">
                 <motion.div 
                   initial={{ width: "0%" }}
                   whileInView={{ width: "100%" }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   viewport={{ once: false }}
                   className="h-2 bg-gray-200 border border-black rounded-full"
                 />
                 <motion.div 
                   initial={{ width: "0%" }}
                   whileInView={{ width: "80%" }}
                   transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                   viewport={{ once: false }}
                   className="h-2 bg-gray-200 border border-black rounded-full"
                 />
                 <motion.div 
                   initial={{ width: "0%" }}
                   whileInView={{ width: "65%" }}
                   transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                   viewport={{ once: false }}
                   className="h-2 bg-gray-200 border border-black rounded-full"
                 />
               </div>
               <div className="mt-4 flex gap-1.5 flex-wrap">
                 <span className="px-1.5 py-0.5 bg-[#FCE7D1] border border-black rounded font-bold text-[8px] uppercase tracking-wider">Professional</span>
                 <span className="px-1.5 py-0.5 bg-green-100 border border-black rounded font-bold text-[8px] uppercase tracking-wider">Authoritative</span>
               </div>
             </motion.div>
          </div>
        </BrowserFrame>
      )
    }
  ]

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
      <div className="px-4 sm:px-8 lg:px-12">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24 flex flex-col items-center">
          <div className="flex items-center w-full max-w-md mx-auto mb-6">
            <div className="flex-1 h-[3px] bg-black rounded-full"></div>
            <p className="px-4 text-sm sm:text-base text-black font-black uppercase tracking-widest">
              For the Agency
            </p>
            <div className="flex-1 h-[3px] bg-black rounded-full"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-black leading-[1.1]">
            Everything you need to <span className="text-[#27C93F]">scale operations</span>.
          </h2>
        </div>

        <div className="space-y-16 lg:space-y-24">
          {features.map((feature, i) => (
            <div key={feature.id} className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              
              {/* Left Column - Text Content */}
              <div className="w-full lg:w-[45%] flex flex-col items-start order-2 lg:order-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 border-black ${feature.iconBg} flex items-center justify-center  shrink-0`}>
                    <feature.icon className="w-4 h-4 md:w-5 md:h-5 text-black" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-black leading-none">
                    {feature.title}
                  </h3>
                </div>
                
                <p className="text-sm md:text-base text-gray-600 font-medium leading-relaxed mb-5">
                  {feature.description}
                </p>
                
                <button className="bg-black text-white px-4 py-2 rounded-md font-bold text-xs md:text-sm border-2 border-black hover:bg-gray-800 hover: transition-all duration-200">
                  {feature.buttonText}
                </button>

                <div className="w-full mt-6 pt-4 border-t-2 border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Replaces</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.replaces.map((tool, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-gray-500 font-bold bg-white px-2.5 py-1 rounded-md border border-gray-200 text-xs shadow-sm">
                        {tool}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Visual Mockup */}
              <div className="w-full lg:w-[55%] order-1 lg:order-2">
                {feature.visual}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
