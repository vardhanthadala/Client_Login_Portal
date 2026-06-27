"use client"

import { useState } from "react"
import { UploadCloud, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { addBrandAssetAction } from "@/app/actions/client"

export default function ClientUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError("")
    setSuccess(false)

    try {
      // 1. Get Presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      })
      
      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`API Error: ${res.status} - ${errText}`)
      }
      const { uploadUrl, fileUrl } = await res.json()
      
      // 2. Upload to S3
      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      })
      
      if (!s3Res.ok) throw new Error("Failed to upload to S3.")

      // 3. Save to Database
      const actionRes = await addBrandAssetAction(fileUrl, file.name)
      if (actionRes.error) {
        throw new Error(actionRes.error)
      }

      setSuccess(true)
      // Reset input
      e.target.value = ""
    } catch (err: any) {
      console.error(err)
      setError(err.message || "An unknown error occurred.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input 
          type="file" 
          id="dashboard-upload" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
          onChange={handleUpload}
          disabled={isUploading}
        />
        <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground transition-all duration-200 w-full ${isUploading ? 'bg-muted border-border' : 'border-border hover:bg-muted/50 hover:border-primary/50 hover:text-primary'}`}>
          {isUploading ? (
            <Loader2 className="h-10 w-10 mb-3 animate-spin text-primary" />
          ) : (
            <UploadCloud className="h-10 w-10 mb-3" />
          )}
          <p className="text-sm font-medium">{isUploading ? "Uploading..." : "Click or drag to upload"}</p>
        </div>
      </div>
      
      {error && <p className="text-destructive text-sm font-medium">{error}</p>}
      {success && <p className="text-green-600 text-sm font-medium">File uploaded successfully!</p>}
    </div>
  )
}
