"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Bell, Check } from "lucide-react"
import { useNotificationsStore } from "@/store/notificationsStore"
import { formatDistanceToNowStrict, format, isToday, isYesterday } from "date-fns"

import { useSearchParams } from "next/navigation"

type FilterTab = "all" | "new"

export default function AdminNotificationsTabClient() {
  const { notifications, markAsRead, markAllAsRead } = useNotificationsStore()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  const [filterTab, setFilterTab] = useState<FilterTab>("all")
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleMarkRead = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    markAsRead(id)
  }

  const visibleNotifications = notifications
    .filter(n => !dismissedIds.has(n.id))
    .filter(n => {
      if (filterTab === "new") return !n.isRead
      return true
    })
    .sort((a, b) => {
      if (!a.isRead && b.isRead) return -1
      if (a.isRead && !b.isRead) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const groupNotifications = () => {
    const groups: { label: string; items: typeof visibleNotifications }[] = []
    const map = new Map<string, typeof visibleNotifications>()

    visibleNotifications.forEach(n => {
      const d = new Date(n.createdAt)
      let label: string
      if (isToday(d)) label = "Today"
      else if (isYesterday(d)) label = "Yesterday"
      else label = format(d, "dd - MMMM - yyyy")

      if (!map.has(label)) map.set(label, [])
      map.get(label)!.push(n)
    })

    map.forEach((items, label) => groups.push({ label, items }))
    return groups
  }

  const grouped = groupNotifications()

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    const diffMs = Date.now() - d.getTime()
    const diffMins = diffMs / (1000 * 60)

    if (diffMins < 60) {
      return formatDistanceToNowStrict(d, { addSuffix: true })
    }
    return format(d, "h:mm a")
  }

  const getAccentColor = (type: string, title: string) => {
    if (type === "INVOICE") return "#EF4444"
    if (type === "APPROVAL" && title.toLowerCase().includes("change")) return "#F59E0B"
    if (type === "APPROVAL") return "#22C55E"
    return "#3B82F6"
  }

  const getAvatarGradient = (name: string) => {
    const colors = [
      "from-[#6366F1] to-[#8B5CF6]",
      "from-[#3B82F6] to-[#2DD4BF]",
      "from-[#F59E0B] to-[#EF4444]",
      "from-[#EC4899] to-[#8B5CF6]",
      "from-[#22C55E] to-[#14B8A6]",
      "from-[#F97316] to-[#F59E0B]",
      "from-[#06B6D4] to-[#3B82F6]",
      "from-[#8B5CF6] to-[#EC4899]",
    ]
    const hash = (name || "U").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const getInitial = (name: string | undefined) => {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
  }

  const getTypeLabel = (type: string) => {
    if (type === "MESSAGE") return "Message"
    if (type === "APPROVAL") return "Approval"
    if (type === "INVOICE") return "Invoice"
    return "System"
  }

  const getTypeBadgeStyles = (type: string, title: string) => {
    if (type === "INVOICE") return "bg-[#FEF2F2] text-[#DC2626] dark:bg-[#EF4444]/15 dark:text-[#F87171]"
    if (type === "APPROVAL" && title.toLowerCase().includes("change")) return "bg-[#FFFBEB] text-[#D97706] dark:bg-[#F59E0B]/15 dark:text-[#FBBF24]"
    if (type === "APPROVAL") return "bg-[#F0FDF4] text-[#16A34A] dark:bg-[#22C55E]/15 dark:text-[#4ADE80]"
    return "bg-[#EFF6FF] text-[#2563EB] dark:bg-[#3B82F6]/15 dark:text-[#60A5FA]"
  }

  const filterTabs: { id: FilterTab; label: string; count?: number }[] = [
    { id: "all", label: "All" },
    { id: "new", label: "New", count: unreadCount || undefined },
  ]

  return (
    <div className="flex flex-col w-full">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-baseline gap-3">
          <h2 className="text-[28px] font-normal tracking-tight text-[#0F172A] dark:text-white font-sans">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="text-[11px] font-semibold text-white bg-[#22C55E] px-2.5 py-[3px] rounded-full tabular-nums shadow-[0_2px_6px_rgba(34,197,94,0.35)]">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-[13px] font-normal text-[#22C55E] hover:text-[#16A34A] transition-colors cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-0.5 p-1 bg-[#F1F5F9] dark:bg-[#1C2029] rounded-[10px] w-fit mb-6">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={`text-[13px] font-medium px-4 py-[7px] rounded-[8px] transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
              filterTab === tab.id
                ? "bg-white dark:bg-[#252830] text-[#0F172A] dark:text-white shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                : "text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
            }`}
          >
            {tab.label}
            {tab.count && tab.count > 0 && (
              <span className={`text-[10px] font-semibold tabular-nums min-w-[18px] h-[18px] flex items-center justify-center rounded-full ${
                filterTab === tab.id
                  ? "bg-[#22C55E] text-white"
                  : "bg-[#22C55E]/15 text-[#22C55E]"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {visibleNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#171A21] rounded-[16px] border border-[#F1F5F9] dark:border-white/[0.06]">
          <div className="w-14 h-14 bg-gradient-to-br from-[#F1F5F9] to-[#E2E8F0] dark:from-[#1C2029] dark:to-[#171A21] rounded-full flex items-center justify-center mb-4 shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
            <Bell className="w-6 h-6 text-[#94A3B8] dark:text-[#555]" />
          </div>
          <p className="text-[15px] font-medium text-[#475569] dark:text-[#94A3B8]">
            {filterTab === "new" ? "No new notifications" : "No notifications yet"}
          </p>
          <p className="text-[13px] font-normal text-[#94A3B8] dark:text-[#555] mt-1.5">
            We'll let you know when something needs your attention.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map((group) => (
            <div key={group.label}>
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-3 px-1">
                <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-[0.08em] whitespace-nowrap">
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-[#E2E8F0] dark:from-white/[0.06] to-transparent" />
                <span className="text-[11px] font-normal text-[#94A3B8] dark:text-[#555] tabular-nums">
                  {group.items.length} notification{group.items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Notification Cards */}
              <div className="rounded-[14px] border border-[#E5E7EB]/60 dark:border-white/[0.06] overflow-hidden bg-white dark:bg-[#171A21] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                {group.items.map((item, index) => {
                  const accentColor = getAccentColor(item.type, item.title)
                  const isLast = index === group.items.length - 1
                  const avatarGrad = getAvatarGradient(item.clientName || "")

                  return (
                    <Link
                      key={item.id}
                      href={item.link || "#"}
                      onClick={() => markAsRead(item.id)}
                      className={`group flex items-center gap-4 py-4 pl-0 pr-5 sm:pr-7 transition-all duration-150 relative ${
                        !isLast ? "border-b border-[#F1F5F9] dark:border-white/[0.04]" : ""
                      } ${
                        !item.isRead
                          ? "bg-white dark:bg-[#171A21]"
                          : "bg-[#FAFBFC] dark:bg-[#15181F]"
                      } hover:bg-[#F8FAFC] dark:hover:bg-[#1C1F28]`}
                    >
                      {/* Accent bar */}
                      <div
                        className="self-stretch w-[3px] rounded-r-full shrink-0 transition-opacity"
                        style={{ backgroundColor: !item.isRead ? accentColor : "transparent" }}
                      />

                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br ${avatarGrad} shadow-[0_2px_8px_rgba(0,0,0,0.12)] ${item.isRead ? "opacity-50" : ""} transition-all group-hover:scale-105`}>
                        <span className="text-[14px] font-semibold text-white leading-none">
                          {getInitial(item.clientName)}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-[2px]">
                          <span className={`text-[14px] leading-snug truncate ${
                            item.isRead
                              ? "font-normal text-[#64748B] dark:text-[#94A3B8]"
                              : "font-semibold text-[#0F172A] dark:text-white"
                          }`}>
                            {item.title}
                          </span>

                          {/* Type badge */}
                          <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-[2px] rounded-[5px] ${getTypeBadgeStyles(item.type, item.title)}`}>
                            {getTypeLabel(item.type)}
                          </span>
                        </div>

                        {/* Client + Message */}
                        <p className={`text-[13px] leading-snug truncate ${
                          item.isRead ? "text-[#94A3B8] dark:text-[#555]" : "text-[#475569] dark:text-[#CBD5E1]"
                        }`}>
                          {item.clientName && (
                            <span className="font-medium">{item.clientName}</span>
                          )}
                          {item.clientName && item.message ? " — " : ""}
                          <span className="font-normal">{item.message}</span>
                        </p>
                      </div>

                      {/* Right */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[12px] font-normal tabular-nums whitespace-nowrap ${
                          item.isRead ? "text-[#94A3B8] dark:text-[#555]" : "text-[#64748B] dark:text-[#94A3B8]"
                        }`}>
                          {formatTime(item.createdAt)}
                        </span>

                        {!item.isRead && (
                          <button
                            onClick={(e) => handleMarkRead(e, item.id)}
                            className="w-7 h-7 rounded-[8px] flex items-center justify-center text-[#94A3B8] hover:text-[#22C55E] hover:bg-[#F0FDF4] dark:hover:text-[#4ADE80] dark:hover:bg-[#22C55E]/10 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
