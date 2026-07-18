"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { respondToApprovalItemAction } from "@/app/actions/approvals"
import { Loader2, Check, AlertTriangle, Download, MoreVertical, LayoutGrid, List, ChevronDown, Clock, Search, FileText, CheckCircle2, User, ImageIcon, Database } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

type ApprovalFeedback = {
  id: string
  action: string
  comment: string | null
  createdAt: string
  x?: number | null
  y?: number | null
}

type ApprovalItem = {
  id: string
  fileUrl: string
  fileName: string
  fileType: string
  status: string
  version: number
  feedback: ApprovalFeedback[]
  batchId?: string
  uploadedAt?: Date
}

type Approval = {
  id: string
  title: string
  description: string | null
  items: ApprovalItem[]
  createdAt: string
}

export default function ApprovalReview({ approvals: initialApprovals }: { approvals: Approval[] }) {
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest">("Newest")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  if (approvals.length === 0) return null

  // Flatten items for the new UI
  const allItems = approvals.flatMap(a => 
    a.items.map(item => ({ 
      ...item, 
      batchId: a.id, 
      uploadedAt: new Date(a.createdAt) 
    }))
  ).sort((a, b) => {
    if (sortBy === "Newest") {
      return b.uploadedAt.getTime() - a.uploadedAt.getTime()
    } else {
      return a.uploadedAt.getTime() - b.uploadedAt.getTime()
    }
  })

  const totalFiles = allItems.length
  const pendingReview = allItems.filter(i => i.status === "PENDING").length
  const approved = allItems.filter(i => i.status === "APPROVED").length

  const handleApprove = async (itemId: string) => {
    setLoadingId(itemId)
    const res = await respondToApprovalItemAction(itemId, "APPROVED")
    if (res.success) {
      setApprovals(approvals.map(a => ({
        ...a,
        items: a.items.map(item => item.id === itemId ? {
          ...item,
          status: "APPROVED",
          feedback: [...item.feedback, { id: `temp-${Date.now()}`, action: "APPROVED", comment: null, createdAt: new Date().toISOString() }]
        } : item)
      })))
    } else {
      toast.error(res.error)
    }
    setLoadingId(null)
  }

  const handleRequestChanges = async (itemId: string) => {
    const comment = prompt("Describe what changes you need:")
    if (!comment?.trim()) return toast.error("Please describe what changes you need.")
    setLoadingId(itemId)
    const res = await respondToApprovalItemAction(itemId, "CHANGES_REQUESTED", comment)
    if (res.success) {
      setApprovals(approvals.map(a => ({
        ...a,
        items: a.items.map(item => item.id === itemId ? {
          ...item,
          status: "CHANGES_REQUESTED",
          feedback: [...item.feedback, { id: `temp-${Date.now()}`, action: "CHANGES_REQUESTED", comment, createdAt: new Date().toISOString() }]
        } : item)
      })))
    } else {
      toast.error(res.error)
    }
    setLoadingId(null)
  }

  const isImage = (fileType: string) => fileType.startsWith("image/")

  return (
    <div className="w-full flex flex-col gap-[25px]">
      {/* Header and Stats */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-[25px]">
        <div>
          <h1 className="text-[22px] font-bold text-[#0F172A] dark:text-white tracking-tight mb-1">Approvals</h1>
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Review and approve files shared by your agency.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-wrap gap-4 w-full xl:w-auto">
          {/* Total Files */}
          <div className="bg-white dark:bg-[#111111] rounded-[15px] shadow-sm border border-[#E2E8F0] dark:border-[#222] p-[25px] flex items-center gap-4 w-full sm:w-auto">
            <div className="bg-[#3454D1]/10 text-[#3454D1] rounded-[12px] p-3">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Total Files</span>
              <span className="text-xl font-bold text-[#0F172A] dark:text-white leading-none mt-1">{totalFiles}</span>
            </div>
          </div>
          {/* Pending Review */}
          <div className="bg-white dark:bg-[#111111] rounded-[15px] shadow-sm border border-[#E2E8F0] dark:border-[#222] p-[25px] flex items-center gap-4 w-full sm:w-auto">
            <div className="bg-[#F59E0B]/10 text-[#F59E0B] rounded-[12px] p-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Pending</span>
              <span className="text-xl font-bold text-[#0F172A] dark:text-white leading-none mt-1">{pendingReview}</span>
            </div>
          </div>
          {/* Approved */}
          <div className="bg-white dark:bg-[#111111] rounded-[15px] shadow-sm border border-[#E2E8F0] dark:border-[#222] p-[25px] flex items-center gap-4 w-full sm:w-auto">
            <div className="bg-[#10B981]/10 text-[#10B981] rounded-[12px] p-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Approved</span>
              <span className="text-xl font-bold text-[#0F172A] dark:text-white leading-none mt-1">{approved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 overflow-hidden">
        <button className="flex items-center gap-2 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[12px] px-4 py-2 shadow-sm text-[#0F172A] dark:text-white text-[13px] font-bold transition-colors w-max">
          <LayoutGrid className="w-4 h-4 text-[#3454D1]" />
          All Files
          <span className="bg-[#F1F5F9] dark:bg-[#1A1A1A] text-[#64748B] dark:text-[#94A3B8] px-2 py-0.5 rounded-full text-[11px]">{totalFiles}</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSortBy(prev => prev === "Newest" ? "Oldest" : "Newest")}
            className="flex items-center gap-2 bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[12px] px-4 py-2.5 shadow-sm text-[13px] font-bold text-[#0F172A] dark:text-white hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] transition-colors"
          >
            <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
            Sort: {sortBy}
            <ChevronDown className={`w-4 h-4 text-[#64748B] dark:text-[#94A3B8] ml-2 transition-transform ${sortBy === 'Oldest' ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="flex items-center bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[12px] p-1 shadow-sm">
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-[8px] transition-colors ${viewMode === "list" ? "bg-[#F1F5F9] dark:bg-[#1A1A1A] text-[#0F172A] dark:text-white" : "hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] text-[#64748B] dark:text-[#94A3B8]"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-[8px] transition-colors ${viewMode === "grid" ? "bg-[#F1F5F9] dark:bg-[#1A1A1A] text-[#0F172A] dark:text-white" : "hover:bg-[#F8FAFC] dark:hover:bg-[#1A1A1A] text-[#64748B] dark:text-[#94A3B8]"}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className={viewMode === "list" ? "flex flex-col gap-4 mt-2" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2"}>
        {allItems.map((item, index) => {
          const isPending = item.status === "PENDING"
          const isApproved = item.status === "APPROVED"
          const isLoading = loadingId === item.id
          
          return (
            <div 
              key={item.id} 
              className={`p-[25px] bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[15px] shadow-sm flex flex-col ${viewMode === "list" ? "xl:flex-row xl:items-center justify-between" : ""} gap-[25px] transition-colors hover:bg-[#F8FAFC] dark:hover:bg-[#161616]`}
            >
              <div className={`flex flex-col ${viewMode === "list" ? "sm:flex-row sm:items-center" : ""} gap-5 items-start flex-1 min-w-0`}>
                {/* Thumbnail */}
                <div className={`${viewMode === "list" ? "w-32 h-24" : "w-full h-40"} relative rounded-[12px] overflow-hidden shrink-0 flex items-center justify-center bg-[#F1F5F9] dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333]`}>
                  {isImage(item.fileType) ? (
                     <Image src={`/api/file?url=${encodeURIComponent(item.fileUrl)}`} alt={item.fileName} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" unoptimized={true} />
                  ) : (
                     <FileText className="w-8 h-8 text-[#94A3B8]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-[14px] text-[#0F172A] dark:text-white truncate">{item.fileName}</h3>
                    <span className="px-2 py-0.5 rounded-[4px] text-[11px] font-bold bg-[#F1F5F9] dark:bg-[#1A1A1A] text-[#64748B] dark:text-[#94A3B8]">v{item.version}</span>
                    <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">{item.fileType}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {item.uploadedAt ? Math.max(1, Math.floor((Date.now() - item.uploadedAt.getTime()) / (1000 * 60 * 60))) + ' hours ago' : '2 hours ago'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Agency Team
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & Status */}
              <div className={`flex flex-wrap items-center gap-4 ${viewMode === "list" ? "xl:justify-end" : "justify-start mt-2"}`}>
                {/* Status Badge */}
                {isPending ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#F59E0B]/10 text-[#F59E0B]">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold tracking-widest uppercase">PENDING</span>
                  </div>
                ) : isApproved ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#10B981]/10 text-[#10B981]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold tracking-widest uppercase">APPROVED</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#F1F5F9] dark:bg-[#1A1A1A] text-[#64748B] dark:text-[#94A3B8]">
                    <span className="text-[10px] font-semibold tracking-widest uppercase">{item.status.replace('_', ' ')}</span>
                  </div>
                )}

                {/* Primary Actions */}
                {isPending && (
                  <>
                    <Button 
                      className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold h-8 px-4 rounded-[6px] text-[12px] flex items-center gap-1.5 transition-colors"
                      onClick={() => handleApprove(item.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      Approve
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 dark:hover:bg-[#EF4444]/20 font-semibold h-8 px-4 rounded-[6px] text-[12px] flex items-center gap-1.5 transition-colors bg-transparent"
                      onClick={() => handleRequestChanges(item.id)}
                      disabled={isLoading}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Changes
                    </Button>
                  </>
                )}

                {/* Secondary Actions */}
                <div className="flex gap-2">
                  <a href={`/api/file?url=${encodeURIComponent(item.fileUrl)}`} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="border-[#E2E8F0] dark:border-[#333] text-[#0F172A] dark:text-white font-bold h-10 w-10 p-0 rounded-[8px] flex items-center justify-center hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] bg-transparent">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </a>
                  <a href={`/api/file?url=${encodeURIComponent(item.fileUrl)}&download=true`} download>
                    <Button variant="outline" className="border-[#E2E8F0] dark:border-[#333] text-[#0F172A] dark:text-white font-bold h-10 w-10 p-0 rounded-[8px] flex items-center justify-center hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] bg-transparent">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
