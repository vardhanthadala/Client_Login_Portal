"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export default function AgencySearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (val) {
      params.set("q", val)
    } else {
      params.delete("q")
    }
    // Use replace to avoid filling up browser history with every keystroke
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input 
        placeholder="Search agencies..." 
        className="pl-9 h-10 bg-white border-gray-200 shadow-sm rounded-lg"
        defaultValue={searchParams.get("q") || ""}
        onChange={handleSearch}
      />
    </div>
  )
}
