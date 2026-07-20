"use client"

import { useState } from "react"
import { UploadCloud, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { addBrandAssetAction } from "@/app/actions/client"

export default function ClientUploader({ projects = [] }: { projects?: any[] }) {
  const [isUploading, setIsUploading] = useState(false)
  const [description, setDescription] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

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
      const actionRes = await addBrandAssetAction(fileUrl, selectedFile.name, description, selectedProjectId || undefined)
      if (actionRes.error) {
        throw new Error(actionRes.error)
      }

      toast.success("File uploaded successfully!")
      
      // Reset input
      setSelectedFile(null)
      setDescription("")
      setSelectedProjectId("")
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
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) setSelectedFile(file);
            }}
            disabled={isUploading}
          />
          <div 
            className={`border-2 border-dashed rounded-[24px] p-4 sm:p-10 flex flex-col items-center justify-center transition-all duration-300 w-full max-w-full relative overflow-hidden text-center min-w-0 ${
              isUploading 
                ? 'bg-[#F8FAFC] dark:bg-[#111] border-[#E2E8F0] dark:border-[#333]' 
                : isDragging 
                  ? 'bg-[#F0FDF4] dark:bg-[#10B981]/10 border-[#10B981] shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02]' 
                  : 'bg-transparent border-[#10B981] hover:bg-[#F8FAFC] dark:hover:bg-[#10B981]/5 hover:-translate-y-0.5'
            }`}
          >
            <div className={`mb-3 transition-transform duration-500 max-w-full ${!isDragging && !isUploading ? 'animate-[pulse_4s_ease-in-out_infinite]' : ''}`}>
              <UploadCloud className={`h-8 w-8 ${isDragging ? 'text-[#10B981] animate-bounce' : 'text-[#10B981]'}`} />
            </div>
            <p className="text-[15px] font-normal text-[#0F172A] dark:text-white mb-1.5 break-words max-w-full">
              Drag & drop your files here
            </p>
            <p className="text-[13px] text-[#64748B] dark:text-[#888] mb-6 break-words max-w-full">
              or click to browse
            </p>
            <p className="text-[11px] text-[#64748B] dark:text-[#666] break-words max-w-full">
              Supported formats: PNG, JPG, PDF, SVG, AI, DOCX
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between p-4 bg-[#FAFAFA] dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333] rounded-[16px] shadow-sm hover:border-[#10B981]/30 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[12px] bg-white dark:bg-[#222] border border-[#E2E8F0] dark:border-[#333] flex items-center justify-center text-[#10B981] shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-normal text-[#0F172A] dark:text-white">{selectedFile.name}</span>
                <span className="text-[13px] text-[#64748B] dark:text-[#888]">{(selectedFile.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedFile(null)} disabled={isUploading} className="h-8 rounded-lg text-[13px] font-normal border-[#E2E8F0] dark:border-[#333] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:border-rose-800 transition-all">
              Change
            </Button>
          </div>

          {projects.length > 0 && (
            <div>
              <label htmlFor="asset-project" className="block text-[13px] font-normal text-[#0F172A] dark:text-white mb-2 tracking-wide uppercase">Select Project</label>
              <select
                id="asset-project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={isUploading}
                className="w-full px-4 py-3 border border-[#E2E8F0] dark:border-[#333] bg-white dark:bg-[#1A1A1A] rounded-[12px] text-[14px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all shadow-sm"
              >
                <option value="">No Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="asset-desc" className="block text-[13px] font-normal text-[#0F172A] dark:text-white mb-2 tracking-wide uppercase">Description (Optional)</label>
            <input 
              type="text" 
              id="asset-desc"
              placeholder="e.g. For homepage hero, New logo variant" 
              className="w-full px-4 py-3 border border-[#E2E8F0] dark:border-[#333] bg-white dark:bg-[#1A1A1A] rounded-[12px] text-[14px] text-[#0F172A] dark:text-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all placeholder:text-[#94A3B8] shadow-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <Button 
            className="w-full bg-[#10B981] hover:bg-[#059669] text-white rounded-[12px] h-12 text-[15px] font-normal transition-all shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5" 
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading securely...
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
