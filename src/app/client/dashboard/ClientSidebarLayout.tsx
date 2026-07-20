"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import { 
  Menu, X, Bell, ChevronDown, CheckCircle2, LayoutDashboard, 
  FolderKanban, CheckSquare, CreditCard, MessageSquare, Clock, 
  LogOut, Settings, LifeBuoy, Building2, Calendar, Search, Maximize,
  Sun, Moon, Plus, ArrowRight, ArrowLeft, Monitor, FileText, Users,
  Command, User, Activity, DollarSign, ChevronRight, Loader2, Camera, Upload
} from "lucide-react"
import { 
  FiAlignLeft, FiArrowLeft, FiArrowRight, FiMaximize, FiMinimize, 
  FiMoon, FiSun, FiSearch, FiGlobe, FiClock, FiBell 
} from "react-icons/fi"
import SignOutButton from "./SignOutButton"
import NotificationSync from "@/components/NotificationSync"
import { useNotificationsStore } from "@/store/notificationsStore"
import { formatDistanceToNow } from 'date-fns'
import ThemeSettingsWidget from "@/components/admin/ThemeSettingsWidget"

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
  const markAsRead = useNotificationsStore(state => state.markAsRead)
  const markAllAsRead = useNotificationsStore(state => state.markAllAsRead)
  const clearAllNotifications = useNotificationsStore(state => state.clearAllNotifications)
  const unreadNotifsCount = notifs.filter(n => !n.isRead).length
  
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'MESSAGE': return <MessageSquare className="w-5 h-5 text-[#3454D1]" />
      case 'APPROVAL': return <CheckSquare className="w-5 h-5 text-[#10B981]" />
      case 'INVOICE': return <CreditCard className="w-5 h-5 text-[#8B5CF6]" />
      case 'PROJECT': return <FolderKanban className="w-5 h-5 text-[#F59E0B]" />
      case 'SYSTEM': return <Bell className="w-5 h-5 text-[#64748B]" />
      default: return <Bell className="w-5 h-5 text-[#64748B]" />
    }
  }

  const handleNotificationClick = (notif: typeof notifs[0]) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    setIsNotifOpen(false);
    
    switch (notif.type) {
      case 'MESSAGE': setActiveTab('messages'); break;
      case 'APPROVAL': setActiveTab('approvals'); break;
      case 'INVOICE': setActiveTab('billing'); break;
      case 'PROJECT': setActiveTab('projects'); break;
      default: setActiveTab('overview'); break;
    }
  }
  
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default to mini sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [showAllNotifications, setShowAllNotifications] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const [isUploading, setIsUploading] = useState(false)
  const [localProfileImage, setLocalProfileImage] = useState(clientProfile?.profileImageUrl)
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [localClientName, setLocalClientName] = useState(clientProfile?.clientName || "")
  const [activeStatus, setActiveStatus] = useState<"Active" | "Always" | "Busy" | "Inactive" | "Disabled" | "Customization">("Active")
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false)

  const statusColors = {
    Active: "bg-emerald-500",
    Always: "bg-amber-400",
    Busy: "bg-rose-500",
    Inactive: "bg-teal-400",
    Disabled: "bg-slate-600",
    Customization: "bg-blue-500"
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    if (!selectedFile && localClientName === clientProfile?.clientName) return;

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      if (selectedFile) formData.append("file", selectedFile);
      if (localClientName !== clientProfile?.clientName) formData.append("clientName", localClientName);

      // Upload directly to backend, which handles S3 and DB atomically (avoids S3 CORS errors)
      const res = await fetch('/api/client/profile/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error('Failed to upload and save profile image');
      
      // Update local UI
      if (selectedFile) {
        setLocalProfileImage(previewImage || URL.createObjectURL(selectedFile));
      }
      setIsEditProfileModalOpen(false);
      router.refresh();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setPreviewImage(null);
    }
  };
  
  const expanded = isMobileSidebarOpen || isSidebarOpen || isHovered

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])
  
  useEffect(() => {
    if (clientProfile?.profileImageUrl) {
      setLocalProfileImage(clientProfile.profileImageUrl)
    }
    if (clientProfile?.clientName) {
      setLocalClientName(clientProfile.clientName)
    }
  }, [clientProfile?.profileImageUrl, clientProfile?.clientName])

  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('blob:')) return url;
    return `/api/file?url=${encodeURIComponent(url)}`;
  };
  
  useEffect(() => {
    setMounted(true)
    
    // Auto-collapse sidebar on smaller screens initially
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setIsSidebarOpen(false)
      }
    }
    
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    
    setCurrentTime(new Date())
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      clearInterval(timer)
    }
  }, [])
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }
  
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setIsMobileSidebarOpen(false) 
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tabId)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const activeTabData = tabs.find(t => t.id === activeTab)
  const currentTheme = mounted ? (theme === 'system' ? systemTheme : theme) : 'light'
  const isDark = currentTheme === 'dark'

  // Map icons dynamically to match Duralux style if possible
  const getIconForTab = (id: string, isActive: boolean) => {
    const iconClass = `w-[18px] h-[18px] ${isActive ? 'text-[#001327] dark:text-white' : 'text-[#283C50] dark:text-[#94A3B8]'}`;
    switch (id) {
      case "overview": return <LayoutDashboard className={iconClass} strokeWidth={isActive ? 2 : 1.5} />
      case "projects": return <FolderKanban className={iconClass} strokeWidth={isActive ? 2 : 1.5} />
      case "approvals": return <CheckSquare className={iconClass} strokeWidth={isActive ? 2 : 1.5} />
      case "billing": return <CreditCard className={iconClass} strokeWidth={isActive ? 2 : 1.5} />
      case "messages": return <MessageSquare className={iconClass} strokeWidth={isActive ? 2 : 1.5} />
      case "notifications": return <Bell className={iconClass} strokeWidth={isActive ? 2 : 1.5} />
      default: return <LayoutDashboard className={iconClass} strokeWidth={isActive ? 2 : 1.5} />
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen w-full bg-[#F4F6F9] dark:bg-[#0A0A0A] text-[#343A40] dark:text-[#F8FAFC] overflow-hidden font-sans transition-colors duration-300 relative">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar Placeholder */}
      <div 
        className={`hidden md:block shrink-0 h-full transition-all duration-300 ${isSidebarOpen ? 'w-[280px]' : 'w-[100px]'}`}
      />

      {/* Sidebar */}
      <motion.aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={false}
        animate={{ 
          width: expanded ? 280 : 100,
          x: 0
        }}
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-[#111111] border-r border-[#E2E8F0] dark:border-[#222222] flex flex-col justify-between transition-shadow duration-300 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${!isSidebarOpen && isHovered ? 'shadow-[4px_0_24px_rgba(0,0,0,0.08)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.4)]' : ''}`}
      >
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden hidden-scrollbar">
          {/* Logo */}
          <div className="h-[60px] shrink-0 px-5 flex items-center justify-start border-b border-[#E2E8F0] dark:border-[#222]">
            <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'w-28' : 'w-[24px]'}`}>
              <div className="relative w-28 h-8">
                <Image 
                  src="/images/logo.png" 
                  alt="Dexze Logo" 
                  fill 
                  className="object-contain object-left dark:invert dark:hue-rotate-180 dark:brightness-125" 
                />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-6 flex-1">
            <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'h-[24px] mb-4 opacity-100' : 'h-0 mb-0 opacity-0'}`}>
              <p className="px-3 text-[10px] font-normal tracking-[0.07em] text-[#7587A7] dark:text-[#94A3B8] uppercase whitespace-nowrap">
                Navigation
              </p>
            </div>
            
            <nav className="flex flex-col gap-1.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative flex items-center gap-3 px-3 py-[10px] rounded-[8px] text-[13px] leading-[1.2] transition-all duration-200 outline-none w-full text-left font-normal ${
                      isActive 
                        ? "text-[#001327] dark:text-white bg-[#EAEBEF] dark:bg-[#1A1A1A]" 
                        : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#EAEBEF] dark:hover:bg-[#161616] hover:text-[#001327] dark:hover:text-[#F8FAFC]"
                    } ${!expanded ? 'justify-center' : ''}`}
                    title={!expanded ? (typeof tab.label === 'string' ? tab.label : tab.id) : undefined}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#3454D1] dark:bg-[#6366F1] rounded-r-full" />
                    )}
                    <div className="flex items-center justify-center shrink-0 relative">
                      {getIconForTab(tab.id, isActive)}
                      {!expanded && tab.id === 'messages' && notifs.filter(n => !n.isRead && n.type === 'MESSAGE').length > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-normal text-white border-2 border-white dark:border-[#1A1A1A] shadow-sm">
                          {notifs.filter(n => !n.isRead && n.type === 'MESSAGE').length}
                        </span>
                      )}
                      {!expanded && tab.id === 'notifications' && unreadNotifsCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#EF4444] text-[9px] font-normal text-white border-2 border-white dark:border-[#1A1A1A] shadow-sm">
                          {unreadNotifsCount}
                        </span>
                      )}
                    </div>
                    
                    <span className={`flex-1 flex items-center justify-between truncate pr-2 transition-all duration-300 whitespace-nowrap ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden hidden'}`}>
                      {tab.id === 'messages' && typeof tab.label !== 'string' ? (
                        <>
                          <span>Messages</span>
                          {notifs.filter(n => !n.isRead && n.type === 'MESSAGE').length > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-normal text-white shrink-0">
                              {notifs.filter(n => !n.isRead && n.type === 'MESSAGE').length}
                            </span>
                          )}
                        </>
                      ) : tab.id === 'notifications' ? (
                        <>
                          <span>Notifications</span>
                          {unreadNotifsCount > 0 && (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-normal text-white shrink-0">
                              {unreadNotifsCount}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className={isActive ? "font-normal" : ""}>{tab.label}</span>
                      )}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-[#F4F6F9] dark:bg-[#0A0A0A]">
        <NotificationSync role="CLIENT" data={clientProfile} />
        
        {/* Top Navbar */}
        <header className="h-[60px] shrink-0 border-b border-[#E2E8F0] dark:border-[#222] bg-white dark:bg-[#111111] flex items-center justify-between px-4 lg:px-6 z-40 relative transition-colors duration-300">
          
          {/* Header Left */}
          <div className="flex items-center gap-2 lg:gap-4 h-full">
            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 text-[#64748B] dark:text-[#888] hover:bg-[#F1F5F9] dark:hover:bg-[#222] rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Desktop Toggle */}
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex p-2 text-[#64748B] dark:text-[#888] hover:bg-[#F1F5F9] dark:hover:bg-[#222] rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* Header Right */}
          <div className="flex items-center h-full gap-1 sm:gap-2">
            
            <div className="relative">
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <FiSearch size={18} />
              </button>

              <AnimatePresence>
                {isSearchOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsSearchOpen(false)}
                      className="fixed inset-0 z-40 bg-transparent"
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[50px] right-0 w-[420px] bg-white dark:bg-[#111] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#E2E8F0] dark:border-[#333] z-50 overflow-hidden"
                    >
                      {/* Search Input */}
                      <div className="flex items-center px-4 py-3 border-b border-[#E2E8F0] dark:border-[#333]">
                        <Search className="w-4 h-4 text-[#94A3B8] mr-3 shrink-0" />
                        <input 
                          type="text" 
                          placeholder="Search...." 
                          className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#0F172A] dark:text-white placeholder:text-[#94A3B8]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                        />
                        <span className="text-[10px] font-normal text-[#64748B] dark:text-[#888] bg-[#F1F5F9] dark:bg-[#222] px-1.5 py-0.5 rounded border border-[#E2E8F0] dark:border-[#333]">ESC</span>
                      </div>

                      <div className="p-4 overflow-y-auto max-h-[400px] hidden-scrollbar">
                        {searchQuery.trim() ? (
                          // Search Results
                          <div className="flex flex-col gap-1">
                            <p className="text-[12px] font-normal text-[#64748B] dark:text-[#94A3B8] mb-3">Search Results</p>
                            {tabs
                              .filter(tab => 
                                (typeof tab.label === 'string' ? tab.label.toLowerCase() : tab.id.toLowerCase()).includes(searchQuery.toLowerCase()) || 
                                tab.id.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .map((tab) => (
                                <button 
                                  key={tab.id}
                                  onClick={() => {
                                    handleTabChange(tab.id);
                                    setIsSearchOpen(false);
                                    setSearchQuery("");
                                  }}
                                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors w-full text-left group"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg border border-[#E2E8F0] dark:border-[#333] flex items-center justify-center bg-white dark:bg-[#111] shrink-0 group-hover:border-[#CBD5E1] dark:group-hover:border-[#444] transition-colors">
                                      {getIconForTab(tab.id, false)}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[13px] font-normal text-[#0F172A] dark:text-white leading-tight capitalize">
                                        {typeof tab.label === 'string' ? tab.label : tab.id}
                                      </span>
                                      <span className="text-[11px] text-[#94A3B8] mt-0.5">Home / {tab.id}</span>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            {tabs.filter(tab => (typeof tab.label === 'string' ? tab.label.toLowerCase() : tab.id.toLowerCase()).includes(searchQuery.toLowerCase()) || tab.id.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                              <div className="p-4 text-center text-[#64748B] dark:text-[#94A3B8] text-[13px]">
                                No results found for "{searchQuery}"
                              </div>
                            )}
                          </div>
                        ) : (
                          // Default UI when no search query
                          <>
                            {/* Tags */}
                            <div className="mb-6">
                              <p className="text-[12px] font-normal text-[#3454D1] mb-3">I'm searching for...</p>
                              <div className="flex flex-wrap gap-2">
                                {tabs.map(tab => {
                                  const labelStr = typeof tab.label === 'string' ? tab.label : tab.id.charAt(0).toUpperCase() + tab.id.slice(1);
                                  return (
                                    <button 
                                      key={tab.id} 
                                      onClick={() => {
                                        handleTabChange(tab.id);
                                        setIsSearchOpen(false);
                                      }}
                                      className="px-3 py-1.5 rounded-[6px] border border-[#E2E8F0] dark:border-[#333] text-[12px] text-[#283C50] dark:text-[#ccc] hover:bg-[#F8FAFC] dark:hover:bg-[#222] transition-colors bg-white dark:bg-[#111]"
                                    >
                                      {labelStr}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Recent */}
                            <div className="mb-6">
                              <div className="flex items-center gap-2 mb-3">
                                <p className="text-[12px] text-[#64748B] dark:text-[#94A3B8]">Recent</p>
                                <span className="text-[10px] font-normal bg-[#F1F5F9] dark:bg-[#222] text-[#64748B] dark:text-[#94A3B8] px-1.5 py-0.5 rounded">3</span>
                              </div>
                              <div className="flex flex-col gap-1">
                                {/* Item 1 */}
                                <button onClick={() => { handleTabChange('approvals'); setIsSearchOpen(false); }} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors w-full text-left group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg border border-[#E2E8F0] dark:border-[#333] flex items-center justify-center bg-white dark:bg-[#111] shrink-0 group-hover:border-[#CBD5E1] dark:group-hover:border-[#444] transition-colors">
                                      <CheckSquare className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[13px] font-normal text-[#0F172A] dark:text-white leading-tight">Recent Approvals</span>
                                      <span className="text-[11px] text-[#94A3B8] mt-0.5">Home / approvals</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-[#94A3B8] text-[10px] font-normal bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-[#333] px-1.5 py-0.5 rounded">
                                    <span>/</span>
                                    <Command className="w-3 h-3" />
                                  </div>
                                </button>

                                {/* Item 2 */}
                                <button onClick={() => { handleTabChange('billing'); setIsSearchOpen(false); }} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors w-full text-left group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg border border-[#E2E8F0] dark:border-[#333] flex items-center justify-center bg-white dark:bg-[#111] shrink-0 group-hover:border-[#CBD5E1] dark:group-hover:border-[#444] transition-colors">
                                      <CreditCard className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[13px] font-normal text-[#0F172A] dark:text-white leading-tight">View Billing</span>
                                      <span className="text-[11px] text-[#94A3B8] mt-0.5">Home / billing</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-[#94A3B8] text-[10px] font-normal bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-[#333] px-1.5 py-0.5 rounded">
                                    <span>N</span>
                                    <span>/</span>
                                    <Command className="w-3 h-3" />
                                  </div>
                                </button>

                                {/* Item 3 */}
                                <button onClick={() => { handleTabChange('messages'); setIsSearchOpen(false); }} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors w-full text-left group">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg border border-[#E2E8F0] dark:border-[#333] flex items-center justify-center bg-white dark:bg-[#111] shrink-0 group-hover:border-[#CBD5E1] dark:group-hover:border-[#444] transition-colors">
                                      <MessageSquare className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[13px] font-normal text-[#0F172A] dark:text-white leading-tight">New message from team</span>
                                      <span className="text-[11px] text-[#94A3B8] mt-0.5">Home / messages</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 text-[#94A3B8] text-[10px] font-normal bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-[#333] px-1.5 py-0.5 rounded">
                                    <span>P</span>
                                    <span>/</span>
                                    <Command className="w-3 h-3" />
                                  </div>
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            

            <button 
              onClick={toggleFullscreen}
              className="hidden sm:flex w-10 h-10 items-center justify-center rounded-full text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] transition-colors"
            >
              {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
            </button>
            
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 flex items-center justify-center rounded-full text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] transition-colors"
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>
            

            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen)
                  if (isNotifOpen) setShowAllNotifications(false)
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] transition-colors relative mr-2"
              >
                <FiBell size={18} />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#EF4444] text-white text-[9px] font-normal flex items-center justify-center rounded-full border-2 border-white dark:border-[#111111]">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotifOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsNotifOpen(false)}
                      className="fixed inset-0 z-40 bg-transparent"
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[50px] right-2 w-[350px] bg-white dark:bg-[#111] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#E2E8F0] dark:border-[#333] z-50 flex flex-col overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0] dark:border-[#333]">
                        <h6 className="text-[15px] font-normal text-[#0F172A] dark:text-white">Notifications</h6>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearAllNotifications(); }}
                          className="flex items-center gap-1.5 text-[12px] font-normal text-rose-500 hover:text-rose-600 transition-colors"
                        >
                          <X className="w-4 h-4" /> Clear
                        </button>
                      </div>

                      <div className={`flex flex-col overflow-y-auto hidden-scrollbar transition-all duration-300 ${showAllNotifications ? 'max-h-[70vh]' : 'max-h-[350px]'}`}>
                        {notifs.length === 0 ? (
                          <div className="p-8 text-center text-[#64748B] dark:text-[#94A3B8] text-[13px]">
                            You have no notifications at this time.
                          </div>
                        ) : (
                          (showAllNotifications ? notifs : notifs.slice(0, 5)).map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={() => handleNotificationClick(notif)}
                              className={`flex gap-4 p-5 hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors border-b border-[#E2E8F0] dark:border-[#222] group relative cursor-pointer ${notif.isRead ? 'opacity-70 bg-transparent' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
                            >
                              <div className="w-[42px] h-[42px] rounded-lg flex items-center justify-center shrink-0 bg-[#F1F5F9] dark:bg-[#222]">
                                {getNotificationIcon(notif.type)}
                              </div>
                              <div className="flex flex-col flex-1">
                                <p className="text-[14px] leading-[1.4] text-[#0F172A] dark:text-white pr-4">
                                  <span className="font-normal">{notif.title}</span> <span className="text-[#333] dark:text-[#ccc]">{notif.message}</span>
                                </p>
                                <span className="text-[12px] text-[#64748B] dark:text-[#94A3B8] mt-1.5">
                                  {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              {!notif.isRead && (
                                <div className="absolute top-1/2 -translate-y-1/2 right-4 w-2 h-2 rounded-full bg-blue-500"></div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {notifs.length > 5 && (
                        <div className="p-4 text-center">
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAllNotifications(!showAllNotifications); }}
                            className="text-[13px] font-normal text-[#0F172A] dark:text-white hover:text-[#3454D1] transition-colors"
                          >
                            {showAllNotifications ? "View Less" : "View More"}
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            {/* Profile Avatar */}
            <div className="relative pl-2">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2"
              >
                <div className="w-9 h-9 rounded-full bg-[#E2E8F0] dark:bg-[#333] border border-[#E2E8F0] dark:border-[#333] overflow-hidden flex items-center justify-center shrink-0">
                  {localProfileImage ? (
                    <img src={getImageUrl(localProfileImage) as string} alt="Profile" className="w-9 h-9 object-cover" />
                  ) : (
                    <span className="text-sm font-normal text-[#64748B] dark:text-white">
                      {clientProfile?.clientName?.charAt(0) || 'D'}
                    </span>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsProfileOpen(false)}
                      className="fixed inset-0 z-40 bg-transparent"
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-[50px] right-0 w-[280px] bg-white dark:bg-[#111] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] border border-[#E2E8F0] dark:border-[#333] z-50 flex flex-col"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 p-5 border-b border-[#E2E8F0] dark:border-[#333]">
                        <div className="w-[42px] h-[42px] rounded-full overflow-hidden shrink-0 bg-[#E2E8F0] dark:bg-[#333]">
                          {localProfileImage ? (
                            <img src={getImageUrl(localProfileImage) as string} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-normal text-[#64748B] dark:text-[#94A3B8]">
                              {clientProfile?.clientName?.charAt(0) || 'D'}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] text-[#0F172A] dark:text-white truncate">
                              {clientProfile?.clientName || 'Alexandra Della'}
                            </span>
                          </div>
                          <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 truncate">
                            {clientProfile?.email || 'alex.della@outlook.com'}
                          </span>
                        </div>
                      </div>

                      {/* Section 2 */}
                      <div className="flex flex-col py-2 border-b border-[#E2E8F0] dark:border-[#333]">
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            setSelectedFile(null);
                            setPreviewImage(null);
                            setIsEditProfileModalOpen(true);
                          }}
                          className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors w-full text-left"
                        >
                          <div className="w-4 flex justify-center">
                            <User className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                          </div>
                          <span className="text-[#0F172A] dark:text-white text-[14px]">
                            Edit Profile
                          </span>
                        </button>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsStatusMenuOpen(!isStatusMenuOpen);
                            }}
                            className="flex items-center justify-between px-5 py-2.5 hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors w-full text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-4 flex justify-center">
                                <div className={`w-2.5 h-2.5 rounded-full ${statusColors[activeStatus]}`}></div>
                              </div>
                              <span className="text-[#0F172A] dark:text-white text-[14px]">{activeStatus}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                          </button>
                          
                          {/* Submenu */}
                          <div className={`absolute right-full top-0 mr-1 w-48 bg-white dark:bg-[#0A0A0A] rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.5)] border border-[#E2E8F0]/80 dark:border-[#222] transition-all duration-200 py-2 z-50 ${isStatusMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                            {(Object.keys(statusColors) as Array<keyof typeof statusColors>).map((status) => (
                              <button 
                                key={status}
                                onClick={() => {
                                  setActiveStatus(status);
                                  setIsStatusMenuOpen(false);
                                }}
                                className="flex items-center gap-3 px-5 py-2 hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors w-full text-left"
                              >
                                <div className="w-4 flex justify-center">
                                  <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`}></div>
                                </div>
                                <span className="text-[#0F172A] dark:text-white text-[13px]">{status}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            setActiveTab('billing');
                          }}
                          className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors w-full text-left"
                        >
                          <div className="w-4 flex justify-center">
                            <DollarSign className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                          </div>
                          <span className="text-[#0F172A] dark:text-white text-[14px]">Billing Details</span>
                        </button>
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            setActiveTab('messages');
                          }}
                          className="flex items-center gap-3 px-5 py-2.5 hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors w-full text-left"
                        >
                          <div className="w-4 flex justify-center">
                            <MessageSquare className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
                          </div>
                          <span className="text-[#0F172A] dark:text-white text-[14px]">Messages</span>
                        </button>

                      </div>

                      {/* Logout */}
                      <div className="py-2">
                        <SignOutButton variant="sidebar" />
                      </div>

                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hidden-scrollbar relative flex flex-col">
          
          {/* Page Header (Sub-Navbar) - Now non-sticky and scrolls with content */}
          <div className="shrink-0 bg-white dark:bg-[#111111] border-b border-[#E2E8F0] dark:border-[#222] flex flex-col sm:flex-row sm:items-center justify-between px-4 lg:px-6 py-2 z-10 transition-colors duration-300 w-full">
            <div className="flex items-center gap-4 mb-2 sm:mb-0">
              <h5 className="text-[15px] font-normal text-[#0F172A] dark:text-white capitalize">
                {typeof activeTabData?.label === 'string' ? activeTabData.label : (activeTabData?.id || 'Dashboard')}
              </h5>
              <div className="w-[1px] h-[18px] bg-[#E2E8F0] dark:bg-[#333]"></div>
              <div className="flex items-center text-[13px] text-[#64748B] dark:text-[#94A3B8] gap-2">
                <span className="hover:text-[#3454D1] cursor-pointer transition-colors font-normal">Home</span>
                <span className="text-[#94A3B8] font-normal text-[10px] mx-1">❯</span>
                <span className="capitalize font-normal text-[#94A3B8] dark:text-[#666]">
                  {typeof activeTabData?.label === 'string' ? activeTabData.label : (activeTabData?.id || 'Dashboard')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div id="projects-pagination-portal"></div>
              <button className="px-4 h-[38px] rounded-[6px] border border-[#E2E8F0] dark:border-[#333] text-[12px] font-normal text-[#283C50] dark:text-[#E2E8F0] bg-white dark:bg-[#111] hover:bg-[#F8FAFC] dark:hover:bg-[#222] transition-colors flex items-center justify-center tracking-wide">
                {currentTime ? `${currentTime.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()} - ${currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : '...'}
              </button>
            </div>
          </div>

          {/* Main Tab Content */}
          <div className={`flex-1 ${activeTab === 'messages' ? 'p-0 h-[calc(100%-70px)]' : 'p-4 sm:p-6 md:p-8'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`w-full mx-auto ${activeTab === 'messages' ? 'max-w-none h-full pb-0' : 'max-w-[1400px] pb-10'}`}
              >
                {activeTabData?.content}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Edit Profile Picture Modal */}
      <AnimatePresence>
        {isEditProfileModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isUploading) {
                  setIsEditProfileModalOpen(false);
                  setSelectedFile(null);
                  setPreviewImage(null);
                }
              }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-[420px] bg-white dark:bg-[#0A0A0A] rounded-[24px] shadow-[0_24px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.6)] border border-[#E2E8F0]/80 dark:border-[#222] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]/60 dark:border-[#222]/60 bg-gradient-to-b from-[#F8FAFC] to-white dark:from-[#111] dark:to-[#0A0A0A]">
                <div>
                  <h3 className="text-[18px] font-normal text-[#0F172A] dark:text-white tracking-tight">Edit Profile</h3>
                  <p className="text-[13px] text-[#64748B] dark:text-[#888] mt-0.5">Update your photo and personal details.</p>
                </div>
                <button 
                  onClick={() => {
                    setIsEditProfileModalOpen(false);
                    setSelectedFile(null);
                    setPreviewImage(null);
                  }}
                  disabled={isUploading}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F1F5F9] dark:bg-[#1A1A1A] text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] dark:text-[#94A3B8] dark:hover:text-white dark:hover:bg-[#222] transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-8 flex flex-col items-center">
                <div className="relative group mb-6">
                  <div className="w-[140px] h-[140px] rounded-full bg-gradient-to-br from-[#E2E8F0] to-[#CBD5E1] dark:from-[#222] dark:to-[#111] p-1 shadow-xl">
                    <div className="w-full h-full rounded-full border-4 border-white dark:border-[#0A0A0A] overflow-hidden flex items-center justify-center bg-white dark:bg-[#111]">
                      {previewImage || localProfileImage ? (
                        <img src={getImageUrl(previewImage || localProfileImage) as string} alt="Profile" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <span className="text-[48px] font-normal text-[#94A3B8] dark:text-[#444]">
                          {clientProfile?.clientName?.charAt(0) || 'D'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => document.getElementById('profile-upload-modal-input')?.click()}
                    disabled={isUploading}
                    className="absolute bottom-1 right-1 w-10 h-10 bg-[#3454D1] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#2b44a8] hover:scale-110 transition-all cursor-pointer border-2 border-white dark:border-[#0A0A0A] z-10"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <input 
                  type="file" 
                  id="profile-upload-modal-input" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileSelect}
                />
                
                {selectedFile && (
                  <div className="w-full max-w-[280px] bg-[#F8FAFC] dark:bg-[#111] rounded-xl p-3 flex items-center gap-3 border border-[#E2E8F0] dark:border-[#222] mb-6">
                    <div className="w-8 h-8 rounded-lg bg-[#E0E7FF] dark:bg-[#3454D1]/20 text-[#3454D1] flex items-center justify-center shrink-0">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div className="flex-1 truncate">
                      <p className="text-[13px] font-normal text-[#0F172A] dark:text-white truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-[#64748B] dark:text-[#888]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                )}
                
                <div className="w-full max-w-[320px] mb-2">
                  <label className="block text-[13px] font-normal text-[#0F172A] dark:text-white mb-2">Display Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input 
                      type="text" 
                      value={localClientName}
                      onChange={(e) => setLocalClientName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[14px] text-[#0F172A] dark:text-white outline-none focus:border-[#3454D1] dark:focus:border-[#3454D1] transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-5 bg-[#F8FAFC] dark:bg-[#111]/50 border-t border-[#E2E8F0]/60 dark:border-[#222]/60 flex items-center gap-3 justify-end rounded-b-[24px]">
                <button 
                  onClick={() => {
                    setIsEditProfileModalOpen(false);
                    setSelectedFile(null);
                    setPreviewImage(null);
                    setLocalClientName(clientProfile?.clientName || "");
                  }}
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl text-[14px] font-normal text-[#64748B] dark:text-[#A1A1AA] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:text-white dark:hover:bg-[#222] transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={(!selectedFile && localClientName === clientProfile?.clientName) || isUploading}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-normal text-white bg-[#0F172A] hover:bg-[#1E293B] dark:bg-white dark:text-[#0A0A0A] dark:hover:bg-[#E2E8F0] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(15,23,42,0.15)] dark:shadow-[0_4px_12px_rgba(255,255,255,0.15)]"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ThemeSettingsWidget />
    </div>
  )
}
