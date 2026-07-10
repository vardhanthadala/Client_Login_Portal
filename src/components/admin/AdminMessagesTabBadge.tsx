"use client"

import { useNotificationsStore } from "@/store/notificationsStore"

export default function AdminMessagesTabBadge({ clientId }: { clientId: string }) {
  const notifications = useNotificationsStore((state) => state.notifications)
  const unreadMessagesFromClient = notifications.filter(
    (n) => !n.isRead && n.type === "MESSAGE" && n.link?.includes(clientId)
  ).length

  if (unreadMessagesFromClient === 0) return null

  return (
    <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-[#171A21]">
      {unreadMessagesFromClient}
    </span>
  )
}
