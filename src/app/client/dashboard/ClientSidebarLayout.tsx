"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import { Moon, Sun, Menu, X, Bell, ChevronDown, CheckCircle2, LayoutDashboard, FolderKanban, CheckSquare, CreditCard, MessageSquare, Clock, LogOut, Settings, LifeBuoy, Building2, Calendar } from "lucide-react"
import SignOutButton from "./SignOutButton"
import NotificationSync from "@/components/NotificationSync"
import { useNotificationsStore } from "@/store/notificationsStore"

export interface TabData {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface ClientSidebarLayoutProps {
  tabs: TabData[];
  initialTab?: string;
  clientProfile: any;
  currentProject: string;
}

export default function ClientSidebarLayout({ tabs, initialTab, clientProfile, currentProject }: ClientSidebarLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const notifs = useNotificationsStore(state => state.notifications)
  const unreadNotifsCount = notifs.filter(n => !n.isRead).length
  
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false)
  
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  
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
    setIsSidebarOpen(false) // Close sidebar on mobile after selection
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const activeTabData = tabs.find(t => t.id === activeTab)
  
  // Progress computation for the bottom card
  const onboardingComplete = clientProfile.status === "ONBOARDED"
  
  let progressPercent = onboardingComplete ? 100 : 50;
  let currentStageName = "No Active Stage";
  
  if (clientProfile.projects && clientProfile.projects.length > 0) {
    const project = clientProfile.projects[0];
    const stages = Array.isArray(project.stages) ? project.stages : [];
    const currentStageIdx = project.currentStageIdx ?? 0;
    
    // Strict production stages logic: Progress = (Completed Stages / Total Stages) * 100
    const rawProgress = stages.length > 0 ? Math.round((currentStageIdx / stages.length) * 100) : 0;
    progressPercent = Math.min(100, Math.max(0, rawProgress));
    
    const activeStageIndex = Math.max(0, Math.min(currentStageIdx, stages.length - 1));
    currentStageName = stages[activeStageIndex] || "No Active Stage";
  }

  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light'
  const isDark = currentTheme === 'dark'

  const getGreeting = () => {
    if (!mounted) return "Good Morning" // fallback before hydration
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  // Map icons dynamically if not provided
  const getIconForTab = (id: string) => {
    switch (id) {
      case "overview": return <LayoutDashboard className="w-[18px] h-[18px]" />
      case "projects": return <FolderKanban className="w-[18px] h-[18px]" />
      case "approvals": return <CheckSquare className="w-[18px] h-[18px]" />
      case "billing": return <CreditCard className="w-[18px] h-[18px]" />
      case "messages": return <MessageSquare className="w-[18px] h-[18px]" />
      case "notifications": return <Bell className="w-[18px] h-[18px]" />
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
            className="fixed inset-0 z-40 bg-black/50 xl:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed xl:static inset-y-0 left-0 z-50 w-[260px] sm:w-[280px] bg-white dark:bg-[#111111] border-r border-[#E2E8F0] dark:border-[#222222] flex flex-col justify-between transition-transform duration-300 xl:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full overflow-y-auto blend-scrollbar">
          {/* Logo & Workspace Dropdown Placeholder */}
          <div className="p-4 border-b border-[#E2E8F0] dark:border-[#222] relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative w-28 h-8">
                  <Image 
                    src="/images/logo.png" 
                    alt="Dexze Logo" 
                    fill 
                    className="object-contain object-left dark:invert dark:hue-rotate-180 dark:brightness-125 dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.2)]" 
                  />
                </div>
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

          {/* Navigation Links */}
          <div className="px-4 py-2 flex-1">
            <p className="px-3 text-[11px] font-bold tracking-widest text-[#94A3B8] dark:text-[#666] uppercase mb-3">Workspace</p>
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif' }}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-[14px] font-medium transition-all duration-200 outline-none w-full text-left tracking-tight ${
                      isActive 
                        ? "text-[#10B981] bg-black/5 dark:bg-white/5" 
                        : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                    }`}
                  >
                    <div className={`${isActive ? "text-[#10B981]" : "opacity-70"}`}>
                      {getIconForTab(tab.id)}
                    </div>
                    <span className="flex-1 truncate relative z-10 flex items-center justify-between pr-2">
                      {tab.id === 'messages' && typeof tab.label !== 'string' ? (
                        <>
                           Messages
                           {notifs.filter(n => !n.isRead && n.type === 'MESSAGE').length > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#171A21]">
                              {notifs.filter(n => !n.isRead && n.type === 'MESSAGE').length}
                            </span>
                          )}
                        </>
                      ) : tab.id === 'notifications' ? (
                        <>
                          Notifications
                          {unreadNotifsCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#171A21]">
                              {unreadNotifsCount}
                            </span>
                          )}
                        </>
                      ) : tab.label}
                    </span>
                    
                    {/* Active Indicator Line */}
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-[#10B981] rounded-r-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Bottom Profile & Trial Widget */}
          <div className="p-4 mt-auto">
            {/* Trial/Progress Widget */}
            <div className="p-4 rounded-[16px] border border-[#E2E8F0] dark:border-[#222] bg-transparent mb-4 cursor-pointer hover:border-[#10B981]/30 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#0F172A] dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-[pulse_3s_ease-in-out_infinite]" />
                  Project Progress
                </div>
                <span className="text-lg font-bold text-[#0F172A] dark:text-white tabular-nums">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-[#F1F5F9] dark:bg-[#333] rounded-full overflow-hidden relative mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-[#10B981] rounded-full relative"
                >
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] -mr-1"
                  />
                </motion.div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider">
                <span className="text-[#64748B] dark:text-[#94A3B8]">{currentStageName}</span>
                <span className="text-[#10B981]">Active</span>
              </div>
            </div>

            {/* Profile */}
            <div className="p-4 border-t border-[#E2E8F0] dark:border-[#222]">
            <button className="w-full flex flex-col gap-3 p-3 rounded-2xl hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors text-left group">
              <div className="flex items-center gap-3 w-full">
                <div className="w-10 h-10 rounded-full bg-[#F1F5F9] dark:bg-[#222] flex items-center justify-center shrink-0 border border-[#E2E8F0] dark:border-[#333] overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <span className="text-[#0F172A] dark:text-white font-bold text-sm">
                    {clientProfile.clientName.split(" ").map((n: string) => n[0]).join("")}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#0F172A] dark:text-white truncate tracking-tight">{clientProfile.clientName}</span>
                  {onboardingComplete && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      <span className="text-[10px] font-bold text-[#10B981] tracking-wider uppercase">Onboarded</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
            </div>

            {/* Premium Workspace Button Removed */}
            <div className="mt-3 px-2">
              <SignOutButton />
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <NotificationSync role="CLIENT" data={clientProfile} />
        {/* Top Header */}
        <header className="h-[72px] shrink-0 border-b border-[#E2E8F0] dark:border-[#222] bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-10 z-10 sticky top-0">
          <AnimatePresence mode="popLayout">
            {activeTabData?.id === 'overview' || activeTabData?.id === 'projects' ? (
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
                    className="xl:hidden p-2 -ml-2 rounded-lg text-[#64748B] dark:text-[#888] hover:bg-[#F1F5F9] dark:hover:bg-[#222]"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col">
                    <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-white font-sans flex items-center gap-2 flex-wrap">
                      {activeTabData?.id === 'projects' 
                        ? 'Projects' 
                        : <>{getGreeting()}, {clientProfile.clientName.split(" ")[0]} <span className="text-2xl">👋</span></>}
                    </h1>
                    <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium hidden sm:flex items-center gap-2 mt-1">
                      <span>{activeTabData?.id === 'projects' ? 'Track and manage all ongoing projects.' : "Here's what's happening with your workspace today."}</span>
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
                    className="xl:hidden p-2 -ml-2 rounded-lg text-[#64748B] dark:text-[#888] hover:bg-[#F1F5F9] dark:hover:bg-[#222]"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <h1 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white flex items-center gap-3">
                    {activeTabData?.id === 'messages' ? 'Messages' : activeTabData?.label}
                  </h1>
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
            )}
          </AnimatePresence>
        </header>

        {/* Scrollable Content */}
        <div className={`flex-1 overflow-y-auto hidden-scrollbar relative ${activeTab === 'messages' ? 'p-0' : 'p-3 sm:p-6 md:p-8 lg:p-10 2xl:p-12'}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full mx-auto ${activeTab === 'messages' ? 'max-w-none h-full pb-0' : 'max-w-[1200px] 2xl:max-w-[1400px] pb-20'}`}
            >
              {activeTabData?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
