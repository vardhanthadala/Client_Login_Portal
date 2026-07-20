"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createApprovalAction, resubmitApprovalItemAction, deleteApprovalAction } from "@/app/actions/approvals"
import { Loader2, Plus, Upload, Trash2, ExternalLink, RefreshCw, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp, X, Image as ImageIcon, ClipboardCheck, FileImage } from "lucide-react"
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
  project?: {
    id: string
    name: string
  } | null
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: any }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700", icon: Clock },
  APPROVED: { label: "Approved", className: "bg-green-100 text-green-700", icon: CheckCircle2 },
  CHANGES_REQUESTED: { label: "Changes Needed", className: "bg-red-100 text-red-700", icon: AlertTriangle },
}

export default function ManageApprovals({
  clientProfileId,
  initialApprovals,
  projects = [],
}: {
  clientProfileId: string
  initialApprovals: Approval[]
  projects?: any[]
}) {
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals)
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<{ url: string; name: string; type: string }[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("")
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
    const res = await createApprovalAction(clientProfileId, title, description, uploadedFiles, selectedProjectId || undefined)
    if (res.success && res.data) {
      setApprovals([res.data as any, ...approvals])
      setIsAdding(false)
      setTitle("")
      setDescription("")
      setSelectedProjectId("")
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
    if (items.every(i => i.status === "APPROVED")) return { label: "ALL APPROVED", className: "bg-[#DCFCE7] text-[#166534] dark:bg-[#166534]/20 dark:text-[#4ADE80]" }
    if (items.some(i => i.status === "CHANGES_REQUESTED")) return { label: "CHANGES REQUESTED", className: "bg-[#FEE2E2] text-[#991B1B] dark:bg-[#991B1B]/20 dark:text-[#F87171]" }
    return { label: `${items.filter(i => i.status === "PENDING").length} PENDING`, className: "bg-[#FEF3C7] text-[#92400E] dark:bg-[#92400E]/20 dark:text-[#FBBF24]" }
  }

  return (
    <Card className="bg-slate-50 dark:bg-[#0A0A0A] border border-slate-100 dark:border-[#222] shadow-none rounded-[24px] overflow-hidden p-2 sm:p-5">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 pt-2 px-2 border-none gap-4 sm:gap-0">
        <div className="w-full sm:w-auto">
          <CardTitle className="text-[18px] font-sans font-medium text-slate-800 dark:text-slate-100 flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] shadow-[0_4px_10px_rgba(79,70,229,0.25)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
              <ClipboardCheck className="w-4 h-4 text-white drop-shadow-sm relative z-10" strokeWidth={2} />
            </div>
            Approval Center
          </CardTitle>
          <CardDescription className="text-[13.5px] text-slate-500 dark:text-slate-400 font-normal mt-1.5">Upload drafts for client review. Each file gets its own approval.</CardDescription>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2 w-full sm:w-auto shrink-0 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl shadow-sm text-[13px] font-medium h-9 px-4">
            <Plus className="w-4 h-4" /> New Batch
          </Button>
        )}
      </CardHeader>

      <CardContent className="px-2 pb-2 pt-0">
        {/* New Batch Form */}
        {isAdding && (
          <div className="bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm p-6 rounded-2xl border-none shadow-sm mb-6 space-y-5">
            <div>
              <Label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">Batch Title *</Label>
              <Input className="bg-white dark:bg-[#1A1A1A] border-slate-200 dark:border-[#333] rounded-xl" placeholder="e.g. Social Media Ads - Week 3, Logo Concepts..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            
            {projects && projects.length > 0 && (
              <div>
                <Label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">Project (optional)</Label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-3 py-2 text-[14px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4F46E5] text-slate-800 dark:text-slate-200"
                >
                  <option value="">Select a project...</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <Label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">Description (optional)</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-xl border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1A1A1A] px-3 py-2 text-[14px] placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4F46E5]"
                placeholder="Add a note about this batch..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2 block">Upload Files * (select multiple)</Label>

              {/* Already uploaded files */}
              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {uploadedFiles.map((f, i) => (
                    <div key={i} className="relative group bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-[#333] rounded-xl overflow-hidden shadow-sm">
                      <div className="h-24 flex items-center justify-center bg-slate-50 dark:bg-[#222]">
                        {isImage(f.type) ? (
                          <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                        ) : (
                          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{f.type.split("/")[1]?.slice(0, 4)}</p>
                        )}
                      </div>
                      <p className="text-[11px] px-3 py-2 truncate text-slate-600 dark:text-slate-300 font-medium">{f.name}</p>
                      <button
                        onClick={() => removeUploadedFile(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 dark:border-[#333] rounded-2xl cursor-pointer hover:border-[#4F46E5]/50 hover:bg-[#4F46E5]/5 dark:hover:bg-[#4F46E5]/10 transition-colors bg-white dark:bg-[#1A1A1A]">
                {isUploading ? (
                  <><Loader2 className="w-6 h-6 animate-spin text-[#4F46E5]" /><span className="text-[13px] font-medium text-slate-500">Uploading...</span></>
                ) : (
                  <><Upload className="w-6 h-6 text-slate-400" /><span className="text-[13px] font-medium text-slate-500">Click to select files (images, videos, PDFs…)</span></>
                )}
                <input type="file" multiple className="hidden" onChange={handleMultiFileSelect} disabled={isUploading} />
              </label>
              {uploadedFiles.length > 0 && (
                <p className="text-[12px] text-slate-500 mt-2 font-medium">{uploadedFiles.length} file(s) ready</p>
              )}
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button variant="ghost" size="sm" className="rounded-xl text-slate-500 font-medium hover:bg-slate-100" onClick={() => { setIsAdding(false); setTitle(""); setDescription(""); setSelectedProjectId(""); setUploadedFiles([]) }}>Cancel</Button>
              <Button size="sm" className="rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm font-medium" onClick={handleCreate} disabled={!title || uploadedFiles.length === 0 || isSaving}>
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
                <div key={approval.id} className="border-none shadow-[0_2px_10px_rgba(0,0,0,0.03)] rounded-2xl overflow-hidden bg-white dark:bg-[#111] transition-shadow">
                  {/* Batch Header */}
                  <div
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-slate-50/50 dark:hover:bg-[#161616] transition-colors gap-4 sm:gap-0"
                    onClick={() => setExpandedApproval(isExpanded ? null : approval.id)}
                  >
                    <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                      <div className="relative flex items-center justify-center w-11 h-11 rounded-[14px] bg-gradient-to-tr from-indigo-50 to-white dark:from-indigo-950/40 dark:to-[#111] shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-slate-200/60 dark:border-indigo-900/40 shrink-0">
                        <div className="absolute inset-0 rounded-[14px] ring-1 ring-inset ring-white/60 dark:ring-white/5"></div>
                        <FileImage className="w-5 h-5 text-indigo-500 dark:text-indigo-400 drop-shadow-sm" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-[15.5px] text-slate-800 dark:text-slate-200 flex items-center gap-2 break-words">
                          <span className="break-words">{approval.title}</span>
                          <span className="text-[12.5px] text-slate-400 font-normal shrink-0">{approval.items.length} file(s)</span>
                          {approval.project && (
                            <span className="text-[12.5px] text-slate-500 font-normal shrink-0">
                              (Project : {approval.project.name} )
                            </span>
                          )}
                        </h4>
                        {approval.description && <p className="text-[12.5px] text-slate-500 break-words mt-0.5 whitespace-pre-wrap">{approval.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end pl-14 sm:pl-0 mt-1 sm:mt-0">
                      <span className={`px-3 py-1 rounded-md text-[10.5px] tracking-wider font-semibold truncate max-w-full ${batchStatus.className}`}>
                        {batchStatus.label}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(approval.id) }}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="p-2 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4.5 h-4.5" /> : <ChevronDown className="w-4.5 h-4.5" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Items */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-[#222] px-5 pb-5 pt-4 space-y-3 bg-white dark:bg-[#111]">
                      {approval.items.map((item) => {
                        const config = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING
                        const StatusIcon = config.icon
                        const isFeedbackExpanded = expandedItemFeedback === item.id

                        let itemBadgeClass = "bg-[#FEF3C7] text-[#92400E]"
                        if (item.status === "APPROVED") itemBadgeClass = "bg-[#DCFCE7] text-[#166534]"
                        if (item.status === "CHANGES_REQUESTED") itemBadgeClass = "bg-[#FEE2E2] text-[#991B1B]"

                        return (
                          <div key={item.id} className="border border-slate-100 dark:border-[#222] rounded-xl p-4 bg-slate-50/50 dark:bg-[#161616]">
                            <div className="flex gap-4 items-start">
                              {/* Thumbnail */}
                              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-[#333] bg-white flex items-center justify-center shrink-0 shadow-sm">
                                {isImage(item.fileType) ? (
                                  <img src={`/api/file?url=${encodeURIComponent(item.fileUrl)}`} alt={item.fileName} className="w-full h-full object-cover" />
                                ) : (
                                  <p className="text-[11px] font-medium text-slate-400 uppercase">{item.fileType.split("/")[1]?.slice(0, 4)}</p>
                                )}
                              </div>

                              {/* File Info */}
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-[14px] font-medium text-slate-800 dark:text-slate-200 truncate">{item.fileName} <span className="text-slate-400 font-normal">v{item.version}</span></p>
                                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] uppercase tracking-wider font-semibold shrink-0 ${itemBadgeClass}`}>
                                    <StatusIcon className="w-3 h-3" />{config.label}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                  <a href={`/api/file?url=${encodeURIComponent(item.fileUrl)}`} target="_blank" rel="noreferrer" className="text-[11.5px] text-[#4F46E5] font-medium hover:underline flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                                    <ExternalLink className="w-3 h-3" /> View
                                  </a>
                                  {item.status === "CHANGES_REQUESTED" && (
                                    resubmitItemId === item.id ? (
                                      <label className="text-[11.5px] text-[#4F46E5] font-medium cursor-pointer hover:underline flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                                        {resubmitUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                                        {resubmitUploading ? "Uploading..." : "Upload New Version"}
                                        <input type="file" className="hidden" onChange={(e) => handleResubmitFile(item.id, e)} disabled={resubmitUploading} />
                                      </label>
                                    ) : (
                                      <button onClick={() => setResubmitItemId(item.id)} className="text-[11.5px] text-[#4F46E5] font-medium hover:underline flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                                        <RefreshCw className="w-3 h-3" /> Resubmit
                                      </button>
                                    )
                                  )}
                                  {item.feedback.length > 0 && (
                                    <button onClick={() => setExpandedItemFeedback(isFeedbackExpanded ? null : item.id)} className="text-[11.5px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium flex items-center gap-1.5 bg-slate-100 dark:bg-[#222] px-2 py-1 rounded-md">
                                      {isFeedbackExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                      {item.feedback.length} response(s)
                                    </button>
                                  )}
                                </div>
                                {/* Item Feedback */}
                                {isFeedbackExpanded && (
                                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-[#333] space-y-3">
                                    {item.feedback.map(fb => (
                                      <div key={fb.id} className="flex gap-3 items-start bg-white dark:bg-[#1A1A1A] p-3 rounded-lg border border-slate-100 dark:border-[#222]">
                                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${fb.action === "APPROVED" ? "bg-emerald-500" : fb.action === "CHANGES_REQUESTED" ? "bg-red-500" : "bg-[#4F46E5]"}`} />
                                        <div>
                                          <p className="text-[12px] font-medium text-slate-800 dark:text-slate-200">
                                            {fb.action === "APPROVED" ? "Approved" : fb.action === "CHANGES_REQUESTED" ? "Changes Requested" : "Resubmitted"}
                                          </p>
                                          {fb.comment && <p className="text-[12.5px] text-slate-600 dark:text-slate-400 mt-1">{fb.comment}</p>}
                                          <p className="text-[10px] text-slate-400 mt-1.5">{new Date(fb.createdAt).toLocaleString()}</p>
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
