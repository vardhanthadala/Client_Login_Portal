"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { PremiumIcon } from "@/components/PremiumIcon"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import { Moon, Sun, Menu, ChevronDown, ChevronRight, LayoutDashboard, Building2, Maximize2, Minimize2 } from "lucide-react"
import SignOutButton from "@/app/admin/dashboard/SignOutButton"
import Link from "next/link"
import { format } from "date-fns"
import ThemeSettingsWidget from "@/components/admin/ThemeSettingsWidget"

export interface TabData {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface SuperAdminSidebarLayoutProps {
  tabs: TabData[];
  initialTab?: string;
  adminName: string;
  children?: React.ReactNode;
  webhookHealthy?: boolean;
}

export default function SuperAdminSidebarLayout({ tabs, initialTab, adminName, children, webhookHealthy = true }: SuperAdminSidebarLayoutProps) {
  const finalAdminName = adminName || "Super Admin"
  
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isMiniMenu, setIsMiniMenu] = useState(false)
  
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Sync state with props to handle Next.js navigations
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    setMounted(true)
    setCurrentTime(new Date())
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setIsSidebarOpen(false)
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const activeTabData = tabs.find(t => t.id === activeTab)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#0F1115] text-[#0F172A] dark:text-[#F8FAFC] overflow-hidden font-sans transition-colors duration-300">
      <ThemeSettingsWidget />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: isMiniMenu ? 80 : 280 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[#FFFFFF] dark:bg-[#171A21] border-r border-[#E5E7EB] dark:border-white/5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto blend-scrollbar">
          {/* Logo */}
          <div className="p-4 border-b border-[#E5E7EB] dark:border-white/5 relative">
            <div className="flex items-center justify-between mb-2">
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => {}}
              >
                <div className="relative w-28 h-8 transition-all duration-200" style={{ width: isMiniMenu ? '36px' : '112px' }}>
                  <Image 
                    src="/images/logo.png" 
                    alt="Dexze Logo" 
                    fill 
                    className="object-contain object-left dark:invert dark:hue-rotate-180 dark:brightness-125 dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.2)]" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-2 flex-1">
            {!isMiniMenu && (
              <p className="px-3 mt-6 text-[11px] font-medium tracking-wider text-[#64748b] dark:text-[#94A3B8] uppercase mb-4">
                PLATFORM ADMIN
              </p>
            )}
            <nav className="flex flex-col gap-1.5">
              <Link
                href="/superadmin/dashboard?tab=overview"
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-normal transition-colors w-full text-left ${
                  (activeTab === "overview")
                    ? "bg-[#E2E8F0] dark:bg-white/10 text-[#0F172A] dark:text-white" 
                    : "text-[#0F172A] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-white/5 hover:text-[#000] dark:hover:text-white"
                }`}
              >
                <LayoutDashboard 
                  className={`w-[18px] h-[18px] transition-colors ${(activeTab === "overview") ? "text-[#0F172A] dark:text-white" : "text-[#0F172A] dark:text-[#CBD5E1] group-hover:text-[#000] dark:group-hover:text-white"}`} 
                />
                {!isMiniMenu && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>Overview</span>
                    {(activeTab === "overview") ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    )}
                  </div>
                )}
              </Link>

              {/* Agencies Link */}
              <Link
                href="/superadmin/dashboard?tab=agencies"
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-normal transition-colors w-full text-left ${
                  activeTab === "agencies"
                    ? "bg-[#E2E8F0] dark:bg-white/10 text-[#0F172A] dark:text-white" 
                    : "text-[#0F172A] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-white/5 hover:text-[#000] dark:hover:text-white"
                }`}
              >
                <Building2 
                  className={`w-[18px] h-[18px] transition-colors ${activeTab === "agencies" ? "text-[#0F172A] dark:text-white" : "text-[#0F172A] dark:text-[#CBD5E1] group-hover:text-[#000] dark:group-hover:text-white"}`} 
                />
                {!isMiniMenu && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>Companies</span>
                    {activeTab === "agencies" ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    )}
                  </div>
                )}
              </Link>
            </nav>
          </div>

          {/* Bottom Profile Widget */}
          <div className="p-4 mt-auto">
            <div className={`px-2 pt-4 border-t border-[#E5E7EB] dark:border-[#222] ${isMiniMenu ? "flex justify-center" : ""}`}>
              <SignOutButton isMini={isMiniMenu} />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-[72px] shrink-0 border-b border-[#E5E7EB] dark:border-[#222] bg-white dark:bg-[#171A21] flex items-center justify-between px-6 lg:px-10 z-50 sticky top-0">
          {/* Left Side Elements */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#64748B] dark:text-[#888] hover:bg-[#F1F5F9] dark:hover:bg-[#222]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsMiniMenu(!isMiniMenu)}
              className="hidden lg:flex p-2 -ml-2 rounded-lg text-[#64748B] dark:text-[#888] hover:bg-[#F1F5F9] dark:hover:bg-[#222] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Right Side Elements */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[4px] px-3 py-1.5 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider select-none shrink-0 shadow-sm mr-1">
              <span>{currentTime ? format(currentTime, 'MMM dd, yyyy') : '...'}</span>
              <span className="text-[#CBD5E1] dark:text-[#334155]">|</span>
              <span className="tabular-nums">{currentTime ? format(currentTime, 'hh:mm:ss a') : '--:--:-- --'}</span>
            </div>
            <button onClick={toggleFullscreen} className="hidden sm:inline-flex p-2 text-[#64748B] dark:text-[#94A3B8] hover:bg-[#FAFBFD] dark:hover:bg-[#1A1A1A] rounded-[4px] transition-colors">
              {isFullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
            </button>
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-[#64748B] dark:text-[#888] hover:bg-[#FAFBFD] dark:hover:bg-[#1A1A1A] rounded-[4px] transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full overflow-hidden border border-[#E5E7EB] bg-[#eff1f6] dark:bg-[#1e293b] flex items-center justify-center font-bold text-sm text-[#0F172A] dark:text-white shrink-0 cursor-pointer outline-none focus:ring-2 focus:ring-[#3454d1]"
                title={finalAdminName}
              >
                {finalAdminName[0].toUpperCase()}
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileOpen && (
                <>
                  {/* Backdrop to close */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2.5 w-[280px] bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-1.5 z-50 flex flex-col font-sans">
                    {/* User Profile Header Info */}
                    <div className="flex items-center gap-3 p-3 border-b border-[#F1F5F9] dark:border-white/5">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-[#E5E7EB] bg-[#eff1f6] dark:bg-[#1e293b] flex items-center justify-center font-bold text-base text-[#0F172A] dark:text-white shrink-0">
                        {finalAdminName[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-normal text-[14px] text-[#0F172A] dark:text-white truncate block">{finalAdminName}</span>
                          <span className="bg-[#5A52FF]/10 text-[#5A52FF] text-[9px] font-[700] px-1.5 py-0.5 rounded uppercase tracking-wider">SUPER ADMIN</span>
                        </div>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate block mt-0.5">Administrator</span>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="py-1.5 flex flex-col gap-0.5 relative">
                      {/* Sign Out Action */}
                      <SignOutButton variant="dropdown" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hidden-scrollbar p-4 sm:p-6 md:p-8 lg:p-10 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={children ? "children" : activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="w-full mx-auto pb-20"
            >
              {children || activeTabData?.content}
            </motion.div>
          </AnimatePresence>
          
          {/* Render hidden tabs to ensure their Client Components are mounted and receive RSC updates */}
          {!children && (
            <div style={{ display: 'none' }}>
              {tabs.map(tab => (
                <div key={tab.id}>
                  {tab.id !== activeTab && tab.content}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
