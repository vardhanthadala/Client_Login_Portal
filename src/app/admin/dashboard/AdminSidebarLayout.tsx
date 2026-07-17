"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { PremiumIcon } from "@/components/PremiumIcon"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "@/components/ThemeProvider"
import { Moon, Sun, Menu, ChevronDown, ChevronRight, LayoutDashboard, Users, Settings, LifeBuoy, Clock, Building2, Calendar, ShieldCheck, Bell, Search, Plus, Maximize2, Minimize2, User, Activity, CreditCard, LogOut, Key } from "lucide-react"
import SignOutButton from "./SignOutButton"
import Link from "next/link"
import { useNotificationsStore } from "@/store/notificationsStore"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { toast } from "sonner"
import { updateAdminProfileAction, cancelAdminSubscriptionAction } from "@/app/actions/admin"
import ThemeSettingsWidget from "@/components/admin/ThemeSettingsWidget"

export interface TabData {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface AdminSidebarLayoutProps {
  tabs: TabData[];
  initialTab?: string;
  adminName?: string;
  adminUser?: { 
    name: string | null; 
    email: string; 
    image: string | null;
    tenant: {
      subscriptionPlan: string;
      subscriptionStatus: string;
      subscriptionStart: string | Date | null;
      subscriptionEnd: string | Date | null;
      cancelAtPeriodEnd: boolean;
    } | null;
  };
  children?: React.ReactNode;
  clients?: any[];
  activeClientId?: string;
  activeClientTab?: string;
}

export default function AdminSidebarLayout({ tabs, initialTab, adminName, adminUser, children, clients = [], activeClientId, activeClientTab }: AdminSidebarLayoutProps) {
  const finalAdminName = adminUser?.name || adminName || "Admin"
  const getAvatarSrc = (imagePath: string | null | undefined) => {
    if (!imagePath) return ""
    if (imagePath.startsWith("data:") || imagePath.startsWith("blob:") || imagePath.startsWith("/")) {
      return imagePath
    }
    return `/api/file?url=${encodeURIComponent(imagePath)}`
  }
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.id)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false)
  const [isMiniMenu, setIsMiniMenu] = useState(false)
  
  const [currentTime, setCurrentTime] = useState<Date | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isSubscriptionDropdownOpen, setIsSubscriptionDropdownOpen] = useState(false)
  const [isCancellingSubscription, setIsCancellingSubscription] = useState(false)

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? It will remain active until the end of your current billing cycle.")) return

    try {
      setIsCancellingSubscription(true)
      const res = await cancelAdminSubscriptionAction()
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Subscription set to cancel at the end of the current billing cycle.")
        setIsSubscriptionDropdownOpen(false)
      }
    } catch (e) {
      toast.error("Failed to cancel subscription")
    } finally {
      setIsCancellingSubscription(false)
    }
  }

  const statuses = [
    { id: "active", label: "Active", color: "#10B981" },
    { id: "always", label: "Always", color: "#F59E0B" },
    { id: "bussy", label: "Bussy", color: "#EF4444" },
    { id: "inactive", label: "Inactive", color: "#14B8A6" },
    { id: "disabled", label: "Disabled", color: "#1E3A8A" },
    { id: "customization", label: "Customization", color: "#3B82F6" }
  ]
  const [selectedStatus, setSelectedStatus] = useState(statuses[0])

  const [nameValue, setNameValue] = useState(adminUser?.name || "")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(adminUser?.image || null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(adminUser?.image || null)
  const [isUploading, setIsUploading] = useState(false)

  // Sync state values with props when user data loads/updates
  useEffect(() => {
    if (adminUser) {
      setNameValue(adminUser.name || "")
      setAvatarPreview(adminUser.image || null)
      setAvatarUrl(adminUser.image || null)
    }
  }, [adminUser])

  const compressImage = (file: File, maxWidth = 400, quality = 0.8): Promise<{ blob: Blob; contentType: string }> => {
    return new Promise((resolve) => {
      const img = new window.Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const scale = Math.min(1, maxWidth / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => resolve({ blob: blob!, contentType: 'image/jpeg' }), 'image/jpeg', quality)
      }
      img.src = url
    })
  }

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show local preview instantly
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    try {
      setIsUploading(true)

      // Compress image before uploading (faster upload, smaller file)
      const { blob: compressedBlob, contentType } = await compressImage(file)
      const compressedFile = new File([compressedBlob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: contentType })

      // Get presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: compressedFile.name,
          contentType: compressedFile.type,
          fileSize: compressedFile.size
        })
      })

      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        setIsUploading(false)
        return
      }

      const { uploadUrl, fileUrl } = data

      // PUT compressed file to S3
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": compressedFile.type },
        body: compressedBlob
      })

      if (!putRes.ok) throw new Error("Failed to upload file to S3")

      setAvatarUrl(fileUrl)
      setAvatarPreview(fileUrl)

      // Persist image URL to DB
      const saveData = new FormData()
      saveData.append("name", nameValue || finalAdminName)
      saveData.append("imageUrl", fileUrl)
      const saveResult = await updateAdminProfileAction(saveData)
      if (saveResult?.error) {
        console.error("Failed to save image URL:", saveResult.error)
      } else {
        router.refresh()
      }

      toast.success("Profile photo uploaded successfully!")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "Failed to upload photo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameValue) return

    try {
      const formData = new FormData()
      formData.append("name", nameValue)
      if (avatarUrl) {
        formData.append("imageUrl", avatarUrl)
      }

      const result = await updateAdminProfileAction(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Profile settings updated successfully!")
        setIsSettingsModalOpen(false)
        router.refresh()
      }
    } catch (err) {
      toast.error("Failed to update profile settings")
    }
  }

  const handleDropdownSignOut = async () => {
    try {
      const csrfRes = await fetch("/api/auth/csrf")
      const { csrfToken } = await csrfRes.json()
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `csrfToken=${encodeURIComponent(csrfToken)}`,
      })
    } catch (e) {}
    window.location.href = "/login"
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

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
    <div className="flex h-screen w-full bg-[#F0F2F8] dark:bg-[#0F1115] text-[#0F172A] dark:text-[#F8FAFC] overflow-hidden font-sans transition-colors duration-300">
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
          {/* Logo & Workspace Dropdown Placeholder */}
          <div className="p-4 border-b border-[#E5E7EB] dark:border-white/5 relative">
            <div className="flex items-center justify-between mb-2">
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => !isMiniMenu && setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
              >
                <div className="relative w-28 h-8 transition-all duration-200" style={{ width: isMiniMenu ? '36px' : '112px' }}>
                  <Image 
                    src="/images/logo.png" 
                    alt="Dexze Logo" 
                    fill 
                    className="object-contain object-left dark:invert dark:hue-rotate-180 dark:brightness-125 dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.2)]" 
                  />
                </div>
                {/* {!isMiniMenu && <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${isWorkspaceDropdownOpen ? "rotate-180" : ""}`} />} */}
              </div>
              
              {/* Theme Toggle */}
              {/* {!isMiniMenu && (
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-1.5 rounded-lg text-[#64748B] dark:text-[#888] hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              )} */}
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
            {!isMiniMenu && (
              <p className="px-3 text-[11px] font-semibold tracking-wider text-[#64748b] dark:text-[#94A3B8] uppercase mb-3">
                NAVIGATION
              </p>
            )}
            <nav className="flex flex-col gap-1.5">
              <Link
                href="/admin/dashboard?tab=overview"
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors w-full text-left ${
                  (activeTab === "overview" && !pathname.includes("/admin/client"))
                    ? "bg-[#E2E8F0] dark:bg-white/10 text-[#0F172A] dark:text-white" 
                    : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-white/5 hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                <PremiumIcon 
                  icon={LayoutDashboard} 
                  iconClassName={(activeTab === "overview" && !pathname.includes("/admin/client")) ? "text-[#0F172A] dark:text-white" : "text-[#475569] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-white"} 
                />
                {!isMiniMenu && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>Overview</span>
                    {(activeTab === "overview" && !pathname.includes("/admin/client")) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    )}
                  </div>
                )}
              </Link>

              <Link
                href="/admin/dashboard?tab=notifications"
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors w-full text-left relative ${
                  activeTab === "notifications" && !pathname.includes("/admin/client")
                    ? "bg-[#E2E8F0] dark:bg-white/10 text-[#0F172A] dark:text-white" 
                    : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-white/5 hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                <PremiumIcon 
                  icon={Bell} 
                  iconClassName={(activeTab === "notifications" && !pathname.includes("/admin/client")) ? "text-[#0F172A] dark:text-white" : "text-[#475569] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-white"} 
                />
                {!isMiniMenu ? (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      Notifications
                      {unreadCount > 0 && activeTab !== "notifications" && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                          {unreadCount}
                        </span>
                      )}
                    </span>
                    {(activeTab === "notifications" && !pathname.includes("/admin/client")) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    )}
                  </div>
                ) : (
                  unreadCount > 0 && activeTab !== "notifications" && (
                    <span className="absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-sm">
                      {unreadCount}
                    </span>
                  )
                )}
              </Link>

              {/* Clients Link */}
              <Link
                href="/admin/dashboard?tab=clients"
                onClick={() => setIsSidebarOpen(false)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] font-medium transition-colors w-full text-left ${
                  activeTab === "clients"
                    ? "bg-[#E2E8F0] dark:bg-white/10 text-[#0F172A] dark:text-white" 
                    : "text-[#475569] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-white/5 hover:text-[#0F172A] dark:hover:text-white"
                }`}
              >
                <PremiumIcon 
                  icon={Users} 
                  iconClassName={activeTab === "clients" ? "text-[#0F172A] dark:text-white" : "text-[#475569] dark:text-[#94A3B8] group-hover:text-[#0F172A] dark:group-hover:text-white"} 
                />
                {!isMiniMenu && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>Clients</span>
                    {activeTab === "clients" ? (
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
        <header className="h-[72px] shrink-0 border-b border-[#E5E7EB] dark:border-[#222] bg-white dark:bg-[#171A21] flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0">
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

            <div 
              onClick={() => handleTabChange('notifications')} 
              className="relative p-2 text-[#64748B] dark:text-[#94A3B8] hover:bg-[#FAFBFD] dark:hover:bg-[#1A1A1A] rounded-[4px] transition-colors cursor-pointer"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && activeTab !== "notifications" && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-[3px] bg-[#ea4d4d] text-[8px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            {/* User Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-8 h-8 rounded-full overflow-hidden border border-[#E5E7EB] bg-[#eff1f6] dark:bg-[#1e293b] flex items-center justify-center font-bold text-sm text-[#0F172A] dark:text-white shrink-0 cursor-pointer outline-none focus:ring-2 focus:ring-[#3454d1]"
                title={finalAdminName}
              >
                {(avatarPreview || adminUser?.image) ? (
                  <img src={getAvatarSrc(avatarPreview || adminUser?.image)} alt={finalAdminName} className="w-full h-full object-cover" />
                ) : (
                  finalAdminName[0].toUpperCase()
                )}
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
                        {(avatarPreview || adminUser?.image) ? (
                          <img src={getAvatarSrc(avatarPreview || adminUser?.image)} alt={finalAdminName} className="w-full h-full object-cover" />
                        ) : (
                          finalAdminName[0].toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-normal text-[14px] text-[#0F172A] dark:text-white truncate block">{finalAdminName}</span>
                          <span className="bg-[#22C55E]/10 text-[#22C55E] text-[9px] font-[700] px-1.5 py-0.5 rounded uppercase tracking-wider">ADMIN</span>
                        </div>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate block mt-0.5">{adminUser?.email}</span>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="py-1.5 flex flex-col gap-0.5 relative">
                      {/* Active Status Row (Nested dropdown trigger) */}
                      <div className="relative">
                        <button 
                          onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-normal text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedStatus.color }} />
                            <span>{selectedStatus.label}</span>
                          </div>
                          <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Status Options Submenu */}
                        {isStatusDropdownOpen && (
                          <div className="absolute left-[-170px] top-0 w-[160px] bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-1 z-[60] flex flex-col gap-0.5">
                            {statuses.map(st => (
                              <button
                                key={st.id}
                                onClick={() => {
                                  setSelectedStatus(st)
                                  setIsStatusDropdownOpen(false)
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#475569] dark:text-[#94A3B8] hover:bg-[#F8FAFC] dark:hover:bg-white/5 text-left transition-colors"
                              >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                                <span>{st.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Subscriptions */}
                      <button 
                        onClick={() => {
                          handleTabChange("billing")
                          setIsProfileOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-normal text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-white/5 text-left transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[14px] font-medium">$</span>
                          <span>Subscriptions</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-[#64748B] -rotate-90" />
                      </button>

                      <hr className="my-1 border-[#F1F5F9] dark:border-white/5" />

                      {/* Account Settings Option */}
                      <button 
                        onClick={() => {
                          setIsSettingsModalOpen(true)
                          setIsProfileOpen(false)
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-normal text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-white/5 text-left transition-colors"
                      >
                        <Settings className="w-4 h-4 text-[#64748B]" />
                        <span>Account Settings</span>
                      </button>

                      {/* Portal Settings Option */}
                      <button 
                        onClick={() => {
                          handleTabChange("portal-settings")
                          setIsProfileOpen(false)
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-normal text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F8FAFC] dark:hover:bg-white/5 text-left transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Key className="w-4 h-4 text-[#64748B]" />
                          <span>Portal Settings</span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-[#64748B] -rotate-90" />
                      </button>

                      <hr className="my-1 border-[#F1F5F9] dark:border-white/5" />

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

      {/* Account Settings Modal */}
      <AnimatePresence>
        {isSettingsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-[450px] bg-white dark:bg-[#171A21] border border-slate-200 dark:border-white/5 rounded-[24px] shadow-[0_30px_90px_rgba(0,0,0,0.15)] overflow-hidden z-10"
            >
              <div className="p-6 sm:p-8">
                <h3 className="text-xl font-normal text-slate-900 dark:text-white tracking-tight mb-2 font-sans">Account Settings</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6 font-normal font-sans">Manage your administrator profile details and profile picture.</p>

                <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 font-sans">
                  {/* Avatar Upload Selection Block */}
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white dark:border-[#171A21] bg-[#eff1f6] dark:bg-slate-800 flex items-center justify-center font-normal text-2xl text-slate-800 dark:text-white shrink-0 shadow-sm">
                      {avatarPreview ? (
                        <img src={getAvatarSrc(avatarPreview)} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        nameValue ? nameValue[0].toUpperCase() : "A"
                      )}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-normal text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Profile Photo</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarFileChange} 
                        className="hidden" 
                        id="avatar-upload-input"
                        disabled={isUploading}
                      />
                      <label 
                        htmlFor="avatar-upload-input" 
                        className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1C2029] text-xs font-normal text-[#3454d1] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        {isUploading ? "Uploading..." : "Upload New Picture"}
                      </label>
                    </div>
                  </div>

                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-slate-500 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text"
                      value={nameValue}
                      onChange={(e) => setNameValue(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1C2029] text-sm text-slate-900 dark:text-white outline-none focus:border-[#3454d1] focus:ring-1 focus:ring-[#3454d1] transition-all font-normal"
                      placeholder="e.g. Alexandra Della"
                      required
                    />
                  </div>

                  {/* Email field (Read-only) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-normal text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email Address (Login Credential)</label>
                    <input 
                      type="email"
                      value={adminUser?.email || ""}
                      readOnly
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm text-slate-400 cursor-not-allowed outline-none font-normal"
                    />
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button 
                      type="button"
                      onClick={() => setIsSettingsModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1C2029] text-xs font-normal text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                      disabled={isUploading}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#3454d1] text-xs font-normal text-white hover:bg-[#2541a5] transition-colors"
                      disabled={isUploading}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


    </div>
  )
}
