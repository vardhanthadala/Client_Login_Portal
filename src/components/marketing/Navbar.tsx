"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { CheckoutModal } from "./CheckoutModal"
import { useState, useEffect } from "react"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileOpen])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-4 sm:pt-5 pointer-events-none">
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
        className={`
          w-full max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] h-[64px] sm:h-[72px] rounded-[16px] sm:rounded-[20px]
          px-4 sm:px-6 lg:px-8 pointer-events-auto
          border border-gray-200 transition-all duration-300
          ${scrolled
            ? "bg-white shadow-sm -translate-y-1"
            : "bg-white shadow-sm"
          }
        `}
      >
        <div className="flex items-center justify-between h-full w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image 
              src="/images/logo.png" 
              alt="Dexze Logo" 
              width={100}
              height={26}
              priority
              className="w-[100px] h-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-[13px] font-medium text-black/60 uppercase tracking-widest hover:text-[#27C93F] transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-[13px] font-medium text-black/60 uppercase tracking-widest hover:text-[#27C93F] transition-colors duration-300"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="text-[13px] font-medium text-black/60 uppercase tracking-widest hover:text-[#27C93F] transition-colors duration-300"
            >
              FAQ
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href="/client-login"
                className="h-[40px] sm:h-[44px] px-5 sm:px-6 rounded-lg bg-white text-black text-sm font-normal flex items-center justify-center border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all duration-200 shadow-sm hover:translate-y-[3px]"
              >
                Login
              </Link>
              <CheckoutModal
                buttonText="Purchase"
                triggerClassName="h-[40px] sm:h-[44px] px-5 sm:px-6 rounded-lg bg-black text-white hover:text-black text-sm font-normal flex items-center justify-center border border-black hover:bg-white transition-all duration-200 shadow-sm hover:translate-y-[3px]"
              />
            </div>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5 text-black" /> : <Menu className="w-5 h-5 text-black" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed top-[88px] sm:top-[96px] left-4 right-4 bg-white border border-gray-200 rounded-2xl p-6 pointer-events-auto md:hidden z-50 shadow-sm"
        >
          <div className="flex flex-col gap-4">
            <a href="#features" onClick={() => setMobileOpen(false)} className="text-black/60 hover:text-[#27C93F] text-lg font-medium uppercase tracking-widest py-2">Features</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="text-black/60 hover:text-[#27C93F] text-lg font-medium uppercase tracking-widest py-2">Pricing</a>
            <a href="#faq" onClick={() => setMobileOpen(false)} className="text-black/60 hover:text-[#27C93F] text-lg font-medium uppercase tracking-widest py-2">FAQ</a>
            <div className="pt-4 border-t-[3px] border-gray-100 flex flex-col gap-3">
              <Link
                href="/client-login"
                className="w-full h-[48px] px-6 rounded-xl bg-white text-black text-sm font-normal flex items-center justify-center border border-gray-200 hover:bg-black hover:text-white hover:border-black transition-all duration-200 shadow-sm"
              >
                Login
              </Link>
              <CheckoutModal
                buttonText="Purchase"
                triggerClassName="w-full h-[48px] px-6 rounded-xl bg-black text-white hover:text-black text-sm font-normal flex items-center justify-center border border-black hover:bg-white transition-all duration-200 shadow-sm"
              />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
