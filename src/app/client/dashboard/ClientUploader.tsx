"use client"

import { useState } from "react"
import { UploadCloud, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { addBrandAssetAction } from "@/app/actions/client"

export default function ClientUploader() {
  const [isUploading, setIsUploading] = useState(false)
  const [description, setDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      // 1. Get Presigned URL
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: selectedFile.name, contentType: selectedFile.type })
      })
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const errorMessage = errData.error || `API Error: ${res.status}`
        throw new Error(errorMessage)
      }
      const { uploadUrl, fileUrl } = await res.json()
      
      // 2. Upload to S3
      const s3Res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile
      })
      
      if (!s3Res.ok) {
        const s3ErrorText = await s3Res.text()
        console.error("S3 Error Response:", s3ErrorText)
        throw new Error(`AWS S3 Error: ${s3Res.status} - Please check your browser console for details.`)
      }

      // 3. Save to Database
      const actionRes = await addBrandAssetAction(fileUrl, selectedFile.name, description)
      if (actionRes.error) {
        throw new Error(actionRes.error)
      }

      toast.success("File uploaded successfully!")
      
      // Reset input
      setSelectedFile(null)
      setDescription("")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "An unknown error occurred.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!selectedFile ? (
        <div className="relative">
          <input 
            type="file" 
            id="dashboard-upload" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground transition-all duration-200 w-full ${isUploading ? 'bg-muted border-border' : 'border-border hover:bg-muted/50 hover:border-primary/50 hover:text-primary'}`}>
            <UploadCloud className="h-10 w-10 mb-3" />
            <p className="text-sm font-medium">Click or drag to select a file</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 border border-border rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)} disabled={isUploading}>
              Change
            </Button>
          </div>

          <div>
            <label htmlFor="asset-desc" className="block text-sm font-medium text-slate-700 mb-1.5">Description (Optional)</label>
            <input 
              type="text" 
              id="asset-desc"
              placeholder="e.g. For homepage hero, New logo variant" 
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#5A52FF] focus:ring-1 focus:ring-[#5A52FF] transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <Button 
            className="w-full bg-[#5A52FF] hover:bg-[#5A52FF]/90 text-white" 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
              </>
            ) : (
              "Confirm & Upload"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
