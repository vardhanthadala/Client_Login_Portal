"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { PremiumIcon } from "@/components/PremiumIcon"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import { Moon, Sun, Menu, ChevronDown, LayoutDashboard, Users, Settings, LifeBuoy, Clock, Building2, Calendar, ShieldCheck, Bell } from "lucide-react"
import SignOutButton from "./SignOutButton"
import Link from "next/link"
import { useNotificationsStore } from "@/store/notificationsStore"

export interface TabData {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface AdminSidebarLayoutProps {
  tabs: TabData[];
  initialTab?: string;
  adminName: string;
  children?: React.ReactNode;
  clients?: any[];
  activeClientId?: string;
  activeClientTab?: string;
}

export default function AdminSidebarLayout({ tabs, initialTab, adminName, children, clients = [], activeClientId, activeClientTab }: AdminSidebarLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false)
  
  const [currentTime, setCurrentTime] = useState<Date | null>(null)

  // Use global notifications store for the bell icon
  const notifications = useNotificationsStore(state => state.notifications)
  const unreadCount = notifications.filter(n => !n.isRead).length

  
  // Sync state with props to handle Next.js navigations (e.g. clicking Links)
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
  
  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light'
  
  const getGreeting = () => {
    if (!mounted) return "Good Morning"
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const getIconForTab = (id: string) => {
    switch (id) {
      case "overview": return <LayoutDashboard className="w-[18px] h-[18px]" />
      case "clients": return <Users className="w-[18px] h-[18px]" />
      default: return <LayoutDashboard className="w-[18px] h-[18px]" />
    }
  }

  return (
    <div className="flex h-screen w-full bg-[#F6F7FB] dark:bg-[#0F1115] text-[#0F172A] dark:text-[#F8FAFC] overflow-hidden font-sans transition-colors duration-300">
      
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] sm:w-[280px] bg-[#FFFFFF] dark:bg-[#171A21] border-r border-[#0F172A]/5 dark:border-white/5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto blend-scrollbar">
          {/* Logo & Workspace Dropdown Placeholder */}
          <div className="p-4 border-b border-[#0F172A]/5 dark:border-white/5 relative">
            <div className="flex items-center justify-between mb-4">
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              >
                <div className="relative w-28 h-8">
                  <Image 
                    src="/images/logo.png" 
                    alt="Dexze Logo" 
                    fill 
                    className="object-contain object-left dark:invert dark:hue-rotate-180 dark:brightness-125 dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.2)]" 
                  />
                </div>
                <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${isWorkspaceDropdownOpen ? "rotate-180" : ""}`} />
              </div>
              
              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-lg text-[#64748B] dark:text-[#888] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {isWorkspaceDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-[60px] left-4 right-4 bg-white dark:bg-[#171A21] border border-[#0F172A]/5 dark:border-white/5 rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)] overflow-hidden z-50 p-1.5 flex flex-col gap-0.5"
              >
                <Link
                  href="/admin/settings"
                  onClick={() => {
                    setIsWorkspaceDropdownOpen(false)
                    setIsSidebarOpen(false)
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Portal Settings
                </Link>
                <Link
                  href="/admin/help"
                  onClick={() => {
                    setIsWorkspaceDropdownOpen(false)
                    setIsSidebarOpen(false)
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors"
                >
                  <LifeBuoy className="w-4 h-4" />
                  Help & Support
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Links */}
          <div className="px-4 py-2 flex-1">
            <p className="px-3 text-[11px] font-bold tracking-widest text-[#94A3B8] dark:text-[#666] uppercase mb-3">Workspace Admin</p>
            <nav className="flex flex-col gap-1">
              <Link
                href="/admin/dashboard?tab=overview"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
                onClick={() => setIsSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 outline-none w-full text-left tracking-tight ${
                  (activeTab === "overview" && !pathname.includes("/admin/client"))
                    ? "text-[#22C55E] bg-black/5 dark:bg-white/5" 
                    : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#FAFBFD] dark:hover:bg-[#1C2029] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                }`}
              >
                <PremiumIcon 
                  icon={LayoutDashboard} 
                  iconClassName={(activeTab === "overview" && !pathname.includes("/admin/client")) ? "text-[#22C55E]" : "text-[#475569] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-white"} 
                />
                <span className="flex-1 truncate relative z-10">
                  Overview
                </span>
                
                {/* Active Indicator Line */}
                {((activeTab === "overview" && !pathname.includes("/admin/client"))) && (
                  <motion.div
                    layoutId="activeSidebar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-[#22C55E] rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>

              <Link
                href="/admin/dashboard?tab=notifications"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
                onClick={() => setIsSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 outline-none w-full text-left tracking-tight ${
                  activeTab === "notifications" && !pathname.includes("/admin/client")
                    ? "text-[#22C55E] bg-black/5 dark:bg-white/5" 
                    : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#FAFBFD] dark:hover:bg-[#1C2029] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                }`}
              >
                <PremiumIcon 
                  icon={Bell} 
                  iconClassName={(activeTab === "notifications" && !pathname.includes("/admin/client")) ? "text-[#22C55E]" : "text-[#475569] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-white"} 
                />
                <span className="flex-1 truncate relative z-10 flex items-center justify-between pr-2">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#171A21]">
                      {unreadCount}
                    </span>
                  )}
                </span>
                
                {/* Active Indicator Line */}
                {(activeTab === "notifications" && !pathname.includes("/admin/client")) && (
                  <motion.div
                    layoutId="activeSidebar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-[#22C55E] rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>

              {/* Clients Link */}
              <Link
                href="/admin/dashboard?tab=clients"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
                onClick={() => setIsSidebarOpen(false)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 outline-none w-full text-left tracking-tight ${
                  activeTab === "clients"
                    ? "text-[#22C55E] bg-black/5 dark:bg-white/5" 
                    : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#FAFBFD] dark:hover:bg-[#1C2029] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                }`}
              >
                <PremiumIcon 
                  icon={Users} 
                  iconClassName={activeTab === "clients" ? "text-[#22C55E]" : "text-[#475569] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-white"} 
                />
                <span className="flex-1 truncate relative z-10">
                  Clients
                </span>
                
                {/* Active Indicator Line */}
                {activeTab === "clients" && (
                  <motion.div
                    layoutId="activeSidebar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-[#22C55E] rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            </nav>
          </div>

          {/* Bottom Profile Widget */}
          <div className="p-4 mt-auto">
            <div className="px-2 pt-4 border-t border-[#E2E8F0] dark:border-[#222]">
              <SignOutButton />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header */}
        <header className="h-[72px] shrink-0 border-b border-[#E2E8F0] dark:border-[#222] bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0">
          <AnimatePresence mode="popLayout">
            {activeTabData?.id === 'overview' ? (
              <motion.div 
                key="header-rich"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 -ml-2 rounded-lg text-[#64748B] dark:text-[#888] hover:bg-[#F1F5F9] dark:hover:bg-[#222]"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white font-sans flex items-center gap-2">
                      <>{getGreeting()}, {adminName.split(" ")[0] || "Admin"} <span className="text-2xl">👋</span></>
                    </h1>
                    <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium hidden sm:flex items-center gap-2 mt-1">
                      <span>Here's what's happening with your workspace today.</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {currentTime && (
                    <div className="hidden md:flex items-center gap-2 text-[13px] text-[#0F172A] dark:text-white font-medium bg-white dark:bg-[#161616] border border-[#E2E8F0] dark:border-[#222] shadow-sm rounded-full px-4 py-2 transition-colors">
                      <Calendar className="w-4 h-4 text-[#10B981]" />
                      <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                      <span className="text-[#64748B] dark:text-[#888] ml-0.5">
                        {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="header-simple"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 -ml-2 rounded-lg text-[#64748B] dark:text-[#888] hover:bg-[#F1F5F9] dark:hover:bg-[#222]"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white flex items-center gap-3">
                    {activeTabData?.label}
                  </h1>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
              className="w-full max-w-[1200px] mx-auto pb-20"
            >
              {children || activeTabData?.content}
            </motion.div>
          </AnimatePresence>
          
          {/* Render hidden tabs to ensure their Client Components (like NotificationSync) are mounted and receive RSC updates */}
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
