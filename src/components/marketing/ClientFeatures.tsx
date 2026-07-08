"use client"

import { motion } from "framer-motion"
import { Activity, CheckSquare, CreditCard } from "lucide-react"

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

export function ClientFeatures() {
  const features = [
    {
      id: "tracking",
      icon: Activity,
      iconBg: "bg-emerald-100", // Premium emerald
      title: "Live Tracking",
      description: "Give clients real-time visibility into what stage their project is at. No more 'what's the status?' emails.",
      buttonText: "Explore tracking",
      replaces: ["Email Updates", "Spreadsheets", "Status Meetings"],
      visual: (
        <BrowserFrame>
          <div className="p-3 md:p-6 h-full flex flex-col justify-center items-center bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-blue-50 to-white">
            <div className="w-full max-w-[220px] space-y-4 bg-white p-4 rounded-lg border-2 border-black ">
              <h4 className="font-black text-sm md:text-base border-b border-black pb-2 mb-2">Project Progress</h4>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-400 border-2 border-black text-black flex items-center justify-center text-[10px] font-black flex-shrink-0">✓</div>
                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden border border-black">
                  <motion.div initial={{ width: "0%" }} whileInView={{ width: "100%" }} transition={{ duration: 1 }} viewport={{ once: false }} className="h-full w-full bg-green-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#5A52FF] border-2 border-black text-white flex items-center justify-center text-xs font-black flex-shrink-0 ">2</div>
                <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden border border-black">
                  <motion.div initial={{ width: "0%" }} whileInView={{ width: "60%" }} transition={{ duration: 1.5 }} viewport={{ once: false }} className="h-full bg-[#5A52FF]" />
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-50">
                <div className="w-6 h-6 rounded-full border-2 border-black bg-gray-100 text-gray-400 flex items-center justify-center text-xs font-black flex-shrink-0">3</div>
                <div className="h-2 flex-1 bg-gray-200 rounded-full border border-black" />
              </div>
            </div>
          </div>
        </BrowserFrame>
      )
    },
    {
      id: "approvals",
      icon: CheckSquare,
      iconBg: "bg-fuchsia-100", // Premium fuchsia
      title: "1-Click Approvals",
      description: "Review files and request changes seamlessly directly within the platform. Stop digging through email threads to find feedback.",
      buttonText: "Explore approvals",
      replaces: ["PDF Feedback", "Loom Videos", "Email Threads"],
      visual: (
        <BrowserFrame>
          <div className="p-3 md:p-6 h-full flex flex-col justify-center items-center bg-violet-50/50">
             <motion.div 
               animate={{ rotate: [-2, 2, -2] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="w-full max-w-[220px] bg-white rounded-lg border-2 border-black p-3 "
             >
                <div className="h-20 bg-[#EFE8FF] rounded-md mb-3 flex flex-col items-center justify-center border-2 border-black relative overflow-hidden">
                  <span className="text-[10px] font-bold text-black border-2 border-black px-2 py-1 rounded-full bg-white relative z-10 ">Design_V1.png</span>
                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')]" />
                </div>
                <div className="flex gap-2">
                  <button className="h-8 flex-1 bg-red-100 text-red-600 rounded flex items-center justify-center text-xs font-black border-2 border-black hover:bg-red-200 transition-colors ">Reject</button>
                  <button className="h-8 flex-1 bg-[#27C93F] text-black rounded flex items-center justify-center text-xs font-black border-2 border-black hover:bg-green-400 transition-colors ">Approve</button>
                </div>
             </motion.div>
          </div>
        </BrowserFrame>
      )
    },
    {
      id: "payments",
      icon: CreditCard,
      iconBg: "bg-teal-100", // Premium teal
      title: "Seamless Payments",
      description: "Clients can view past invoices and pay active retainers directly from their dashboard. No more chasing down payments.",
      buttonText: "Explore billing",
      replaces: ["Stripe Links", "Wire Transfers", "QuickBooks"],
      visual: (
        <BrowserFrame>
          <div className="p-3 md:p-6 h-full flex flex-col justify-center items-center bg-green-50/50">
             <div className="w-full max-w-[220px] bg-white rounded-lg p-4 border-2 border-black  relative">
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-300 border-2 border-black rounded-full  flex items-center justify-center font-black text-[10px] rotate-12">New</div>
                
                <div className="flex justify-between items-center mb-4 border-b border-black pb-2">
                  <span className="font-bold text-gray-500 text-[10px]">Invoice #0042</span>
                  <span className="bg-red-100 text-red-600 border border-black border-dashed px-1.5 py-0.5 rounded-full font-bold text-[8px] uppercase">Due in 3 days</span>
                </div>
                <div className="mb-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Amount Due</p>
                  <p className="text-2xl md:text-3xl font-black text-black">$1,500</p>
                </div>
                <button className="w-full py-2 bg-black text-white rounded font-bold text-xs border-2 border-black hover:bg-white hover:text-black transition-colors   translate-y-0 hover:translate-y-1">
                  Pay Now
                </button>
             </div>
          </div>
        </BrowserFrame>
      )
    }
  ]

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-gray-50 overflow-hidden border-t border-black">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24 flex flex-col items-center">
          <div className="flex items-center w-full max-w-md mx-auto mb-6">
            <div className="flex-1 h-[3px] bg-black rounded-full"></div>
            <p className="px-4 text-sm sm:text-base text-black font-black uppercase tracking-widest">
              For the Client
            </p>
            <div className="flex-1 h-[3px] bg-black rounded-full"></div>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-black leading-[1.1]">
            A premium experience <span className="text-[#27C93F]">they&apos;ll love</span>.
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

                <div className="w-full mt-6 pt-4 border-t-2 border-gray-200">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Replaces</p>
                  <div className="flex flex-wrap gap-2">
                    {feature.replaces.map((tool, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-gray-500 font-bold bg-white px-2.5 py-1 rounded-md border border-gray-200 text-xs">
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
