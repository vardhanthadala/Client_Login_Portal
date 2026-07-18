"use client"

import React, { useState, useRef } from "react"
import Link from "next/link"
import { Eye, Bell } from "lucide-react"
import StatusDropdown from "@/components/StatusDropdown"
import { PremiumIcon } from "@/components/PremiumIcon"
import { format } from "date-fns"

interface ClientData {
  id: string;
  email: string;
  createdAt?: string;
  clientProfile?: {
    id: string;
    companyName?: string | null;
    clientName?: string | null;
    status: string;
  } | null;
  unreadCount: number;
}

const getInitial = (name: string | undefined) => {
  if (!name) return "?"
  return name.charAt(0).toUpperCase()
}

const getAvatarColor = (name: string) => {
  const colors = [
    "bg-[#10B981]", // Emerald
    "bg-[#F59E0B]", // Amber
    "bg-[#3B82F6]", // Blue
    "bg-[#8B5CF6]", // Purple
    "bg-[#EC4899]", // Pink
    "bg-[#14B8A6]", // Teal
  ]
  const hash = (name || "U").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export default function ClientRosterTable({ clients }: { clients: ClientData[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer to load more items when scrolling to the bottom
  const setLastElement = (node: HTMLTableRowElement | null) => {
    if (observerRef.current) observerRef.current.disconnect();
    if (node) {
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 10);
        }
      }, { rootMargin: "100px" }); // Load slightly before reaching the bottom
      observerRef.current.observe(node);
    }
  };

  const filteredClients = clients.filter(client => {
    if (!searchQuery.trim()) return true;
    const companyName = client.clientProfile?.companyName || client.clientProfile?.clientName || "Unknown Company";
    const searchStr = searchQuery.toLowerCase();
    return companyName.toLowerCase().includes(searchStr) || client.email.toLowerCase().includes(searchStr);
  });

  return (
    <div className="bg-white dark:bg-[#171A21] rounded-[8px] shadow-[0_2px_10px_rgba(0,0,0,0.04)] dark:shadow-none border border-[#E5E7EB] dark:border-white/10 w-full flex flex-col">
      {/* ── Table Header Area ── */}
      <div className="px-6 py-4 border-b border-[#F1F5F9] dark:border-white/[0.04] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-[14px] font-normal text-[#1E293B] dark:text-[#CBD5E1]">
            Showing {Math.min(visibleCount, filteredClients.length)} of {filteredClients.length} clients
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[14px] font-normal text-[#1E293B] dark:text-[#CBD5E1]">Search:</span>
          <div className="relative w-[240px]">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#1C1F28] border border-[#E2E8F0] dark:border-white/10 rounded-[6px] px-3 py-1.5 text-[14px] font-normal text-[#0F172A] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#666] focus:outline-none focus:border-[#3B82F6] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="border-b border-[#F1F5F9] dark:border-white/[0.04] bg-white dark:bg-[#171A21]">
              <th className="py-4 px-6 text-[12px] font-normal text-[#1E293B] dark:text-[#CBD5E1] uppercase tracking-wider w-16">#</th>
              <th className="py-4 px-6 text-[12px] font-normal text-[#1E293B] dark:text-[#CBD5E1] uppercase tracking-wider">Client</th>
              <th className="py-4 px-6 text-[12px] font-normal text-[#1E293B] dark:text-[#CBD5E1] uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-[12px] font-normal text-[#1E293B] dark:text-[#CBD5E1] uppercase tracking-wider">Notifications</th>
              <th className="py-4 px-6 text-[12px] font-normal text-[#1E293B] dark:text-[#CBD5E1] uppercase tracking-wider">Date</th>
              <th className="py-4 px-6 text-[12px] font-normal text-[#1E293B] dark:text-[#CBD5E1] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9] dark:divide-white/[0.04]">
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                  No clients found.
                </td>
              </tr>
            ) : (
              filteredClients.slice(0, visibleCount).map((client, index) => {
                const companyName = client.clientProfile?.companyName || client.clientProfile?.clientName || "Unknown Client";
                const avatarColor = getAvatarColor(companyName);

                const formattedDate = client.createdAt ? format(new Date(client.createdAt), "yyyy-MM-dd, hh:mma") : "-";

                const isLastElement = index === Math.min(filteredClients.length, visibleCount) - 1;

                return (
                  <tr
                    key={client.id}
                    ref={isLastElement ? setLastElement : null}
                    className="transition-colors duration-200 bg-white dark:bg-[#171A21] hover:bg-[#F8FAFC] dark:hover:bg-[#1C1F28]/50"
                  >
                    {/* S.No. */}
                    <td className="py-4 px-6 text-[13px] font-normal text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                      {String(index + 1).padStart(2, '0')}
                    </td>

                    {/* Client Details */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`w-[42px] h-[42px] rounded-full flex items-center justify-center shrink-0 ${avatarColor} text-white font-normal text-[16px]`}>
                          {getInitial(companyName)}
                        </div>

                        {/* Text */}
                        <div className="flex flex-col justify-center">
                          <span className="text-[14px] font-normal text-[#334155] dark:text-white leading-tight">
                            {companyName}
                          </span>
                          <span className="text-[13px] font-normal text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                            {client.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {client.clientProfile ? (
                        <div onClick={(e) => e.stopPropagation()} className="w-fit">
                          <StatusDropdown
                            clientProfileId={client.clientProfile.id}
                            currentStatus={client.clientProfile.status || "ONBOARDED"}
                          />
                        </div>
                      ) : (
                        <span className="px-2.5 py-1 rounded-[6px] text-[10px] font-normal uppercase tracking-wider bg-[#F1F5F9] dark:bg-white/5 text-[#64748B] dark:text-[#94A3B8]">
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Notifications */}
                    <td className="py-4 px-6">
                      {client.unreadCount > 0 ? (
                        <div className="flex items-center gap-2 w-fit">
                          <PremiumIcon
                            icon={Bell}
                            wrapperSize="w-7 h-7 rounded-full bg-[#FFFBEB] border-none"
                            iconClassName="text-[#F59E0B]"
                            size={14}
                          />
                          <span className="text-[13px] font-normal text-[#475569] dark:text-white">{client.unreadCount} unread</span>
                        </div>
                      ) : (
                        <span className="text-[13px] font-normal text-[#64748B] dark:text-[#94A3B8]">-</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6">
                      <span className="text-[13px] font-normal text-[#475569] dark:text-[#94A3B8]">
                        {formattedDate}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end">
                        <Link
                          href={client.clientProfile ? `/admin/client/${client.id}` : '#'}
                          className={`group transition-all ${!client.clientProfile ? "cursor-not-allowed opacity-50" : "hover:-translate-y-0.5 hover:shadow-md rounded-full"}`}
                          title="View Profile"
                        >
                          <PremiumIcon
                            icon={Eye}
                            wrapperSize="w-[34px] h-[34px] rounded-full"
                            className={client.clientProfile ? "group-hover:border-[#3B82F6] group-hover:bg-[#EFF6FF] dark:group-hover:bg-[#3B82F6]/10 transition-colors" : ""}
                            iconClassName={client.clientProfile ? "text-[#64748B] group-hover:text-[#3B82F6]" : "text-[#CBD5E1]"}
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
