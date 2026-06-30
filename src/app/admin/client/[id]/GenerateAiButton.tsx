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
    <Button onClick={handleGenerate} disabled={loading} size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10 transition-colors">
      {loading ? "Generating..." : "Generate AI Summary"}
    </Button>
  )
}
