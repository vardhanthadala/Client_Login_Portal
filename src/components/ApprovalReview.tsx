"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { respondToApprovalItemAction } from "@/app/actions/approvals"
import { Loader2, Check, Download, FileText, CheckCircle2, ImageIcon, Folder, Clock, ChevronLeft, ChevronRight, PenLine, Eye } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

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

export default function ApprovalReview({ projects: initialProjects }: { projects: any[] }) {
  const [projects, setProjects] = useState<any[]>(initialProjects)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0)
  
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [changesComment, setChangesComment] = useState("")

  let displayProjects = projects.length > 0 ? projects : [
    {
      id: "mock-proj-1",
      name: "Acme Corp Rebranding (Demo)",
      approvals: []
    }
  ]

  displayProjects = displayProjects.map((p, index) => {
    const allItems = p.approvals?.flatMap((a: any) => a.items) || []
    if (allItems.length === 0) {
      let items: any[] = [];
      if (index % 3 === 0) {
        items = [
          { id: `mock-item-1-${p.id}`, fileName: "Homepage_Design_v1.fig", fileType: "application/figma", status: "PENDING", fileUrl: "#" },
          { id: `mock-item-2-${p.id}`, fileName: "Copywriting_Draft.pdf", fileType: "application/pdf", status: "APPROVED", fileUrl: "#" },
          { id: `mock-item-3-${p.id}`, fileName: "Social_Media_Assets.zip", fileType: "application/zip", status: "CHANGES_REQUESTED", fileUrl: "#" }
        ];
      } else if (index % 3 === 1) {
        items = [
          { id: `mock-item-1-${p.id}`, fileName: "Brand_Logo_Options.pdf", fileType: "application/pdf", status: "PENDING", fileUrl: "#" },
          { id: `mock-item-2-${p.id}`, fileName: "Video_Ad_v2.mp4", fileType: "video/mp4", status: "PENDING", fileUrl: "#" }
        ];
      } else {
        items = [
          { id: `mock-item-1-${p.id}`, fileName: "Q3_Marketing_Report.xlsx", fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", status: "APPROVED", fileUrl: "#" },
          { id: `mock-item-2-${p.id}`, fileName: "Email_Newsletter_Template.html", fileType: "text/html", status: "APPROVED", fileUrl: "#" },
          { id: `mock-item-3-${p.id}`, fileName: "Blog_Post_Header.png", fileType: "image/png", status: "APPROVED", fileUrl: "https://placehold.co/800x400.png" },
          { id: `mock-item-4-${p.id}`, fileName: "SEO_Audit.pdf", fileType: "application/pdf", status: "CHANGES_REQUESTED", fileUrl: "#" }
        ];
      }

      return {
        ...p,
        approvals: [
          {
            items
          }
        ]
      }
    }
    return p
  })

  const currentProject = displayProjects[currentProjectIndex]
  const allItems = currentProject.approvals?.flatMap((a: any) => a.items) || []

  const totalFiles = allItems.length
  const pendingReview = allItems.filter(i => i.status === "PENDING").length
  const approved = allItems.filter(i => i.status === "APPROVED").length

  const handleApprove = async (itemId: string) => {
    setLoadingId(itemId)
    const res = await respondToApprovalItemAction(itemId, "APPROVED")
    if (res.success) {
      setProjects(projects.map(p => ({
        ...p,
        approvals: p.approvals?.map((a: any) => ({
          ...a,
          items: a.items.map((item: any) => item.id === itemId ? {
            ...item,
            status: "APPROVED",
            feedback: [...item.feedback, { id: `temp-${Date.now()}`, action: "APPROVED", comment: null, createdAt: new Date().toISOString() }]
          } : item)
        }))
      })))
      toast.success("File approved!")
    } else {
      toast.error(res.error)
    }
    setLoadingId(null)
  }

  const openChangesDialog = (itemId: string) => {
    setActiveItemId(itemId)
    setChangesComment("")
    setDialogOpen(true)
  }

  const submitChanges = async () => {
    if (!activeItemId) return
    if (!changesComment.trim()) return toast.error("Please describe what changes you need.")
    
    setLoadingId(activeItemId)
    setDialogOpen(false)
    
    const res = await respondToApprovalItemAction(activeItemId, "CHANGES_REQUESTED", changesComment)
    if (res.success) {
      setProjects(projects.map(p => ({
        ...p,
        approvals: p.approvals?.map((a: any) => ({
          ...a,
          items: a.items.map((item: any) => item.id === activeItemId ? {
            ...item,
            status: "CHANGES_REQUESTED",
            feedback: [...item.feedback, { id: `temp-${Date.now()}`, action: "CHANGES_REQUESTED", comment: changesComment, createdAt: new Date().toISOString() }]
          } : item)
        }))
      })))
      toast.success("Changes requested successfully.")
    } else {
      toast.error(res.error)
    }
    setLoadingId(null)
  }

  const handlePrev = () => {
    if (currentProjectIndex > 0) setCurrentProjectIndex(currentProjectIndex - 1)
  }

  const handleNext = () => {
    if (currentProjectIndex < displayProjects.length - 1) setCurrentProjectIndex(currentProjectIndex + 1)
  }

  const isImage = (fileType: string) => fileType.startsWith("image/")

  return (
    <div className="w-full flex flex-col gap-[25px]">
      
      {/* Header and Stats */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[22px] font-normal text-[#0F172A] dark:text-white tracking-tight mb-1">Approvals</h1>
          <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8]">Review and approve files shared by your agency.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Project Name Card */}
          <div className="bg-white dark:bg-[#111111] rounded-[12px] shadow-sm border border-[#E2E8F0] dark:border-[#222] p-5 flex items-center gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-[10px] p-2.5 shrink-0">
              <Folder className="w-5 h-5 fill-indigo-100 dark:fill-indigo-900/30" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider truncate">Project Name</span>
              <span className="text-[15px] font-medium text-[#0F172A] dark:text-white leading-none mt-1 mb-1.5 truncate">{currentProject.name}</span>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Active
              </div>
            </div>
          </div>
          
          {/* Total Files Card */}
          <div className="bg-white dark:bg-[#111111] rounded-[12px] shadow-sm border border-[#E2E8F0] dark:border-[#222] p-5 flex items-center gap-4">
            <div className="bg-[#3454D1]/10 text-[#3454D1] rounded-[10px] p-2.5 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Total Files</span>
              <span className="text-[20px] font-medium text-[#0F172A] dark:text-white leading-none mt-1">{totalFiles}</span>
            </div>
          </div>
          
          {/* Pending Review Card */}
          <div className="bg-white dark:bg-[#111111] rounded-[12px] shadow-sm border border-[#E2E8F0] dark:border-[#222] p-5 flex items-center gap-4">
            <div className="bg-[#F59E0B]/10 text-[#F59E0B] rounded-[10px] p-2.5 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Pending</span>
              <span className="text-[20px] font-medium text-[#0F172A] dark:text-white leading-none mt-1">{pendingReview}</span>
            </div>
          </div>
          
          {/* Approved Card */}
          <div className="bg-white dark:bg-[#111111] rounded-[12px] shadow-sm border border-[#E2E8F0] dark:border-[#222] p-5 flex items-center gap-4">
            <div className="bg-[#10B981]/10 text-[#10B981] rounded-[10px] p-2.5 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Approved</span>
              <span className="text-[20px] font-medium text-[#0F172A] dark:text-white leading-none mt-1">{approved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#111] rounded-[12px] border border-[#E2E8F0] dark:border-[#222] shadow-sm flex flex-col mt-2">
        <div className="block md:hidden px-6 pt-4 pb-2 text-[11px] text-[#64748B] text-right italic">
          Scroll horizontally to view all details →
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
             <thead>
               <tr className="border-b border-[#E2E8F0] dark:border-[#222]">
                 <th className="px-6 py-5 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">File Name</th>
                 <th className="px-6 py-5 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Type</th>
                 <th className="px-6 py-5 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-center">Approve</th>
                 <th className="px-6 py-5 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-center">Changes Requested</th>
                 <th className="px-6 py-5 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Status</th>
                 <th className="px-6 py-5 text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Action</th>
               </tr>
             </thead>
             <tbody>
               {allItems.map((item, idx) => {
                 const isApproved = item.status === "APPROVED"
                 const isPending = item.status === "PENDING"
                 const isChangesRequested = item.status === "CHANGES_REQUESTED"
                 const isLoading = loadingId === item.id

                 return (
                   <tr key={item.id} className={`${idx !== allItems.length - 1 ? 'border-b border-[#E2E8F0] dark:border-[#222]' : ''} hover:bg-[#F8FAFC] dark:hover:bg-[#161616] transition-colors`}>
                     <td className="px-6 py-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-[#F1F5F9] dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333] shrink-0 flex items-center justify-center relative">
                           {isImage(item.fileType) ? (
                             <Image src={`/api/file?url=${encodeURIComponent(item.fileUrl)}`} alt={item.fileName} fill sizes="48px" className="object-cover" unoptimized={true} />
                           ) : (
                             <FileText className="w-5 h-5 text-[#94A3B8]" />
                           )}
                         </div>
                         <span className="text-[13px] font-normal text-[#0F172A] dark:text-white max-w-[200px] truncate">{item.fileName}</span>
                       </div>
                     </td>
                     
                     <td className="px-6 py-4">
                       <span className="text-[13px] font-normal text-[#64748B] dark:text-[#94A3B8]">{item.fileType}</span>
                     </td>
                     
                     <td className="px-6 py-4 text-center">
                       <button 
                         onClick={() => handleApprove(item.id)}
                         disabled={isLoading}
                         className={`inline-flex items-center justify-center gap-1.5 h-[34px] px-4 rounded-full border text-[12px] font-normal transition-all
                           ${isApproved 
                              ? 'border-[#10B981] text-[#10B981] bg-[#10B981]/10' 
                              : 'border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 bg-transparent'}`}
                       >
                         {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                         Approve
                       </button>
                     </td>
                     
                     <td className="px-6 py-4 text-center">
                       <button 
                         onClick={() => openChangesDialog(item.id)}
                         disabled={isLoading || isApproved}
                         className={`inline-flex items-center justify-center gap-1.5 h-[34px] px-4 rounded-full border text-[12px] font-normal transition-all
                           ${isChangesRequested
                              ? 'border-[#EF4444] text-[#EF4444] bg-[#EF4444]/10'
                              : isApproved 
                                ? 'border-[#E2E8F0] text-[#94A3B8] dark:border-[#333] dark:text-[#666] opacity-50 cursor-not-allowed bg-transparent'
                                : 'border-[#EF4444] text-[#EF4444] hover:bg-[#EF4444]/10 bg-transparent'}`}
                       >
                         {isLoading && isChangesRequested ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenLine className="w-3 h-3" />}
                         Request Changes
                       </button>
                     </td>

                     <td className="px-6 py-4">
                       {isPending ? (
                         <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#F59E0B]/10 text-[#F59E0B] w-max">
                           <Clock className="w-3.5 h-3.5" />
                           <span className="text-[10px] font-normal tracking-widest uppercase">Pending</span>
                         </div>
                       ) : isApproved ? (
                         <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#10B981]/10 text-[#10B981] w-max">
                           <CheckCircle2 className="w-3.5 h-3.5" />
                           <span className="text-[10px] font-normal tracking-widest uppercase">Approved</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#EF4444]/10 text-[#EF4444] w-max">
                           <span className="text-[10px] font-normal tracking-widest uppercase">Changes Requested</span>
                         </div>
                       )}
                     </td>

                     <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <a href={`/api/file?url=${encodeURIComponent(item.fileUrl)}`} target="_blank" rel="noreferrer">
                           <button className="flex items-center justify-center h-8 px-3 rounded-[6px] border border-[#E2E8F0] dark:border-[#333] text-[12px] text-[#0F172A] dark:text-white hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] transition-colors gap-1.5">
                             <Eye className="w-3.5 h-3.5" />
                             View
                           </button>
                         </a>
                         <a href={`/api/file?url=${encodeURIComponent(item.fileUrl)}&download=true`} download>
                           <button className="flex items-center justify-center w-8 h-8 rounded-[6px] border border-[#E2E8F0] dark:border-[#333] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1A1A1A] transition-colors">
                             <Download className="w-3.5 h-3.5" />
                           </button>
                         </a>
                       </div>
                     </td>
                   </tr>
                 )
               })}
             </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0] dark:border-[#222] bg-[#F8FAFC]/50 dark:bg-[#111]/50 rounded-b-[15px]">
          <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8] font-normal">
            Showing Project {currentProjectIndex + 1} of {displayProjects.length}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrev} 
              disabled={currentProjectIndex === 0} 
              className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#E2E8F0] dark:border-[#333] bg-white dark:bg-[#111] disabled:opacity-50 hover:bg-[#F8FAFC] dark:hover:bg-[#222] transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#3454D1] bg-[#3454D1]/10 text-[#3454D1] font-normal text-[13px]">
              {currentProjectIndex + 1}
            </button>
            <button 
              onClick={handleNext} 
              disabled={currentProjectIndex === displayProjects.length - 1} 
              className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#E2E8F0] dark:border-[#333] bg-white dark:bg-[#111] disabled:opacity-50 hover:bg-[#F8FAFC] dark:hover:bg-[#222] transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
            </button>
          </div>
        </div>
      </div>

      {/* Changes Requested Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-normal">Request Changes</DialogTitle>
            <DialogDescription className="font-normal">
              Describe the specific changes you need for this file. Your agency will be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={changesComment}
              onChange={(e) => setChangesComment(e.target.value)}
              placeholder="E.g., Please make the logo larger..."
              className="min-h-[100px] font-normal"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="font-normal">
              Cancel
            </Button>
            <Button onClick={submitChanges} disabled={!changesComment.trim() || loadingId !== null} className="bg-[#3454D1] hover:bg-[#283C50] text-white font-normal">
              {loadingId ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Submit Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
