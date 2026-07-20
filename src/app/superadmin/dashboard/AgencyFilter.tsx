"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams } from "next/navigation"

export default function AgencyFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFilter = (val: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (val && val !== "ALL") {
      params.set("plan", val)
    } else {
      params.delete("plan")
    }
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="w-full sm:w-[180px]">
      <Select value={searchParams.get("plan") || "ALL"} onValueChange={handleFilter}>
        <SelectTrigger className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2E35] rounded-md h-10 px-3 font-normal text-sm text-gray-700 dark:text-gray-300 focus:ring-0 focus:border-blue-600 data-[state=open]:border-blue-600 data-[state=open]:border-2 data-[state=open]:rounded-b-none transition-none outline-none">
          <SelectValue placeholder="Select an item" />
        </SelectTrigger>
        <SelectContent 
          className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2E35] border-t-0 rounded-b-md rounded-t-none shadow-lg p-0 z-50 overflow-hidden"
          position="popper"
          sideOffset={-1}
          alignItemWithTrigger={false}
        >
          <SelectItem value="ALL" className="rounded-none text-sm font-normal cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-[#EEF4FF] dark:focus:bg-blue-900/30 focus:text-blue-900 dark:focus:text-blue-100 py-2.5 px-3 m-0 border-b border-transparent">
            All Companies
          </SelectItem>
          <SelectItem value="PREMIUM_MONTHLY" className="rounded-none text-sm font-normal cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-[#EEF4FF] dark:focus:bg-blue-900/30 focus:text-blue-900 dark:focus:text-blue-100 py-2.5 px-3 m-0 border-b border-transparent">
            Premium Monthly
          </SelectItem>
          <SelectItem value="PREMIUM_YEARLY" className="rounded-none text-sm font-normal cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-[#EEF4FF] dark:focus:bg-blue-900/30 focus:text-blue-900 dark:focus:text-blue-100 py-2.5 px-3 m-0 border-b border-transparent">
            Premium Yearly
          </SelectItem>
          <SelectItem value="FREE" className="rounded-none text-sm font-normal cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-[#EEF4FF] dark:focus:bg-blue-900/30 focus:text-blue-900 dark:focus:text-blue-100 py-2.5 px-3 m-0 border-b border-transparent">
            Free Plan
          </SelectItem>
          <SelectItem value="EXPIRED" className="rounded-none text-sm font-normal cursor-pointer text-gray-700 dark:text-gray-300 focus:bg-[#EEF4FF] dark:focus:bg-blue-900/30 focus:text-blue-900 dark:focus:text-blue-100 py-2.5 px-3 m-0 border-b border-transparent">
            Expired
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
