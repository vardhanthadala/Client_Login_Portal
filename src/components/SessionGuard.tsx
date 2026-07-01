"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SessionGuard() {
  const router = useRouter()

  useEffect(() => {
    // Force a reload if the page is loaded from the back-forward cache
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload()
      }
    }
    
    window.addEventListener("pageshow", handlePageShow)
    return () => window.removeEventListener("pageshow", handlePageShow)
  }, [])

  return null
}
