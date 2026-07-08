"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import { Moon, Sun, Menu, ChevronDown, LayoutDashboard, Users, Settings, LifeBuoy, Clock, Building2, Calendar, ShieldCheck, Bell } from "lucide-react"
import SignOutButton from "./SignOutButton"
import Link from "next/link"

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
  const [isClientsDropdownOpen, setIsClientsDropdownOpen] = useState(pathname.includes("/admin/client"))
  const [expandedClientId, setExpandedClientId] = useState<string | null>(activeClientId || null)
  
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  
  // Sync state with props to handle Next.js navigations (e.g. clicking Links)
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (activeClientId) setExpandedClientId(activeClientId)
  }, [activeClientId])
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
    <div className="flex h-screen w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] text-[#0F172A] dark:text-[#F8FAFC] overflow-hidden font-sans transition-colors duration-300">
      
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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] sm:w-[280px] bg-white dark:bg-[#111111] border-r border-[#E2E8F0] dark:border-[#222222] flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto blend-scrollbar">
          {/* Logo & Workspace Dropdown Placeholder */}
          <div className="p-4 border-b border-[#E2E8F0] dark:border-[#222] relative">
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
                <ChevronDown className={`w-4 h-4 text-[#64748B] group-hover:text-[#0F172A] dark:group-hover:text-white transition-all ${isWorkspaceDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-1.5 rounded-lg text-[#64748B] dark:text-[#888] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Workspace Dropdown */}
            <AnimatePresence>
              {isWorkspaceDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-[60px] left-4 right-4 bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-[#222] rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <div className="p-2 flex flex-col gap-1">
                    <Link href="/admin/settings" className="flex items-center gap-3 w-full p-2.5 text-[13px] font-medium text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
                      <Settings className="w-4 h-4 text-[#64748B] dark:text-[#888]" />
                      Portal Settings
                    </Link>
                    <div className="h-px w-full bg-[#E2E8F0] dark:bg-[#222] my-1" />
                    <button className="flex items-center gap-3 w-full p-2.5 text-[13px] font-medium text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
                      <LifeBuoy className="w-4 h-4 text-[#64748B] dark:text-[#888]" />
                      Help & Support
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-2 flex-1">
            <p className="px-3 text-[11px] font-bold tracking-widest text-[#94A3B8] dark:text-[#666] uppercase mb-3">Workspace Admin</p>
            <nav className="flex flex-col gap-1">
              <Link
                href="/admin/dashboard?tab=overview"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
                onClick={() => setIsSidebarOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 outline-none w-full text-left tracking-tight ${
                  (activeTab === "overview" && !pathname.includes("/admin/client"))
                    ? "text-[#10B981] bg-black/5 dark:bg-white/5" 
                    : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                }`}
              >
                <div className={`${(activeTab === "overview" && !pathname.includes("/admin/client")) ? "text-[#10B981]" : "opacity-70"}`}>
                  <LayoutDashboard className="w-[18px] h-[18px]" />
                </div>
                <span className="flex-1 truncate relative z-10">
                  Overview
                </span>
                
                {/* Active Indicator Line */}
                {((activeTab === "overview" && !pathname.includes("/admin/client"))) && (
                  <motion.div
                    layoutId="activeSidebar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-[#10B981] rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>

              <Link
                href="/admin/dashboard?tab=notifications"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
                onClick={() => setIsSidebarOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 outline-none w-full text-left tracking-tight ${
                  activeTab === "notifications" && !pathname.includes("/admin/client")
                    ? "text-[#10B981] bg-black/5 dark:bg-white/5" 
                    : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                }`}
              >
                <div className={`${activeTab === "notifications" && !pathname.includes("/admin/client") ? "text-[#10B981]" : "opacity-70"}`}>
                  <Bell className="w-[18px] h-[18px]" />
                </div>
                <span className="flex-1 truncate relative z-10">
                  Notifications
                </span>
                
                {/* Active Indicator Line */}
                {(activeTab === "notifications" && !pathname.includes("/admin/client")) && (
                  <motion.div
                    layoutId="activeSidebar"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-[#10B981] rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>

              {/* Clients Dropdown */}
              <div className="mt-1 flex flex-col gap-1">
                <button
                  onClick={() => setIsClientsDropdownOpen(!isClientsDropdownOpen)}
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
                  className={`relative flex items-center justify-between px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 outline-none w-full text-left tracking-tight ${
                    isClientsDropdownOpen || pathname.includes("/admin/client")
                      ? "text-[#0F172A] dark:text-[#F8FAFC]" 
                      : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${isClientsDropdownOpen || pathname.includes("/admin/client") ? "text-[#5A52FF]" : "opacity-70"}`}>
                      <Users className="w-[18px] h-[18px]" />
                    </div>
                    <span className="truncate">Clients</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isClientsDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isClientsDropdownOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden flex flex-col gap-0.5 ml-4 border-l border-[#E2E8F0] dark:border-[#333] pl-2 mt-1"
                    >
                      {clients.length === 0 ? (
                        <div className="px-3 py-2 text-[12px] text-[#64748B] dark:text-[#888]">No clients found.</div>
                      ) : (
                        clients.map((client) => {
                          const isClientExpanded = expandedClientId === client.id;
                          const clientName = client.clientProfile?.companyName || client.clientProfile?.clientName || "Unknown Client";
                          return (
                            <div key={client.id} className="flex flex-col gap-0.5">
                              <button
                                onClick={() => {
                                  if (isClientExpanded) {
                                    setExpandedClientId(null);
                                  } else {
                                    setExpandedClientId(client.id);
                                    if (activeClientId !== client.id) {
                                      router.push(`/admin/client/${client.id}?tab=overview`);
                                      setIsSidebarOpen(false);
                                    }
                                  }
                                }}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                                  isClientExpanded || activeClientId === client.id
                                    ? "text-[#0F172A] dark:text-white bg-[#F8FAFC] dark:bg-[#1A1A1A]"
                                    : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A]"
                                }`}
                              >
                                <span className="truncate">{clientName}</span>
                                <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${isClientExpanded ? "rotate-180" : ""}`} />
                              </button>

                              <AnimatePresence>
                                {isClientExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden flex flex-col gap-0.5 ml-3 pl-2 border-l border-[#E2E8F0] dark:border-[#333] mt-1 mb-2"
                                  >
                                    {[
                                      { id: "overview", label: "Overview" },
                                      { id: "projects", label: "Projects" },
                                      { id: "approvals", label: "Approvals" },
                                      { id: "billing", label: "Billing & Invoices" },
                                      { id: "messages", label: "Messages" }
                                    ].map(subTab => {
                                      const isSubTabActive = activeClientId === client.id && activeClientTab === subTab.id;
                                      return (
                                        <Link
                                          key={subTab.id}
                                          href={`/admin/client/${client.id}?tab=${subTab.id}`}
                                          onClick={() => setIsSidebarOpen(false)}
                                          className={`block px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                                            isSubTabActive
                                              ? "text-[#10B981] bg-[#10B981]/10"
                                              : "text-[#64748B] dark:text-[#888] hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                                          }`}
                                        >
                                          {subTab.label}
                                        </Link>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </nav>
          </div>

          {/* Bottom Profile Widget */}
          <div className="p-4 mt-auto">
            {/* Profile */}
            <div className="p-4 border-t border-[#E2E8F0] dark:border-[#222]">
            <div className="w-full flex flex-col gap-3 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors text-left group cursor-default">
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/30 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#0F172A] dark:text-white truncate tracking-tight">{adminName || "Admin"}</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[10px] font-bold text-blue-500 tracking-wider uppercase">Workspace Owner</span>
                  </div>
                </div>
              </div>
            </div>
            </div>

            <div className="mt-3 px-2">
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
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-[13px] text-[#64748B] dark:text-[#888] font-medium mr-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last active just now</span>
                  </div>
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
        </div>
      </main>
    </div>
  )
}
