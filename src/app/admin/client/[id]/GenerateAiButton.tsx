"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { generateAiSummaryAction } from "@/app/actions/admin"

import { toast } from "sonner"

export default function GenerateAiButton({ clientProfileId }: { clientProfileId: string }) {
  const [loading, setLoading] = useState(false)
  
  const handleGenerate = async () => {
    setLoading(true)
    try {
      const res = await generateAiSummaryAction(clientProfileId)
      if (res.error) toast.error(res.error)
    } catch (e: any) {
      toast.error("Error: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerate} disabled={loading} size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md border-0 transition-all duration-300 hover:scale-[1.02] active:scale-95">
      {loading ? "Generating..." : "Generate AI Summary"}
    </Button>
  )
}
