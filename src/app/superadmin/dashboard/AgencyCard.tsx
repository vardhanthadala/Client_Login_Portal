"use client"

import { format } from "date-fns"
import { Mail, Users } from "lucide-react"
import Link from "next/link"

export default function AgencyCard({ tenant, isExpired }: { tenant: any, isExpired: boolean }) {
  const colorMap = {
    FREE: { bg: 'bg-emerald-100/80 dark:bg-emerald-900/20', badgeBg: 'bg-emerald-200/80 dark:bg-emerald-800/40', text: 'text-emerald-900 dark:text-emerald-300' },
    PREMIUM_MONTHLY: { bg: 'bg-blue-100/80 dark:bg-blue-900/20', badgeBg: 'bg-blue-200/80 dark:bg-blue-800/40', text: 'text-blue-900 dark:text-blue-300' },
    PREMIUM_YEARLY: { bg: 'bg-purple-100/80 dark:bg-purple-900/20', badgeBg: 'bg-purple-200/80 dark:bg-purple-800/40', text: 'text-purple-900 dark:text-purple-300' },
    EXPIRED: { bg: 'bg-rose-100/80 dark:bg-rose-900/20', badgeBg: 'bg-rose-200/80 dark:bg-rose-800/40', text: 'text-rose-900 dark:text-rose-300' }
  };
  
  let theme = colorMap[tenant.subscriptionPlan as keyof typeof colorMap] || colorMap.FREE;
  if (isExpired) {
    theme = colorMap.EXPIRED;
  }

  return (
    <div className="w-full border border-gray-100 dark:border-[#2A2E35] rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group bg-white dark:bg-[#111111]">
      
      {/* Top Colored Section */}
      <div className={`${theme.bg} p-6 pb-7 relative flex flex-col`}>
        
        {/* Floating Avatar */}
        <div className="absolute top-5 right-5 z-10 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
          {tenant.users?.[0]?.image ? (
            <img src={tenant.users[0].image} alt={tenant.name} className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full object-cover shadow-md ring-4 ring-white/60 dark:ring-white/10" />
          ) : (
            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-white/50 dark:bg-black/20 flex items-center justify-center shadow-md ring-4 ring-white/60 dark:ring-white/10 backdrop-blur-md">
              <span className={`text-2xl font-semibold uppercase ${theme.text}`}>
                {tenant.name.substring(0, 2)}
              </span>
            </div>
          )}
        </div>

        {/* Plan Badge */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-[11px] font-medium tracking-wide capitalize ${theme.badgeBg} ${theme.text}`}>
            {tenant.subscriptionPlan.replace('_', ' ').toLowerCase()}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white pr-20 leading-tight mb-2 tracking-tight">
          {tenant.name}
        </h3>
        
        {/* Subtitle */}
        <p className="text-[13px] text-gray-700 dark:text-gray-300 pr-20 mb-5 leading-snug line-clamp-2">
          Manage tenant access, platform clients, and subscription limits.
        </p>
        
        {/* Stats Icons */}
        <div className="flex items-center gap-4 text-[13px] font-medium text-gray-800 dark:text-gray-200 mb-6">
          <div className="flex items-center gap-1.5 shrink-0">
            <Users className="w-4 h-4 stroke-[2.5]" />
            <span>{tenant._count?.clientProfiles || 0} clients</span>
          </div>
          {tenant.users?.[0]?.email && (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 min-w-0">
              <Mail className="w-4 h-4 stroke-[2.5] shrink-0" />
              <span className="truncate">{tenant.users[0].email}</span>
            </div>
          )}
        </div>
        
        {/* Progress Bar / Status */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[12px] font-medium text-gray-600 dark:text-gray-400">Status</span>
            <span className="text-[12px] font-semibold text-gray-900 dark:text-white uppercase tracking-wider">{isExpired ? 'Expired' : 'Active'}</span>
          </div>
          <div className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full ${isExpired ? 'bg-rose-500 w-full' : 'bg-gray-900 dark:bg-white w-[75%] rounded-r-full'} transition-all duration-1000 ease-out`}></div>
          </div>
        </div>
        
      </div>

      {/* Bottom White Section */}
      <div className="bg-white dark:bg-[#111111] p-4 px-6 flex items-center justify-between border-t border-gray-100 dark:border-[#222]">
        <div className="text-[13px] font-medium text-gray-500 dark:text-gray-400">
          Start date: <span className="font-medium text-gray-900 dark:text-white">{format(new Date(tenant.createdAt), 'dd MMM yyyy')}</span>
        </div>
        <Link 
          href={`/superadmin/dashboard/company/${tenant.id}`}
          className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full text-[13px] font-medium shadow-sm hover:scale-105 transition-transform duration-200 cursor-pointer outline-none inline-flex items-center justify-center"
        >
          Manage
        </Link>
      </div>

    </div>
  );
}
