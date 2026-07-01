"use client"

import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import Link from "next/link"

export type UnreadClient = {
  id: string
  companyName: string
  messageCount: number
}

export default function NotificationBell({ unreadClients }: { unreadClients: UnreadClient[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const totalUnread = unreadClients.reduce((acc, c) => acc + c.messageCount, 0)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-[#64748B] hover:text-[#5A52FF] hover:bg-[#5A52FF]/10 rounded-full transition-all flex items-center justify-center mt-1"
        title="Notifications"
      >
        <Bell className="w-[22px] h-[22px]" strokeWidth={2.5} />
        {totalUnread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 text-[10px] px-1 font-bold text-white shadow-sm ring-2 ring-[#FAFAFA]">
            {totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-80 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F1F5F9] bg-[#FAFAFA] flex justify-between items-center">
            <h3 className="font-bold text-[#0F172A]">Notifications</h3>
            {totalUnread > 0 && (
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{totalUnread} New</span>
            )}
          </div>
          
          <div className="max-h-[320px] overflow-y-auto">
            {unreadClients.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-[#64748B]">No new messages</p>
                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {unreadClients.map(client => (
                  <Link
                    key={client.id}
                    href={`/admin/client/${client.id}?tab=messages`}
                    onClick={() => setIsOpen(false)}
                    className="block px-5 py-4 hover:bg-[#F8FAFC] border-b border-[#F1F5F9] last:border-0 transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#0F172A] text-[15px] group-hover:text-[#5A52FF] transition-colors">{client.companyName}</p>
                        <p className="text-[13px] text-[#64748B] mt-1">Sent you new messages</p>
                      </div>
                      <span className="flex items-center justify-center bg-red-100 text-red-600 text-xs font-bold h-6 min-w-[24px] px-1.5 rounded-full">
                        {client.messageCount}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
