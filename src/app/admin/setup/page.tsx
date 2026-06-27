"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { setupAdminAction } from "@/app/actions/setup"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSetup = async () => {
    setLoading(true)
    const res = await setupAdminAction()
    setMessage(res.message)
    setLoading(false)
  }

  return (
    <div className="p-8 space-y-4 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">First Time Setup</h1>
      <p className="text-zinc-400">Click below to create the initial admin user.</p>
      <Button onClick={handleSetup} disabled={loading} className="bg-white text-zinc-950">
        {loading ? "Creating..." : "Create Admin User"}
      </Button>
      {message && <p className="text-green-500 mt-4">{message}</p>}
    </div>
  )
}
