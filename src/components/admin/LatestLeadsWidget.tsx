"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"

export type LeadData = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  joinedDate: Date;
  projectStatuses: string[];
  totalPaid: number;
  lastPaid: number;
}

export default function LatestLeadsWidget({ leads = [] }: { leads?: LeadData[] }) {
  const displayLeads = leads.slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    
    // Green (Success / Finished)
    if (s.includes("complete") || s.includes("finish") || s.includes("done") || s.includes("success") || s.includes("deliver")) {
      return "bg-[#DCFCE7] text-[#15803D] dark:bg-[#166534]/30 dark:text-[#4ADE80]";
    }
    
    // Blue (In Progress / Active)
    if (s.includes("progress") || s.includes("active") || s.includes("develop") || s.includes("build") || s.includes("creat")) {
      return "bg-[#EEF2FF] text-[#4F46E5] dark:bg-[#3730A3]/30 dark:text-[#818CF8]";
    }
    
    // Orange / Yellow (Review / Revisions / QA)
    if (s.includes("review") || s.includes("revision") || s.includes("wait") || s.includes("test") || s.includes("qa") || s.includes("check")) {
      return "bg-[#FFEDD5] text-[#C2410C] dark:bg-[#9A3412]/30 dark:text-[#FB923C]";
    }
    
    // Red (Cancelled / Failed / Stopped)
    if (s.includes("cancel") || s.includes("fail") || s.includes("stop") || s.includes("halt") || s.includes("pause") || s.includes("reject")) {
      return "bg-[#FEE2E2] text-[#B91C1C] dark:bg-[#7F1D1D]/30 dark:text-[#F87171]";
    }
    
    // Pink / Purple (Planning / Design / Onboarding)
    if (s.includes("design") || s.includes("plan") || s.includes("onboard") || s.includes("kickoff") || s.includes("start") || s.includes("init")) {
      return "bg-[#FCE7F3] text-[#BE185D] dark:bg-[#831843]/30 dark:text-[#F472B6]";
    }
    
    // Cyan / Teal (Research / Discovery)
    if (s.includes("research") || s.includes("discover") || s.includes("brainstorm") || s.includes("analy")) {
      return "bg-[#CCFBF1] text-[#0F766E] dark:bg-[#134E4A]/30 dark:text-[#2DD4BF]";
    }
    
    // Default (Gray)
    return "bg-[#F1F5F9] text-[#475569] dark:bg-[#1E293B] dark:text-[#CBD5E1]";
  }

  return (
    <Card className="bg-white dark:bg-[#171A21] border border-[#E5E7EB] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-w-0 overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-[#E5E7EB] dark:border-white/5 pb-0 pt-6 sm:px-8 sm:pt-8 border-b-0">
        <CardTitle className="text-lg font-sans font-semibold text-[#0F172A] dark:text-white tracking-tight mb-4">
          Latest Leads
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB] dark:border-white/5 bg-white dark:bg-[#171A21]">
                <th className="px-6 py-3 text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider w-[30%]">
                  USERS
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">
                  JOINED DATE
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">
                  TOTAL PAID
                </th>
                <th className="px-6 py-3 text-[11px] font-semibold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">
                  LAST PAID
                </th>
              </tr>
            </thead>
            <tbody>
              {displayLeads.length > 0 ? displayLeads.map((lead, index) => (
                <tr 
                  key={lead.id} 
                  className={`border-b border-[#E5E7EB] dark:border-white/5 ${
                    index % 2 === 0 ? 'bg-white dark:bg-[#171A21]' : 'bg-[#F8FAFC] dark:bg-white/[0.02]'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full border border-[#E2E8F0] dark:border-white/10 overflow-hidden bg-[#eff1f6] dark:bg-[#1C2029] flex items-center justify-center shrink-0">
                        {lead.avatar ? (
                          <img src={lead.avatar} alt={lead.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#64748b] dark:text-white font-medium text-[14px]">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-medium text-[#1E293B] dark:text-white leading-tight">
                          {lead.name}
                        </span>
                        <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                          {lead.email}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[#475569] dark:text-[#94A3B8]">
                    {format(new Date(lead.joinedDate), "MM/dd/yyyy HH:mm")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {lead.projectStatuses.length > 0 ? lead.projectStatuses.map((status, i) => (
                        <span key={i} className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[12px] font-medium ${getStatusColor(status)}`}>
                          {status}
                        </span>
                      )) : (
                        <span className="text-[13px] text-[#94A3B8]">No projects</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] font-medium text-[#0F172A] dark:text-white">
                    {formatCurrency(lead.totalPaid)}
                  </td>
                  <td className="px-6 py-4 text-[14px] font-medium text-[#0F172A] dark:text-white">
                    {lead.lastPaid > 0 ? formatCurrency(lead.lastPaid) : '-'}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#64748B] dark:text-[#94A3B8] text-[14px]">
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {displayLeads.length > 0 && (
          <div className="px-6 py-5 flex items-center border-t border-[#E5E7EB] dark:border-white/5">
            <div className="flex items-center border border-[#E2E8F0] dark:border-white/10 rounded-full bg-white dark:bg-[#171A21] overflow-hidden shadow-sm">
              <button className="px-3 py-1.5 hover:bg-[#F8FAFC] dark:hover:bg-white/5 text-[#64748B] transition-colors border-r border-[#E2E8F0] dark:border-white/10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 text-[13px] font-medium bg-[#3B82F6] text-white">
                1
              </button>
              <button className="px-3 py-1.5 text-[13px] font-medium text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors">
                2
              </button>
              <button className="px-3 py-1.5 text-[13px] font-medium text-[#64748B] cursor-default">
                •
              </button>
              <button className="px-3 py-1.5 text-[13px] font-medium text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors">
                8
              </button>
              <button className="px-3 py-1.5 text-[13px] font-medium text-[#64748B] hover:bg-[#F8FAFC] dark:hover:bg-white/5 transition-colors border-r border-[#E2E8F0] dark:border-white/10">
                9
              </button>
              <button className="px-3 py-1.5 hover:bg-[#F8FAFC] dark:hover:bg-white/5 text-[#64748B] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
