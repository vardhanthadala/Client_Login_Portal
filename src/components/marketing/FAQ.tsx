"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X } from "lucide-react"

const faqs = [
  {
    question: "Why's Dexze instead of full-time designer?",
    answer: "A full-time senior designer is costly and hard to find. With Dexze, you get instant access to elite design talent exactly when you need it, for a fraction of the annual cost."
  },
  {
    question: "How to request a design?",
    answer: "Simply drop your brief or wireframes into your dedicated Dexze portal. We review it immediately and start working on your high-fidelity designs."
  },
  {
    question: "Speed of design delivery?",
    answer: "We pride ourselves on speed. Most standard design requests are completed within 2 to 3 business days, ensuring your projects keep moving forward without delay."
  },
  {
    question: "What if I don't like design?",
    answer: "No problem! We offer unlimited revisions on your active requests. We will continue to refine and tweak the designs until you are 100% satisfied with the result."
  },
  {
    question: "What's the Dexze progress like?",
    answer: "You have full transparency. Track all active requests, review ongoing drafts, and provide direct feedback through your real-time dashboard."
  },
  {
    question: "Are there any refund?",
    answer: "Due to the high-quality nature of the custom work we deliver, we do not offer refunds. However, we guarantee we will revise the work until it meets your expectations."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div id="faq" className="bg-[#FAFAFA] pt-12 pb-24 sm:pt-16 sm:pb-32">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-20">
          <p className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">(FAQs)</p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black mb-4">
            Why <span className="text-[#27C93F]">Dexze</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 font-medium">
            Helping you understand our process and offerings at Dexze.
          </p>
        </div>
        
        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <div 
                key={index}
                className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] cursor-pointer"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                {/* Default Background Layer */}
                <div className="absolute inset-0 bg-[#F2F2F2] -z-20" />
                
                <div className="p-6 sm:p-8 flex flex-col justify-center min-h-[100px] relative z-10">
                  <div className="flex justify-between items-center gap-4">
                    
                    <span className="font-medium text-lg sm:text-xl pr-8 text-[#111111]">
                      {faq.question}
                    </span>
                    
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#111111] text-white">
                      {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" strokeWidth={3} />}
                    </div>
                  </div>
                  
                  {/* Accordion Answer Content */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 text-sm sm:text-base leading-relaxed text-gray-600">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
