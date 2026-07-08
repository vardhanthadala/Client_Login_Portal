"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { respondToApprovalItemAction } from "@/app/actions/approvals"
import { Loader2, ExternalLink, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, Download, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

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
}

type Approval = {
  id: string
  title: string
  description: string | null
  items: ApprovalItem[]
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: any; dotColor?: string }> = {
  PENDING: { label: "Awaiting Review", className: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20", icon: Clock, dotColor: "bg-amber-500" },
  APPROVED: { label: "Approved", className: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20", icon: CheckCircle2, dotColor: "bg-emerald-500" },
  CHANGES_REQUESTED: { label: "Changes Requested", className: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20", icon: AlertTriangle, dotColor: "bg-rose-500" },
}

export default function ApprovalReview({ approvals: initialApprovals }: { approvals: Approval[] }) {
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals)
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({})
  const [showFeedbackFor, setShowFeedbackFor] = useState<string | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [expandedBatch, setExpandedBatch] = useState<string | null>(initialApprovals.find(a => a.items.some(i => i.status === "PENDING"))?.id || null)
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null)

  if (approvals.length === 0) return null

  const totalPending = approvals.reduce((sum, a) => sum + a.items.filter(i => i.status === "PENDING").length, 0)

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
    const comment = feedbackText[itemId]
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
      setFeedbackText({ ...feedbackText, [itemId]: "" })
      setShowFeedbackFor(null)
    } else {
      toast.error(res.error)
    }
    setLoadingId(null)
  }

  const isImage = (fileType: string) => fileType.startsWith("image/")
  const isVideo = (fileType: string) => fileType.startsWith("video/")

  const getBatchStatus = (items: ApprovalItem[]) => {
    if (items.every(i => i.status === "APPROVED")) return { label: "All Approved", className: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20", dotColor: "bg-emerald-500" }
    if (items.some(i => i.status === "CHANGES_REQUESTED")) return { label: "Changes Requested", className: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20", dotColor: "bg-rose-500" }
    const pending = items.filter(i => i.status === "PENDING").length
    return { label: `${pending} Pending`, className: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20", dotColor: "bg-amber-500", isPending: true }
  }

  return (
    <div className="mb-12">
      <div className="flex flex-col gap-1 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold font-sans text-[#0F172A] dark:text-white">Drafts for Your Review</h2>
          {totalPending > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
              {totalPending} pending
            </span>
          )}
        </div>
        <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Review submitted assets and provide feedback.</p>
      </div>

      <div className="space-y-4">
        {approvals.map((approval) => {
          const batchStatus = getBatchStatus(approval.items)
          const isExpanded = expandedBatch === approval.id

          return (
            <Card key={approval.id} className="bg-white dark:bg-[#111111] border-[#E5E7EB] dark:border-[#222] rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-4">
              {/* Batch Header */}
              <div
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-[#FAFAFA] dark:hover:bg-[#1A1A1A] transition-colors"
                onClick={() => setExpandedBatch(isExpanded ? null : approval.id)}
              >
                <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                  <div className="w-10 h-10 rounded-[12px] bg-[#F1F5F9] dark:bg-[#222] flex items-center justify-center shrink-0">
                    <ImageIcon className="w-5 h-5 text-[#64748B] dark:text-[#888]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[15px] text-[#0F172A] dark:text-white flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="truncate">{approval.title}</span>
                      <span className="text-[11px] text-[#94A3B8] font-medium shrink-0 bg-[#F1F5F9] dark:bg-[#222] px-2 py-0.5 rounded-md">{approval.items.length} files</span>
                    </h3>
                    {approval.description && <p className="text-[13px] text-[#64748B] dark:text-[#94A3B8] truncate">{approval.description}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 w-full sm:w-auto pl-14 sm:pl-0">
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold truncate ${batchStatus.className}`}>
                    {batchStatus.isPending && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${batchStatus.dotColor}`} />}
                    {batchStatus.label}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-[#E5E7EB] dark:border-[#333] transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-[#F1F5F9] dark:bg-[#222]' : 'hover:bg-[#F1F5F9] dark:hover:bg-[#222]'}`}>
                    <ChevronDown className="w-4 h-4 text-[#64748B] dark:text-[#888]" />
                  </div>
                </div>
              </div>

              {/* Expanded Items */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                  {approval.items.map((item) => {
                    const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING
                    const StatusIcon = config.icon
                    const isPending = item.status === "PENDING"
                    const isLoading = loadingId === item.id
                    const isHistoryExpanded = expandedHistory === item.id

                    return (
                      <div key={item.id} className={`group border rounded-[16px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] ${isPending ? "border-amber-200/50 bg-amber-50/20 dark:border-amber-500/20 dark:bg-amber-500/5" : "border-[#E5E7EB] dark:border-[#222] bg-[#FAFAFA] dark:bg-[#1A1A1A]"}`}>
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row gap-5">
                            {/* Premium Thumbnail */}
                            <div className="w-full sm:w-40 h-32 rounded-[16px] overflow-hidden border border-[#E5E7EB] dark:border-[#333] bg-[#F1F5F9] dark:bg-[#111] flex items-center justify-center shrink-0 shadow-inner group-hover:shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-300 relative">
                              <div className="absolute inset-0 transition-transform duration-300 group-hover:scale-[1.03]">
                                {isImage(item.fileType) ? (
                                  <img src={`/api/file?url=${encodeURIComponent(item.fileUrl)}`} alt={item.fileName} className="w-full h-full object-cover" />
                                ) : isVideo(item.fileType) ? (
                                  <video src={`/api/file?url=${encodeURIComponent(item.fileUrl)}`} className="w-full h-full object-cover" muted />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#FAFAFA] to-[#F1F5F9] dark:from-[#1A1A1A] dark:to-[#111]">
                                    <p className="text-xl font-bold text-[#94A3B8] dark:text-[#666] tracking-widest">{item.fileType.split("/")[1]?.slice(0, 4) || "FILE"}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 flex flex-col py-1">
                              <div className="flex items-start justify-between gap-4 mb-1">
                                <p className="text-[18px] font-semibold text-[#0F172A] dark:text-white truncate pr-2">
                                  {item.fileName}
                                </p>
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold shrink-0 border ${config.className}`}>
                                  {isPending && <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.dotColor}`} />}
                                  {config.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[13px] text-[#64748B] dark:text-[#94A3B8] mb-4 font-medium">
                                <span className="bg-[#E2E8F0] dark:bg-[#333] px-2 py-0.5 rounded-md text-[#475569] dark:text-[#CBD5E1]">v{item.version}</span>
                                <span>{item.fileType}</span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-3 mt-auto flex-wrap">
                                {isPending && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="gap-1.5 text-[13px] h-8 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_4px_14px_rgba(16,185,129,0.4)]"
                                      onClick={() => handleApprove(item.id)}
                                      disabled={isLoading}
                                    >
                                      {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="group/btn gap-1.5 text-[13px] h-8 px-4 rounded-lg border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-300 dark:hover:border-rose-800 transition-all duration-300"
                                      onClick={() => setShowFeedbackFor(showFeedbackFor === item.id ? null : item.id)}
                                      disabled={isLoading}
                                    >
                                      <AlertTriangle className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:-translate-y-0.5" /> Request Changes
                                    </Button>
                                  </>
                                )}
                                <a href={`/api/file?url=${encodeURIComponent(item.fileUrl)}`} target="_blank" rel="noreferrer">
                                  <Button variant="outline" size="sm" className="group/view gap-1.5 text-[13px] h-8 px-3 rounded-lg border-[#E5E7EB] dark:border-[#333] text-[#475569] dark:text-[#94A3B8] hover:bg-white dark:hover:bg-[#222] hover:text-[#0F172A] dark:hover:text-white transition-all duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                                    <ExternalLink className="w-3.5 h-3.5 transition-transform duration-300 group-hover/view:translate-x-[2px] group-hover/view:-translate-y-[2px]" /> View
                                  </Button>
                                </a>
                                <a href={`/api/file?url=${encodeURIComponent(item.fileUrl)}&download=true`} download>
                                  <Button variant="outline" size="sm" className="group/dl gap-1.5 text-[13px] h-8 px-3 rounded-lg border-[#E5E7EB] dark:border-[#333] text-[#475569] dark:text-[#94A3B8] hover:bg-white dark:hover:bg-[#222] hover:text-[#0F172A] dark:hover:text-white transition-all duration-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                                    <Download className="w-3.5 h-3.5 transition-transform duration-300 group-hover/dl:translate-y-[2px]" /> Download
                                  </Button>
                                </a>
                              </div>

                              {/* Feedback Textarea */}
                              {showFeedbackFor === item.id && (
                                <div className="mt-3 space-y-2 border-t border-border pt-3">
                                  <textarea
                                    className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    placeholder="Describe what changes you'd like for this file..."
                                    value={feedbackText[item.id] || ""}
                                    onChange={(e) => setFeedbackText({ ...feedbackText, [item.id]: e.target.value })}
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowFeedbackFor(null)}>Cancel</Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-7 text-xs"
                                      onClick={() => handleRequestChanges(item.id)}
                                      disabled={isLoading || !feedbackText[item.id]?.trim()}
                                    >
                                      {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                      Submit Feedback
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Per-item Feedback History */}
                        {item.feedback.length > 0 && (
                          <div className="border-t border-border/50">
                            <button
                              onClick={() => setExpandedHistory(isHistoryExpanded ? null : item.id)}
                              className="w-full px-4 py-1.5 flex items-center justify-between text-[10px] font-medium text-muted-foreground hover:bg-muted/20 transition-colors"
                            >
                              <span>History ({item.feedback.length})</span>
                              {isHistoryExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                            {isHistoryExpanded && (
                              <div className="px-4 pb-3 space-y-1.5">
                                {item.feedback.map(fb => (
                                  <div key={fb.id} className="flex gap-2 items-start">
                                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${fb.action === "APPROVED" ? "bg-green-500" : fb.action === "CHANGES_REQUESTED" ? "bg-red-500" : "bg-blue-500"}`} />
                                    <div>
                                      <p className="text-[10px] font-semibold">
                                        {fb.action === "APPROVED" ? "✅ Approved" : fb.action === "CHANGES_REQUESTED" ? "🔄 Changes Requested" : "📤 New Version"}
                                      </p>
                                      {fb.comment && <p className="text-[10px] text-muted-foreground">{fb.comment}</p>}
                                      <p className="text-[9px] text-muted-foreground/60">{new Date(fb.createdAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
