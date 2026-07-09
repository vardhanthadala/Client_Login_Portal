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
  // added for flat map
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
    <div className="w-full flex flex-col gap-6">
      {/* Header and Stats */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white tracking-tight mb-1">Approvals</h1>
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Review and approve files shared by your agency.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-wrap gap-4 w-full xl:w-auto">
          {/* Total Files */}
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-[#222] p-3 flex items-center gap-3 pr-4 sm:pr-8 w-full sm:w-auto">
            <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl p-2.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#64748B] dark:text-[#888] uppercase tracking-wider">Total Files</span>
              <span className="text-xl font-bold text-[#0F172A] dark:text-white leading-none mt-1">{totalFiles}</span>
              <span className="text-[11px] font-semibold text-emerald-500 mt-1 flex items-center gap-1">
                ↑ 3 this week
              </span>
            </div>
          </div>
          {/* Pending Review */}
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-[#222] p-3 flex items-center gap-3 pr-4 sm:pr-8 w-full sm:w-auto">
            <div className="bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-xl p-2.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Pending Review</span>
              <span className="text-xl font-bold text-blue-500 leading-none mt-1">{pendingReview}</span>
              <span className="text-[11px] font-semibold text-blue-600/70 mt-1">
                Needs your action
              </span>
            </div>
          </div>
          {/* Approved */}
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-[#222] p-3 flex items-center gap-3 pr-4 sm:pr-8 w-full sm:w-auto">
            <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-xl p-2.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Approved</span>
              <span className="text-xl font-bold text-emerald-500 leading-none mt-1">{approved}</span>
              <span className="text-[11px] font-semibold text-emerald-500 mt-1 flex items-center gap-1">
                ↑ 2 this week
              </span>
            </div>
          </div>
          {/* Avg Turnaround */}
          <div className="bg-white dark:bg-[#111] rounded-2xl shadow-sm border border-[#E2E8F0] dark:border-[#222] p-3 flex items-center gap-3 pr-4 sm:pr-8 w-full sm:w-auto">
            <div className="bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl p-2.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">Avg. Turnaround</span>
              <span className="text-[14px] font-semibold text-[#64748B] dark:text-[#888] mt-1">2.4 Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 overflow-hidden">
        <button className="flex items-center gap-2 bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-[#222] rounded-full px-4 py-2 shadow-sm text-[#0F172A] dark:text-white text-[13px] font-bold transition-colors w-max">
          <LayoutGrid className="w-4 h-4 text-emerald-500" />
          All Files
          <span className="bg-slate-100 dark:bg-[#333] text-[#64748B] dark:text-[#888] px-2 py-0.5 rounded-full text-[11px]">{totalFiles}</span>
        </button>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSortBy(prev => prev === "Newest" ? "Oldest" : "Newest")}
            className="flex items-center gap-2 bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-[#222] rounded-full px-4 py-2.5 shadow-sm text-[13px] font-bold text-[#0F172A] dark:text-white hover:bg-slate-50 dark:hover:bg-[#1A1A1A] transition-colors"
          >
            <Search className="w-4 h-4 text-[#64748B]" />
            Sort: {sortBy}
            <ChevronDown className={`w-4 h-4 text-[#64748B] ml-2 transition-transform ${sortBy === 'Oldest' ? 'rotate-180' : ''}`} />
          </button>
          
          <div className="flex items-center bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-[#222] rounded-full p-1 shadow-sm">
            <button 
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-full transition-colors ${viewMode === "list" ? "bg-slate-100 dark:bg-[#222] text-[#0F172A] dark:text-white" : "hover:bg-slate-50 dark:hover:bg-[#222] text-[#64748B]"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-full transition-colors ${viewMode === "grid" ? "bg-slate-100 dark:bg-[#222] text-[#0F172A] dark:text-white" : "hover:bg-slate-50 dark:hover:bg-[#222] text-[#64748B]"}`}
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
            <Card 
              key={item.id} 
              className={`p-4 bg-white dark:bg-[#111] rounded-2xl flex ${viewMode === "list" ? "flex-col xl:flex-row xl:items-center justify-between" : "flex-col"} gap-6 transition-all duration-300 hover:shadow-md ${
                isPending ? 'border-blue-200 shadow-[0_2px_10px_rgba(59,130,246,0.08)]' : 
                isApproved ? 'border-emerald-200 shadow-[0_2px_10px_rgba(16,185,129,0.08)]' : 
                'border-[#E5E7EB]'
              }`}
            >
              <div className={`flex ${viewMode === "list" ? "flex-col sm:flex-row sm:items-center" : "flex-col"} gap-5 items-start flex-1 min-w-0`}>
                {/* Thumbnail */}
                <div className={`${viewMode === "list" ? "w-32 h-24" : "w-full h-40"} relative rounded-xl overflow-hidden shrink-0 flex items-center justify-center bg-slate-50 dark:bg-[#222] ${isImage(item.fileType) ? '' : 'border border-[#E2E8F0]'}`}>
                  {isImage(item.fileType) ? (
                     <Image src={`/api/file?url=${encodeURIComponent(item.fileUrl)}`} alt={item.fileName} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" unoptimized={true} />
                  ) : (
                     <FileText className="w-8 h-8 text-[#94A3B8]" />
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-[16px] text-[#0F172A] dark:text-white truncate">{item.fileName}</h3>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-[#333] text-[#475569] dark:text-[#CBD5E1]">v{item.version}</span>
                    <span className="text-[13px] text-[#64748B]">{item.fileType}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[13px] text-[#64748B]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Uploaded {item.uploadedAt ? Math.max(1, Math.floor((Date.now() - item.uploadedAt.getTime()) / (1000 * 60 * 60))) + ' hours ago' : '2 hours ago'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      By Agency Team
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & Status */}
              <div className={`flex flex-wrap items-center gap-4 ${viewMode === "list" ? "xl:justify-end" : "justify-start mt-2"}`}>
                {/* Status Badge */}
                {isPending ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 border border-blue-200">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold tracking-widest uppercase">AWAITING REVIEW</span>
                  </div>
                ) : isApproved ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold tracking-widest uppercase">APPROVED</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200">
                    <span className="text-[11px] font-bold tracking-widest uppercase">{item.status.replace('_', ' ')}</span>
                  </div>
                )}

                {/* Primary Actions */}
                {isPending && (
                  <>
                    <Button 
                      className="bg-[#0F4A3F] hover:bg-[#0B3B32] text-white font-bold h-10 px-5 rounded-lg text-[13px] flex items-center gap-2"
                      onClick={() => handleApprove(item.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Approve
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-rose-200 text-rose-500 hover:bg-rose-50 font-bold h-10 px-5 rounded-lg text-[13px] flex items-center gap-2"
                      onClick={() => handleRequestChanges(item.id)}
                      disabled={isLoading}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Request Changes
                    </Button>
                  </>
                )}

                {/* Secondary Actions */}
                <a href={`/api/file?url=${encodeURIComponent(item.fileUrl)}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="border-[#E2E8F0] text-[#0F172A] font-bold h-10 px-4 rounded-lg text-[13px] flex items-center gap-2 hover:bg-slate-50">
                    <ImageIcon className="w-4 h-4" /> View
                  </Button>
                </a>
                <a href={`/api/file?url=${encodeURIComponent(item.fileUrl)}&download=true`} download>
                  <Button variant="outline" className="border-[#E2E8F0] text-[#0F172A] font-bold h-10 px-4 rounded-lg text-[13px] flex items-center gap-2 hover:bg-slate-50">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </a>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
