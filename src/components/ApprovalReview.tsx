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

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  PENDING: { label: "Awaiting Review", className: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  CHANGES_REQUESTED: { label: "Changes Requested", className: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
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
    if (items.every(i => i.status === "APPROVED")) return { label: "All Approved", className: "bg-green-100 text-green-700" }
    if (items.some(i => i.status === "CHANGES_REQUESTED")) return { label: "Changes Requested", className: "bg-red-100 text-red-700" }
    const pending = items.filter(i => i.status === "PENDING").length
    return { label: `${pending} Pending`, className: "bg-amber-100 text-amber-700" }
  }

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold">📋 Drafts for Your Review</h2>
        {totalPending > 0 && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 animate-pulse">
            {totalPending} pending
          </span>
        )}
      </div>

      <div className="space-y-4">
        {approvals.map((approval) => {
          const batchStatus = getBatchStatus(approval.items)
          const isExpanded = expandedBatch === approval.id

          return (
            <Card key={approval.id} className="overflow-hidden transition-all duration-200">
              {/* Batch Header */}
              <div
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-muted/10 transition-colors"
                onClick={() => setExpandedBatch(isExpanded ? null : approval.id)}
              >
                <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm flex items-center gap-2 flex-wrap">
                      <span className="truncate">{approval.title}</span>
                      <span className="text-[10px] text-muted-foreground font-normal shrink-0">{approval.items.length} file(s)</span>
                    </h3>
                    {approval.description && <p className="text-xs text-muted-foreground truncate">{approval.description}</p>}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto pl-11 sm:pl-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold truncate ${batchStatus.className}`}>
                    {batchStatus.label}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
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
                      <div key={item.id} className={`border rounded-xl overflow-hidden ${isPending ? "border-amber-200 bg-amber-50/30" : "border-border/50 bg-muted/10"}`}>
                        <div className="p-4">
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Preview */}
                            <div className="w-full sm:w-36 h-28 rounded-lg overflow-hidden border border-border bg-muted/30 flex items-center justify-center shrink-0">
                              {isImage(item.fileType) ? (
                                <img src={item.fileUrl} alt={item.fileName} className="w-full h-full object-cover" />
                              ) : isVideo(item.fileType) ? (
                                <video src={item.fileUrl} className="w-full h-full object-cover" muted />
                              ) : (
                                <div className="text-center p-3">
                                  <p className="text-base font-bold text-muted-foreground uppercase">{item.fileType.split("/")[1]?.slice(0, 4) || "FILE"}</p>
                                  <p className="text-[9px] text-muted-foreground mt-1 truncate max-w-[100px]">{item.fileName}</p>
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-sm font-medium truncate">{item.fileName} <span className="text-xs text-muted-foreground">v{item.version}</span></p>
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold shrink-0 border ${config.className}`}>
                                  <StatusIcon className="w-3 h-3" />{config.label}
                                </span>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2 mt-3 flex-wrap">
                                <a href={item.fileUrl} target="_blank" rel="noreferrer">
                                  <Button variant="outline" size="sm" className="gap-1 text-xs h-7 px-2">
                                    <ExternalLink className="w-3 h-3" /> View Full
                                  </Button>
                                </a>
                                <a href={`/api/download?url=${encodeURIComponent(item.fileUrl)}`} download>
                                  <Button variant="outline" size="sm" className="gap-1 text-xs h-7 px-2">
                                    <Download className="w-3 h-3" /> Download
                                  </Button>
                                </a>
                                {isPending && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="gap-1 text-xs h-7 px-2 bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => handleApprove(item.id)}
                                      disabled={isLoading}
                                    >
                                      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="gap-1 text-xs h-7 px-2 border-red-300 text-red-600 hover:bg-red-50"
                                      onClick={() => setShowFeedbackFor(showFeedbackFor === item.id ? null : item.id)}
                                      disabled={isLoading}
                                    >
                                      <AlertTriangle className="w-3 h-3" /> Request Changes
                                    </Button>
                                  </>
                                )}
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
