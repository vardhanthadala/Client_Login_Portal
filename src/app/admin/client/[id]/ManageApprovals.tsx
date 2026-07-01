"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createApprovalAction, resubmitApprovalItemAction, deleteApprovalAction } from "@/app/actions/approvals"
import { Loader2, Plus, Upload, Trash2, ExternalLink, RefreshCw, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: Clock },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  CHANGES_REQUESTED: { label: "Changes Needed", className: "bg-red-100 text-red-700", icon: AlertTriangle },
}

export default function ManageApprovals({
  clientProfileId,
  initialApprovals,
}: {
  clientProfileId: string
  initialApprovals: Approval[]
}) {
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals)
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; type: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedApproval, setExpandedApproval] = useState<string | null>(null)
  const [expandedItemFeedback, setExpandedItemFeedback] = useState<string | null>(null)
  const [resubmitItemId, setResubmitItemId] = useState<string | null>(null)
  const [resubmitUploading, setResubmitUploading] = useState(false)

  const uploadSingleFile = async (file: File): Promise<{ url: string; name: string; type: string }> => {
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: file.name, contentType: file.type }),
    })
    const { uploadUrl, fileUrl } = await res.json()

    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    })

    return { url: fileUrl, name: file.name, type: file.type }
  }

  const handleMultiFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setIsUploading(true)

    const newFiles: { url: string; name: string; type: string }[] = []
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadSingleFile(files[i])
        newFiles.push(result)
      } catch (err) {
        toast.error(`Failed to upload: ${files[i].name}`)
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles])
    setIsUploading(false)
    // Reset the input so the same files can be re-selected
    e.target.value = ""
  }

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreate = async () => {
    if (!title || uploadedFiles.length === 0) return
    setIsSaving(true)
    const res = await createApprovalAction(clientProfileId, title, description, uploadedFiles)
    if (res.success && res.data) {
      setApprovals([res.data as any, ...approvals])
      setIsAdding(false)
      setTitle("")
      setDescription("")
      setUploadedFiles([])
    } else {
      toast.error(res.error)
    }
    setIsSaving(false)
  }

  const handleResubmitFile = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setResubmitUploading(true)
    try {
      const data = await uploadSingleFile(file)
      const res = await resubmitApprovalItemAction(itemId, data.url, data.name, data.type)
      if (res.success) {
        setApprovals(approvals.map(a => ({
          ...a,
          items: a.items.map(item => item.id === itemId ? {
            ...item,
            fileUrl: data.url,
            fileName: data.name,
            fileType: data.type,
            status: "PENDING",
            version: item.version + 1,
            feedback: [...item.feedback, { id: `temp-${Date.now()}`, action: "RESUBMITTED", comment: `Resubmitted version ${item.version + 1}`, createdAt: new Date().toISOString() }]
          } : item)
        })))
        setResubmitItemId(null)
      } else {
        toast.error(res.error)
      }
    } catch (err) {
      toast.error("Failed to upload file")
    }
    setResubmitUploading(false)
  }

  const [deleteApprovalId, setDeleteApprovalId] = useState<string | null>(null)
  const isDeleting = deleteApprovalId !== null

  const confirmDelete = async () => {
    if (!deleteApprovalId) return
    const id = deleteApprovalId
    setApprovals(approvals.filter(a => a.id !== id))
    await deleteApprovalAction(id)
    setDeleteApprovalId(null)
    toast.success("Approval batch deleted")
  }

  const handleDeleteClick = (id: string) => {
    setDeleteApprovalId(id)
  }

  const isImage = (fileType: string) => fileType.startsWith("image/")

  const getBatchStatus = (items: ApprovalItem[]) => {
    if (items.every(i => i.status === "APPROVED")) return { label: "All Approved", className: "bg-green-100 text-green-700" }
    if (items.some(i => i.status === "CHANGES_REQUESTED")) return { label: "Changes Requested", className: "bg-red-100 text-red-700" }
    return { label: `${items.filter(i => i.status === "PENDING").length} Pending`, className: "bg-amber-100 text-amber-700" }
  }

  return (
    <Card className="hover:border-primary/50 transition-all duration-200">
      <CardHeader className="flex flex-row items-start justify-between pb-4 border-b border-border/50">
        <div>
          <CardTitle className="text-lg font-bold">📋 Approval Center</CardTitle>
          <CardDescription>Upload drafts for client review. Each file gets its own approval.</CardDescription>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> New Batch
          </Button>
        )}
      </CardHeader>

      <CardContent className="pt-6">
        {/* New Batch Form */}
        {isAdding && (
          <div className="bg-muted/30 p-5 rounded-xl border border-border mb-6 space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block">Batch Title *</Label>
              <Input placeholder="e.g. Social Media Ads - Week 3, Logo Concepts..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block">Description (optional)</Label>
              <textarea
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Add a note about this batch..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block">Upload Files * (select multiple)</Label>

              {/* Already uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="relative group bg-card border border-border rounded-lg overflow-hidden">
                      <div className="h-20 flex items-center justify-center bg-muted/30">
                        {isImage(f.type) ? (
                          <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <p className="text-xs font-bold text-muted-foreground uppercase">{f.type.split("/")[1]?.slice(0, 4)}</p>
                        )}
                      </div>
                      <p className="text-[10px] px-2 py-1 truncate text-muted-foreground">{f.name}</p>
                      <button
                        onClick={() => removeUploadedFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center justify-center gap-3 p-5 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors">
                {isUploading ? (
                  <><Loader2 className="w-5 h-5 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Uploading...</span></>
                ) : (
                  <><Upload className="w-5 h-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">Click to select files (images, videos, PDFs…)</span></>
                )}
                <input type="file" multiple className="hidden" onChange={handleMultiFileSelect} disabled={isUploading} />
              </label>
              {uploadedFiles.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">{uploadedFiles.length} file(s) ready</p>
              )}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setTitle(""); setDescription(""); setUploadedFiles([]) }}>Cancel</Button>
              <Button size="sm" onClick={handleCreate} disabled={!title || uploadedFiles.length === 0 || isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Send {uploadedFiles.length} File(s) for Approval
              </Button>
            </div>
          </div>
        )}

        {/* Approval Batches */}
        {approvals.length > 0 ? (
          <div className="space-y-4">
            {approvals.map((approval) => {
              const batchStatus = getBatchStatus(approval.items)
              const isExpanded = expandedApproval === approval.id

              return (
                <div key={approval.id} className="border border-border rounded-xl overflow-hidden bg-card hover:border-primary/30 transition-colors">
                  {/* Batch Header */}
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/10 transition-colors"
                    onClick={() => setExpandedApproval(isExpanded ? null : approval.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ImageIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                          {approval.title}
                          <span className="text-[10px] text-muted-foreground font-normal">{approval.items.length} file(s)</span>
                        </h4>
                        {approval.description && <p className="text-xs text-muted-foreground truncate">{approval.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${batchStatus.className}`}>
                        {batchStatus.label}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(approval.id) }}
                        className="text-destructive hover:text-destructive/80 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded Items */}
                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                      {approval.items.map((item) => {
                        const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING
                        const StatusIcon = config.icon
                        const isFeedbackExpanded = expandedItemFeedback === item.id

                        return (
                          <div key={item.id} className="border border-border/50 rounded-lg p-3 bg-muted/10">
                            <div className="flex gap-3 items-start">
                              {/* Thumbnail */}
                              <div className="w-14 h-14 rounded-md overflow-hidden border border-border bg-muted/30 flex items-center justify-center shrink-0">
                                {isImage(item.fileType) ? (
                                  <img src={item.fileUrl} alt={item.fileName} className="w-full h-full object-cover" />
                                ) : (
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase">{item.fileType.split("/")[1]?.slice(0, 4)}</p>
                                )}
                              </div>

                              {/* File Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-medium truncate">{item.fileName} <span className="text-muted-foreground">v{item.version}</span></p>
                                  <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold shrink-0 ${config.className}`}>
                                    <StatusIcon className="w-2.5 h-2.5" />{config.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-1">
                                    <ExternalLink className="w-2.5 h-2.5" /> View
                                  </a>
                                  {item.status === "CHANGES_REQUESTED" && (
                                    resubmitItemId === item.id ? (
                                      <label className="text-[10px] text-primary font-semibold cursor-pointer hover:underline flex items-center gap-1">
                                        {resubmitUploading ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Upload className="w-2.5 h-2.5" />}
                                        {resubmitUploading ? "Uploading..." : "Upload New Version"}
                                        <input type="file" className="hidden" onChange={(e) => handleResubmitFile(item.id, e)} disabled={resubmitUploading} />
                                      </label>
                                    ) : (
                                      <button onClick={() => setResubmitItemId(item.id)} className="text-[10px] text-primary font-semibold hover:underline flex items-center gap-1">
                                        <RefreshCw className="w-2.5 h-2.5" /> Resubmit
                                      </button>
                                    )
                                  )}
                                  {item.feedback.length > 0 && (
                                    <button onClick={() => setExpandedItemFeedback(isFeedbackExpanded ? null : item.id)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                                      {isFeedbackExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                                      {item.feedback.length} response(s)
                                    </button>
                                  )}
                                </div>
                                {/* Item Feedback */}
                                {isFeedbackExpanded && (
                                  <div className="mt-2 pt-2 border-t border-border/50 space-y-1.5">
                                    {item.feedback.map(fb => (
                                      <div key={fb.id} className="flex gap-2 items-start">
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${fb.action === "APPROVED" ? "bg-green-500" : fb.action === "CHANGES_REQUESTED" ? "bg-red-500" : "bg-blue-500"}`} />
                                        <div>
                                          <p className="text-[10px] font-semibold">
                                            {fb.action === "APPROVED" ? "✅ Approved" : fb.action === "CHANGES_REQUESTED" ? "🔄 Changes Requested" : "📤 Resubmitted"}
                                          </p>
                                          {fb.comment && <p className="text-[10px] text-muted-foreground">{fb.comment}</p>}
                                          <p className="text-[9px] text-muted-foreground/60">{new Date(fb.createdAt).toLocaleString()}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          !isAdding && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No drafts submitted for review yet.</p>
            </div>
          )
        )}
      </CardContent>
      <AlertDialog open={deleteApprovalId !== null} onOpenChange={(open) => !open && setDeleteApprovalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Approval Batch?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this entire approval batch? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
