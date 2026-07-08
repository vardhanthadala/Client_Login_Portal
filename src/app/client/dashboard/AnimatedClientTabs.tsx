"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export interface TabData {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
}

interface AnimatedClientTabsProps {
  tabs: TabData[];
  initialTab?: string;
}

export default function AnimatedClientTabs({ tabs, initialTab }: AnimatedClientTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id)
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const activeContent = tabs.find(t => t.id === activeTab)?.content

  return (
    <div className="w-full flex flex-col">
      {/* Segmented Control Navigation */}
      <div className="flex justify-start sm:justify-start mb-12 overflow-visible">
        <div className="relative flex items-center p-[6px] rounded-[24px] bg-[#F1F5F9]/50 border border-[#E2E8F0] shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] overflow-x-auto hidden-scrollbar max-w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`relative z-10 flex items-center justify-center px-7 py-3 text-[15px] font-sans font-semibold tracking-wide transition-colors duration-300 whitespace-nowrap rounded-[18px] ${
                  isActive ? "text-[#5A52FF]" : "text-[#64748B] hover:text-[#0F172A]"
                }`}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-white rounded-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.03)] border border-[#E5E7EB]/50"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content with Transitions */}
      <div className="w-full relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full outline-none"
          >
            {activeContent}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
