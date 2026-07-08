"use client"

import { motion } from "framer-motion"
import { Folder, Mail, MessageSquareOff, AlertCircle, CheckCircle2, Layout, Zap, Users } from "lucide-react"

export function ProblemSolution() {
  return (
    <div id="problem-solution" className="py-24 sm:py-32 bg-gray-50 overflow-hidden">
      <div className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-black mb-4">
            The old way vs. <span className="text-[#27C93F]">The Dexze way</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Stop losing clients to chaotic communication and disorganized files.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          
          {/* The Problem */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl sm:rounded-3xl bg-white border border-gray-200 p-6 sm:p-8 lg:p-10 flex flex-col shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-black">How agencies currently work</h3>
            </div>
            
            <div className="flex-1 relative rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 p-4 sm:p-6 overflow-hidden flex flex-col gap-3 sm:gap-4">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <MessageSquareOff className="w-24 h-24 text-red-500" />
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-red-100 bg-red-50/50">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-black text-sm truncate">&quot;Where is the logo?&quot;</p>
                  <p className="text-xs text-gray-500 truncate">Lost in a massive Google Drive folder</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-red-100 bg-red-50/50">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-black text-sm truncate">&quot;Did you approve the post?&quot;</p>
                  <p className="text-xs text-gray-500 truncate">Buried in a 40-reply email thread</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-red-100 bg-red-50/50">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-black text-sm truncate">Confused Client</p>
                  <p className="text-xs text-gray-500 truncate">&quot;I have no idea what you&apos;re working on right now.&quot;</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* The Solution */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl sm:rounded-3xl bg-white border border-[#5A52FF]/20 p-6 sm:p-8 lg:p-10 flex flex-col relative overflow-hidden shadow-sm"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5A52FF]/5 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#5A52FF]/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#27C93F]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-black">How top-tier agencies work</h3>
            </div>
            
            <div className="flex-1 relative rounded-xl sm:rounded-2xl bg-gray-50 border border-[#5A52FF]/10 p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 z-10">
              
              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-[#5A52FF]/10 bg-[#5A52FF]/5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-[#27C93F]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-black text-sm truncate">Centralized Assets</p>
                  <p className="text-xs text-gray-600 truncate">Every logo, font, and brand guideline in one place.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-[#5A52FF]/10 bg-[#5A52FF]/5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#27C93F]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-black text-sm truncate">One-Click Approvals</p>
                  <p className="text-xs text-gray-600 truncate">Clients click &quot;Approve&quot; and you&apos;re notified instantly.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-[#5A52FF]/10 bg-[#5A52FF]/5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#27C93F]" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-black text-sm truncate">Happy, Informed Client</p>
                  <p className="text-xs text-gray-600 truncate">&quot;I love logging into my dashboard. It&apos;s so professional!&quot;</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
