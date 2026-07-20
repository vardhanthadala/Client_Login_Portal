"use client"

import { MoreVertical, CalendarDays, CheckCircle2 } from "lucide-react"
import Image from "next/image"

type Project = {
  id: string
  name: string
  stages: any
  currentStageIdx: number
  createdAt?: string
}

export default function ProjectTracker({ project, assetsCount = 0, approvalsCount = 0 }: { project: Project, assetsCount?: number, approvalsCount?: number }) {
  const stages = Array.isArray(project.stages) ? project.stages : []
  const currentStage = Math.max(0, Math.min(project.currentStageIdx, stages.length - 1))
  
  // Strict production stages logic for the progress bar
  const maxIdx = Math.max(1, stages.length - 1)
  const rawProgress = stages.length > 0 
    ? Math.round(((project.currentStageIdx ?? 0) / maxIdx) * 100)
    : 0
  const overallProgress = Math.min(100, Math.max(0, rawProgress))

  return (
    <div className="bg-white dark:bg-[#111111] border border-[#E2E8F0] dark:border-[#222] rounded-[16px] shadow-sm flex flex-col relative w-full mb-6">
      <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0] dark:border-[#222]">
        <h2 className="text-[16px] font-bold text-[#0F172A] dark:text-white">Project Status</h2>

      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[12px] bg-[#F1F5F9] dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333] flex items-center justify-center shrink-0">
               <span className="text-[14px] font-bold text-[#3454D1]">{project.name.substring(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-[#0F172A] dark:text-white">{project.name}</span>
              <span className="text-[13px] text-[#64748B] dark:text-[#94A3B8]">{project.createdAt ? new Date(project.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : "Active Project"}</span>
            </div>
          </div>
          <div className="text-[16px] font-bold text-[#0F172A] dark:text-white">
            {overallProgress}%
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#F1F5F9] dark:bg-[#222] rounded-full overflow-hidden mb-6">
          <div className="h-full bg-[#10B981] rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }}></div>
        </div>

        {/* Milestone Steps */}
        <div className="flex flex-col gap-4 mt-6">
          <h3 className="text-[14px] font-bold text-[#0F172A] dark:text-white mb-2">Milestones</h3>
          {stages.map((stage: string, idx: number) => {
            const isFinished = project.currentStageIdx >= stages.length - 1;
            const isCompleted = idx < project.currentStageIdx || (isFinished && idx === stages.length - 1);
            const isActive = idx === project.currentStageIdx && !isFinished;
            
            return (
              <div key={idx} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  isCompleted 
                    ? "bg-[#10B981]/10 text-[#10B981]" 
                    : isActive
                      ? "bg-[#3454D1]/10 text-[#3454D1]"
                      : "bg-[#F1F5F9] dark:bg-[#222] text-[#64748B] dark:text-[#888]"
                }`}>
                  {isCompleted ? <CheckCircle2 size={16} /> : <span className="text-[12px] font-bold">{idx + 1}</span>}
                </div>
                <div className="flex flex-col flex-1">
                  <span className={`text-[14px] font-semibold ${
                    isCompleted || isActive ? "text-[#0F172A] dark:text-white" : "text-[#64748B] dark:text-[#888]"
                  }`}>{stage}</span>
                </div>
                <div className={`inline-flex items-center justify-center min-w-[90px] px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                  isCompleted 
                    ? "bg-[#10B981]/10 text-[#10B981]" 
                    : isActive
                      ? "bg-[#3454D1]/10 text-[#3454D1]"
                      : "bg-[#F1F5F9] dark:bg-[#222] text-[#64748B] dark:text-[#888]"
                }`}>
                  {isCompleted ? "Completed" : isActive ? "Active" : "Pending"}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

