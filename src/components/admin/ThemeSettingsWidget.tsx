"use client"

import React, { useState, useEffect } from "react"
import { Settings, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const FONTS = [
  { label: "LATO", value: "Lato" },
  { label: "RUBIK", value: "Rubik" },
  { label: "INTER", value: "Inter" },
  { label: "CINZEL", value: "Cinzel" },
  { label: "NUNITO", value: "Nunito" },
  { label: "UBUNTU", value: "Ubuntu" },
  { label: "POPPINS", value: "Poppins" },
  { label: "RALEWAY", value: "Raleway" },
  { label: "SYSTEM UI", value: "system-ui" },
  { label: "NOTO SANS", value: "Noto Sans" },
  { label: "FIRA SANS", value: "Fira Sans" },
  { label: "WORK SANS", value: "Work Sans" },
  { label: "OPEN SANS", value: "Open Sans" },
  { label: "MAVEN PRO", value: "Maven Pro" },
  { label: "QUICKSAND", value: "Quicksand" },
  { label: "MONTSERRAT", value: "Montserrat" },
  { label: "JOSEFIN SANS", value: "Josefin Sans" },
  { label: "IBM PLEX SANS", value: "IBM Plex Sans" },
  { label: "SOURCE SANS PRO", value: "Source Sans 3" },
  { label: "MONTSERRAT ALT", value: "Montserrat Alternates" },
  { label: "ROBOTO SLAB", value: "Roboto Slab" },
]

export default function ThemeSettingsWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFont, setSelectedFont] = useState<string>("Inter")

  useEffect(() => {
    const savedFont = localStorage.getItem("portal-font")
    if (savedFont) {
      setSelectedFont(savedFont)
      applyFont(savedFont)
    }
  }, [])

  const applyFont = (fontFamily: string) => {
    let fontStyleId = "dynamic-font-style"
    let styleTag = document.getElementById(fontStyleId)
    if (!styleTag) {
      styleTag = document.createElement("style")
      styleTag.id = fontStyleId
      document.head.appendChild(styleTag)
    }

    if (fontFamily === "system-ui") {
      styleTag.innerHTML = `
        body, .font-sans, p, h1, h2, h3, h4, h5, h6, span, div, button, input, textarea, select {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
      `
    } else {
      const formattedName = fontFamily.replace(/ /g, "+")
      styleTag.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=${formattedName}:wght@300;400;500;600;700&display=swap');
        body, .font-sans, p, h1, h2, h3, h4, h5, h6, span, div, button, input, textarea, select {
          font-family: '${fontFamily}', sans-serif !important;
        }
      `
    }
  }

  const handleSelectFont = (font: string) => {
    setSelectedFont(font)
    localStorage.setItem("portal-font", font)
    applyFont(font)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-[#3454D1] hover:bg-[#2841A8] text-white p-2.5 rounded-l-md shadow-[0_10px_25px_-5px_rgba(52,84,209,0.5)] z-[60] flex items-center justify-center transition-colors"
      >
        <Settings className="w-5 h-5 animate-[spin_4s_linear_infinite]" />
      </button>

      {/* Sidebar Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-[65] backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[340px] bg-[#FAFBFD] dark:bg-[#171A21] shadow-2xl z-[70] flex flex-col border-l border-gray-200 dark:border-white/10 font-sans"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#171A21]">
                <h2 className="text-[17px] font-bold text-[#0F172A] dark:text-white">Theme Settings</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 hidden-scrollbar">
                <div className="relative border border-gray-200 dark:border-white/10 p-4 pt-6 rounded-xl bg-white dark:bg-[#1C1F26]">
                  <div className="absolute -top-3 left-4 bg-white dark:bg-[#1C1F26] px-2 text-[11px] font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase border border-gray-200 dark:border-white/10 rounded">
                    TYPOGRAPHY
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map((font) => (
                      <button
                        key={font.value}
                        onClick={() => handleSelectFont(font.value)}
                        className={`py-2.5 px-2 rounded-md text-[11px] font-bold tracking-wider uppercase border transition-all duration-200 ${
                          selectedFont === font.value
                            ? "bg-[#3454D1]/10 border-[#3454D1] text-[#3454D1]"
                            : "bg-white dark:bg-transparent border-gray-200 dark:border-white/10 text-[#475569] dark:text-[#94A3B8] hover:border-[#3454D1]/50 hover:text-[#3454D1]"
                        }`}
                      >
                        {font.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-gray-200 dark:border-white/10 flex gap-3 bg-white dark:bg-[#171A21]">
                <button 
                  onClick={() => handleSelectFont("Inter")}
                  className="flex-1 py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] font-bold uppercase rounded-md transition-colors"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-2.5 bg-[#3454D1] hover:bg-[#2841A8] text-white text-[13px] font-bold uppercase rounded-md transition-colors"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
