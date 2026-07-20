"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Megaphone, Power, PowerOff } from "lucide-react"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getMaintenanceMode, setMaintenanceMode, sendBroadcastAction } from "@/app/actions/superadmin"

export default function BroadcastTab() {
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState("MAINTENANCE")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sendEmail, setSendEmail] = useState(true)
  const [sendInApp, setSendInApp] = useState(true)
  
  // Scheduling state
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false)
  const [togglingMaintenance, setTogglingMaintenance] = useState(false)

  useEffect(() => {
    getMaintenanceMode().then((res) => {
      if (res.success) {
        setIsMaintenanceMode(res.isMaintenanceMode || false)
      }
    })
  }, [])

  const handleToggleMaintenance = async () => {
    setTogglingMaintenance(true)
    const newState = !isMaintenanceMode
    const res = await setMaintenanceMode(newState)
    if (res.error) {
      toast.error(res.error)
    } else {
      setIsMaintenanceMode(newState)
      toast.success(newState ? "Maintenance mode ENABLED. Platform is now locked down." : "Maintenance mode DISABLED. Platform is now live.")
    }
    setTogglingMaintenance(false)
  }

  const handleBroadcast = async () => {
    if (!subject || !message) {
      toast.error("Please fill in both subject and message.")
      return
    }
    
    if (!sendEmail && !sendInApp) {
      toast.error("Please select at least one delivery method (Email or In-App).")
      return
    }
    
    setLoading(true)

    const broadcastRes = await sendBroadcastAction({
      subject,
      message,
      sendEmail,
      sendInApp,
      isMaintenanceType: type === "MAINTENANCE",
      startTime: type === "MAINTENANCE" ? startTime : undefined,
      endTime: type === "MAINTENANCE" ? endTime : undefined
    })
    
    if (broadcastRes.error) {
      toast.error(broadcastRes.error)
    } else {
      toast.success(type === "MAINTENANCE" && startTime ? `Maintenance scheduled and broadcast sent to ${broadcastRes.count} admins!` : `Broadcast sent successfully to ${broadcastRes.count} admins!`)
      setSubject("")
      setMessage("")
      setStartTime("")
      setEndTime("")
    }
    
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-medium text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Broadcast Center
          </h2>
          <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-2 font-normal">
            Send announcements, alerts, or updates to all your company admins instantly.
          </p>
        </div>

        {/* Manual Maintenance Toggle */}
        <div className="flex items-center gap-3 bg-white dark:bg-[#111] p-2 pr-4 rounded-full border border-gray-100 dark:border-[#222] shadow-sm">
          <Button
            onClick={handleToggleMaintenance}
            disabled={togglingMaintenance}
            variant="ghost"
            size="icon"
            className={`w-10 h-10 rounded-full ${isMaintenanceMode ? 'bg-rose-100 text-rose-600 hover:bg-rose-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {togglingMaintenance ? <Loader2 className="w-4 h-4 animate-spin" /> : (isMaintenanceMode ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />)}
          </Button>
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-gray-900 dark:text-white">Maintenance Mode</span>
            <span className={`text-[11px] font-medium ${isMaintenanceMode ? 'text-rose-600' : 'text-emerald-500'}`}>
              {isMaintenanceMode ? 'System Locked Down' : 'System is Live'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Composer Card */}
      <div className="bg-white dark:bg-[#111] rounded-[24px] border border-gray-100 dark:border-[#222] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] overflow-hidden">
        
        {/* Top Controls Row */}
        <div className="p-6 border-b border-gray-100 dark:border-[#222] flex flex-col md:flex-row gap-6 md:items-center bg-gray-50/50 dark:bg-white/[0.01]">
          <div className="flex-1">
            <label className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-2 block">
              Message Type
            </label>
            <Select value={type} onValueChange={(val) => setType(val || "STANDARD")}>
              <SelectTrigger className="w-full sm:max-w-[280px] h-10 rounded-lg border-0 bg-white dark:bg-[#1A1E24] shadow-sm ring-1 ring-inset ring-gray-200 dark:ring-[#333] focus:ring-2 focus:ring-inset focus:ring-indigo-600 px-3 py-2 text-[14px] text-gray-900 dark:text-white font-medium cursor-pointer transition-all">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent alignItemWithTrigger={false} sideOffset={8} className="bg-white dark:bg-[#1A1E24] border border-gray-100 dark:border-[#333] rounded-xl shadow-xl p-2 min-w-[240px]">
                <SelectItem value="MAINTENANCE" className="py-2.5 px-3 text-[13px] font-medium cursor-pointer rounded-lg my-1 focus:bg-indigo-50 dark:focus:bg-indigo-500/10 focus:text-indigo-700 dark:focus:text-indigo-300 transition-colors">Scheduled Maintenance</SelectItem>
                <SelectItem value="FEATURE" className="py-2.5 px-3 text-[13px] font-medium cursor-pointer rounded-lg my-1 focus:bg-indigo-50 dark:focus:bg-indigo-500/10 focus:text-indigo-700 dark:focus:text-indigo-300 transition-colors">New Feature Update</SelectItem>
                <SelectItem value="ALERT" className="py-2.5 px-3 text-[13px] font-medium cursor-pointer rounded-lg my-1 text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-700 dark:focus:text-rose-400 transition-colors">Critical Alert</SelectItem>
                <SelectItem value="GENERAL" className="py-2.5 px-3 text-[13px] font-medium cursor-pointer rounded-lg my-1 focus:bg-indigo-50 dark:focus:bg-indigo-500/10 focus:text-indigo-700 dark:focus:text-indigo-300 transition-colors">General Announcement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-5.5 flex items-center rounded-full p-1 transition-colors duration-300 ${sendInApp ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${sendInApp ? 'translate-x-4.5' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={sendInApp} onChange={(e) => setSendInApp(e.target.checked)} />
              <span className="text-[13px] font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                In-App Push
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-5.5 flex items-center rounded-full p-1 transition-colors duration-300 ${sendEmail ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ${sendEmail ? 'translate-x-4.5' : 'translate-x-0'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
              <span className="text-[13px] font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                Email Blast
              </span>
            </label>
          </div>
        </div>

        {/* Composer Area */}
        <div className="flex flex-col">
          {/* Subject Line */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-[#222]">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject: e.g., Important Platform Update"
              className="w-full bg-transparent border-0 text-[18px] font-medium text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600 focus:outline-none focus:ring-0 p-0"
            />
          </div>

          {/* Message Body */}
          <div className="p-6">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here. Markdown is supported..."
              rows={12}
              className="w-full bg-transparent border-0 text-[15px] font-normal leading-relaxed text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-0 p-0 resize-none"
            />

            {type === "MAINTENANCE" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 bg-orange-50 dark:bg-orange-500/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                <div>
                  <label className="block text-[13px] font-semibold text-orange-800 dark:text-orange-400 mb-2">Schedule Start (Local Time)</label>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      value={startTime.split('T')[0] || ''}
                      onChange={(e) => setStartTime(e.target.value ? `${e.target.value}T${startTime.split('T')[1] || '00:00'}` : '')}
                      className="w-1/2 bg-white dark:bg-[#222] border-0 rounded-xl p-2.5 text-[14px] text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                    />
                    <input 
                      type="time" 
                      value={startTime.split('T')[1] || ''}
                      onChange={(e) => setStartTime(startTime.split('T')[0] ? `${startTime.split('T')[0]}T${e.target.value || '00:00'}` : '')}
                      className="w-1/2 bg-white dark:bg-[#222] border-0 rounded-xl p-2.5 text-[14px] text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                    />
                  </div>
                  <p className="text-[11px] text-orange-600/70 dark:text-orange-500/70 mt-1.5 font-medium">When should the system automatically lock down?</p>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-orange-800 dark:text-orange-400 mb-2">Schedule End (Optional)</label>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      value={endTime.split('T')[0] || ''}
                      onChange={(e) => setEndTime(e.target.value ? `${e.target.value}T${endTime.split('T')[1] || '00:00'}` : '')}
                      className="w-1/2 bg-white dark:bg-[#222] border-0 rounded-xl p-2.5 text-[14px] text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                    />
                    <input 
                      type="time" 
                      value={endTime.split('T')[1] || ''}
                      onChange={(e) => setEndTime(endTime.split('T')[0] ? `${endTime.split('T')[0]}T${e.target.value || '00:00'}` : '')}
                      className="w-1/2 bg-white dark:bg-[#222] border-0 rounded-xl p-2.5 text-[14px] text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 shadow-sm"
                    />
                  </div>
                  <p className="text-[11px] text-orange-600/70 dark:text-orange-500/70 mt-1.5 font-medium">When should the system automatically go live again?</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-[#222] flex items-center justify-between">
          <p className="text-[12px] font-normal text-gray-400 dark:text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Ready to broadcast to {type === "ALERT" ? "all active users" : "company admins"}
          </p>
          <Button 
            onClick={handleBroadcast} 
            disabled={loading} 
            className="h-11 px-8 rounded-full text-[14px] font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Megaphone className="w-4 h-4 mr-2" />}
            Send Broadcast
          </Button>
        </div>
      </div>
    </div>
  )
}
