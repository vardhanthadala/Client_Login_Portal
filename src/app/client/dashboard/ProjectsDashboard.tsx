"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { CalendarDays, ChevronLeft, ChevronRight, Download, FileText, Image as ImageIcon, Video, Folder, Check, ChevronRightIcon, Flag, Clock } from "lucide-react"

type Project = {
  id: string
  name: string
  stages: string[] | any
  currentStageIdx: number
  createdAt?: string
}

type BrandAsset = {
  id: string
  type: string
  fileUrl: string
  description?: string | null
  createdAt: string
}

type ProjectsDashboardProps = {
  projects: Project[]
  clientName: string
  assets: BrandAsset[]
}

export default function ProjectsDashboard({ projects, clientName, assets }: ProjectsDashboardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#111] rounded-2xl border border-slate-100 dark:border-[#222]">
        <Folder className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
        <h3 className="text-lg font-normal text-slate-900 dark:text-white">No active projects</h3>
      </div>
    )
  }

  const currentProject = projects[currentIndex]
  const stages = Array.isArray(currentProject.stages) ? currentProject.stages : []
  const currentStage = Math.max(0, Math.min(currentProject.currentStageIdx, stages.length - 1))
  
  const maxIdx = Math.max(1, stages.length - 1)
  const rawProgress = stages.length > 0 ? Math.round(((currentProject.currentStageIdx ?? 0) / maxIdx) * 100) : 0
  const progress = Math.min(100, Math.max(0, rawProgress))

  const handlePrev = () => setCurrentIndex(prev => Math.max(0, prev - 1))
  const handleNext = () => setCurrentIndex(prev => Math.min(projects.length - 1, prev + 1))

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-6 h-6 text-purple-500" />
      case 'IMAGE':
      case 'LOGO_DARK':
      case 'LOGO_LIGHT': return <ImageIcon className="w-6 h-6 text-emerald-500" />
      default: return <FileText className="w-6 h-6 text-blue-500" />
    }
  }

  const getFileExtColor = (type: string) => {
    switch (type) {
      case 'VIDEO': return 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
      case 'IMAGE':
      case 'LOGO_DARK':
      case 'LOGO_LIGHT': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
      default: return 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
    }
  }

  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalNode(document.getElementById("projects-pagination-portal"));
  }, []);

  const paginationControls = (
    <div className="flex items-center bg-white dark:bg-[#111] border border-[#E2E8F0] dark:border-[#333] rounded-[6px] overflow-hidden h-[38px] shadow-sm">
      <button 
        onClick={handlePrev}
        disabled={currentIndex === 0}
        className="p-1.5 h-full hover:bg-[#F8FAFC] dark:hover:bg-[#222] disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center justify-center border-r border-[#E2E8F0] dark:border-[#333]"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
      </button>
      <span className="px-2 text-xs font-normal text-slate-600 dark:text-slate-300 min-w-[40px] text-center">
        {currentIndex + 1} / {projects.length}
      </span>
      <button 
        onClick={handleNext}
        disabled={currentIndex === projects.length - 1}
        className="p-1.5 h-full hover:bg-[#F8FAFC] dark:hover:bg-[#222] disabled:opacity-30 disabled:hover:bg-transparent transition-colors flex items-center justify-center border-l border-[#E2E8F0] dark:border-[#333]"
      >
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
      </button>
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      
      {portalNode ? createPortal(paginationControls, portalNode) : null}

      {/* Main Project Card */}
      <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-[#222] rounded-xl shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-500/20">
            <Folder className="w-8 h-8 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-900/30" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col">
            <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-normal bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 mb-2">
              In Progress
            </span>
            <h2 className="text-lg font-normal text-slate-900 dark:text-white mb-4 tracking-tight">{currentProject.name}</h2>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-xs">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-normal">Start Date</span>
                  <span className="font-normal text-slate-700 dark:text-slate-300">
                    {currentProject.createdAt ? new Date(currentProject.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-normal">Due Date</span>
                  <span className="font-normal text-slate-700 dark:text-slate-300">
                    Ongoing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full md:w-[300px] md:pl-6 md:border-l border-slate-200 dark:border-[#222]">
          <div className="flex items-end justify-between mb-2">
            <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400">Progress</span>
            <span className="text-xl font-normal text-indigo-600 dark:text-indigo-400">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-[#222] rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Milestones Card */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-[#222] rounded-xl shadow-sm p-5 sm:p-6">
          <h3 className="text-[15px] font-normal text-slate-900 dark:text-white mb-6">Milestones</h3>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute top-4 left-[11px] bottom-6 w-[2px] bg-slate-100 dark:bg-[#222]" />

            <div className="flex flex-col space-y-6 relative z-10">
              {stages.map((stage: string, idx: number) => {
                const isFinished = currentProject.currentStageIdx >= stages.length - 1;
                const isCompleted = idx < currentProject.currentStageIdx || (isFinished && idx === stages.length - 1);
                const isActive = idx === currentProject.currentStageIdx && !isFinished;
                const isPending = !isCompleted && !isActive;

                return (
                  <div key={idx} className="flex items-center gap-4 bg-white dark:bg-[#111]">
                    {/* Circle */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-[1.5px] ${
                      isCompleted 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-500 dark:bg-emerald-500/20' 
                        : isActive 
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-[#222] dark:border-[#333]'
                    }`}>
                      {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-[11px] font-normal">{idx + 1}</span>}
                    </div>

                    <div className="flex flex-1 items-center justify-between">
                      <span className={`text-[13px] font-normal ${
                        isCompleted || isActive ? 'text-slate-900 dark:text-white' : 'text-slate-500'
                      }`}>
                        {stage}
                      </span>

                      {isCompleted && (
                        <div className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-normal tracking-wide">
                          Completed
                        </div>
                      )}
                      
                      {isActive && (
                        <div className="flex items-center gap-4 w-[200px] justify-end">
                          <div className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 text-xs font-normal tracking-wide">
                            Active
                          </div>
                          <span className="text-xs font-normal text-slate-700 dark:text-slate-300 w-8">{progress}%</span>
                          <div className="w-16 h-1 bg-slate-100 dark:bg-[#222] rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Assets Card */}
        <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-[#222] rounded-xl shadow-sm p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[15px] font-normal text-slate-900 dark:text-white">Assets</h3>
            <span className="text-[13px] font-normal text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 cursor-pointer">View all</span>
          </div>

          <div className="flex flex-col space-y-5">
            {assets.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
                No assets uploaded yet.
              </div>
            ) : (
              assets.slice(0, 5).map((asset) => {
                const fileName = asset.fileUrl.split('/').pop() || asset.type
                return (
                  <div key={asset.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${getFileExtColor(asset.type)}`}>
                        {getFileIcon(asset.type)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-normal text-slate-900 dark:text-white line-clamp-1 max-w-[180px]">{asset.description || fileName}</span>
                        <div className="flex items-center text-[11px] text-slate-500 gap-2 font-normal">
                          <span>{asset.type}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span>{new Date(asset.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <a 
                      href={"/api/file?url=" + encodeURIComponent(asset.fileUrl) + "&download=true"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
