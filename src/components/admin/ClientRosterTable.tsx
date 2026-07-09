"use client"

import React, { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PremiumIcon } from "@/components/PremiumIcon"
import { Bell, Info, ArrowRight, LayoutDashboard, FolderKanban, CheckSquare, Receipt, MessageSquare, Search } from "lucide-react"
import StatusDropdown from "@/components/StatusDropdown"
import { Button } from "@/components/ui/button"

interface ClientData {
  id: string;
  email: string;
  clientProfile?: {
    id: string;
    companyName?: string | null;
    clientName?: string | null;
    status: string;
  } | null;
  unreadCount: number;
}

export default function ClientRosterTable({ clients }: { clients: ClientData[] }) {
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleExpand = (id: string) => {
    if (expandedClientId === id) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(id);
    }
  };

  const clientTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "approvals", label: "Approvals", icon: CheckSquare },
    { id: "billing", label: "Billing & Invoices", icon: Receipt },
    { id: "messages", label: "Messages", icon: MessageSquare }
  ];

  const filteredClients = clients.filter(client => {
    if (!searchQuery.trim()) return true;
    const companyName = client.clientProfile?.companyName || client.clientProfile?.clientName || "Unknown Company";
    const searchStr = searchQuery.toLowerCase();
    return companyName.toLowerCase().includes(searchStr) || client.email.toLowerCase().includes(searchStr);
  });

  return (
    <div className="bg-[#FFFFFF] dark:bg-[#171A21] border border-[#0F172A]/5 dark:border-white/5 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)] w-full">
      <div className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="border-b border-[#0F172A]/5 dark:border-white/5">
              <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] dark:text-[#888] uppercase tracking-wider w-16">#</th>
              <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] dark:text-[#888] uppercase tracking-wider">Client / Project Name</th>
              <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] dark:text-[#888] uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] dark:text-[#888] tracking-wider w-full">
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-[#94A3B8]" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search clients..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#FAFBFD] dark:bg-[#1C2029] border border-[#0F172A]/10 dark:border-white/10 rounded-full pl-10 pr-4 py-2 text-[13px] font-medium text-[#0F172A] dark:text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition-all"
                  />
                </div>
              </th>
              <th className="py-4 px-6 text-[12px] font-bold text-[#64748B] dark:text-[#888] uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-[#64748B] dark:text-[#888]">
                  <p className="text-lg font-bold text-[#0F172A] dark:text-white mb-2 tracking-tight">No clients found</p>
                  <p className="text-sm font-medium">Try adjusting your search query or invite a new client.</p>
                </td>
              </tr>
            ) : (
              filteredClients.map((client, index) => {
                const isExpanded = expandedClientId === client.id;
                const companyName = client.clientProfile?.companyName || client.clientProfile?.clientName || "Unknown Company";

                return (
                  <React.Fragment key={client.id}>
                    <tr className={`border-b border-[#0F172A]/5 dark:border-white/5 transition-colors hover:bg-[#FAFBFD] dark:hover:bg-[#1C2029] ${isExpanded ? 'bg-[#FAFBFD] dark:bg-[#1C2029]' : ''}`}>
                      <td className="py-4 px-6 text-[14px] font-bold text-[#94A3B8] dark:text-[#666]">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-[15px] font-bold text-[#0F172A] dark:text-white tracking-tight">
                              {companyName}
                            </span>
                          </div>
                          <span className="text-[13px] text-[#64748B] dark:text-[#888] mt-0.5 font-medium">
                            {client.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {client.clientProfile ? (
                          <div onClick={(e) => e.stopPropagation()}>
                            <StatusDropdown
                              clientProfileId={client.clientProfile.id}
                              currentStatus={client.clientProfile.status || "ONBOARDED"}
                            />
                          </div>
                        ) : (
                          <span className="px-3 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6"></td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {client.unreadCount > 0 && (
                            <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" title={`${client.unreadCount} unread message(s)`}>
                              <Bell className="w-4 h-4" />
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                                {client.unreadCount}
                              </span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => toggleExpand(client.id)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                              isExpanded 
                                ? "bg-[#22C55E] text-white" 
                                : "bg-[#FAFBFD] dark:bg-[#1C2029] border border-[#0F172A]/5 dark:border-white/5 text-[#64748B] dark:text-[#888] hover:bg-[#22C55E] hover:text-white dark:hover:bg-[#22C55E] dark:hover:text-white"
                            }`}
                            title="Information"
                          >
                            <Info className="w-4 h-4" />
                          </button>

                          <Button 
                            variant="outline" 
                            disabled={!client.clientProfile}
                            onClick={() => toggleExpand(client.id)}
                            className="bg-[#FFFFFF] dark:bg-[#171A21] border-[#0F172A]/10 dark:border-white/10 hover:bg-[#22C55E] hover:text-white hover:border-[#22C55E] dark:hover:bg-[#22C55E] dark:hover:border-[#22C55E] rounded-[10px] text-[13px] font-semibold transition-all h-9 px-4"
                          >
                            View Details <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expandable Sub-tabs Row */}
                    <AnimatePresence>
                      {isExpanded && client.clientProfile && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-[#FAFBFD] dark:bg-[#1C2029] border-b border-[#0F172A]/5 dark:border-white/5"
                        >
                          <td colSpan={5} className="py-4 px-6 overflow-hidden">
                            <motion.div 
                              initial={{ y: -10 }}
                              animate={{ y: 0 }}
                              className="flex flex-wrap items-center gap-3 pb-1"
                            >
                              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#666] uppercase tracking-wider mr-2 shrink-0">
                                Quick Navigation:
                              </span>
                              {clientTabs.map(tab => (
                                <Link 
                                  key={tab.id}
                                  href={`/admin/client/${client.id}?tab=${tab.id}`}
                                  className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#FFFFFF] dark:bg-[#171A21] border border-[#0F172A]/5 dark:border-white/5 text-[13px] font-semibold text-[#475569] dark:text-[#94A3B8] hover:border-[#22C55E]/40 hover:text-[#22C55E] dark:hover:text-[#22C55E] transition-all shadow-sm hover:shadow-[0_4px_20px_rgba(34,197,94,0.1)] group whitespace-nowrap shrink-0"
                                >
                                  <PremiumIcon 
                                    icon={tab.icon} 
                                    size={14} 
                                    wrapperSize="w-6 h-6 rounded-[8px] bg-transparent border-none shadow-none group-hover:bg-[#F8FAFC] dark:group-hover:bg-[#1A1A1A] group-hover:border-[#E2E8F0]/50" 
                                    iconClassName="text-[#475569] dark:text-[#94A3B8] group-hover:text-[#22C55E] dark:group-hover:text-[#22C55E] opacity-70 group-hover:opacity-100" 
                                  />
                                  {tab.label}
                                </Link>
                              ))}
                            </motion.div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
