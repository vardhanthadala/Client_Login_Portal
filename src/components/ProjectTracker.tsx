"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Check, Clock, Video, Users, FolderKanban, Image as ImageIcon, CalendarDays, CheckCircle2 } from "lucide-react"

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
  
  // Calculate the width of the active progress line
  const progressPercentage = stages.length > 1 
    ? Math.round((currentStage / (stages.length - 1)) * 100)
    : 0

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-white dark:bg-[#17191D] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[20px] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-250 hover:-translate-y-1 hover:border-[#E2E8F0] dark:hover:border-[#333] group overflow-hidden">
        
        {/* Top Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F7F8FA] dark:bg-[#0F1115] border border-[#E9EDF4] dark:border-[#2A2E35] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
              <FolderKanban className="w-6 h-6 text-[#0F172A] dark:text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[22px] font-bold text-[#0F172A] dark:text-white font-sans tracking-tight mb-1">
                {project.name}
              </h2>
              <p className="text-[14px] text-[#64748B] dark:text-[#94A3B8] font-medium leading-relaxed max-w-md">
                Tracking project milestones and deliverables.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#64748B] dark:text-[#666] mb-1">Status</span>
              <div className="flex items-center gap-2 bg-[#F7F8FA] dark:bg-[#0F1115] px-3 py-1.5 rounded-lg border border-[#E9EDF4] dark:border-[#2A2E35]">
                <CalendarDays className="w-3.5 h-3.5 text-[#0F172A] dark:text-white" />
                <span className="text-[13px] font-semibold text-[#0F172A] dark:text-white">Active</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-[11px] uppercase tracking-wider font-bold text-[#64748B] dark:text-[#666] mb-1">Team</span>
              <div className="flex items-center -space-x-2">
                <div className="w-8 h-8 rounded-full bg-[#101828] border-2 border-white dark:border-[#17191D] flex items-center justify-center text-white text-[10px] font-bold z-20">
                  {project.name.charAt(0)}
                </div>
                <div className="w-8 h-8 rounded-full bg-[#64748B] border-2 border-white dark:border-[#17191D] flex items-center justify-center text-white text-[10px] font-bold z-10">
                  JS
                </div>
                <div className="w-8 h-8 rounded-full bg-[#F1F5F9] dark:bg-[#2A2E35] border-2 border-white dark:border-[#17191D] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] text-[10px] font-bold z-0">
                  +2
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative min-w-[600px] overflow-x-auto pb-4 hidden-scrollbar">
          {/* Base Background Line */}
          <div className="absolute top-5 left-12 right-12 h-[2px] bg-[#E9EDF4] dark:bg-[#2A2E35]" />
          
          {/* Active Progress Line */}
          <div 
            className="absolute top-5 left-12 h-[2px] bg-gradient-to-r from-[#9D4EDD] to-[#7B2CBF] dark:from-[#B14EFF] dark:to-[#8F00FF] transition-all duration-1000 ease-out"
            style={{ width: `calc(${progressPercentage}% - 6rem)` }}
          />
          
          <div className="relative flex justify-between w-full">
            {stages.map((stage: string, idx: number) => {
              const isCompleted = idx < project.currentStageIdx
              const isActive = idx === project.currentStageIdx
              const isUpcoming = idx > project.currentStageIdx
              
              return (
                <div key={idx} className="flex flex-col items-center group relative z-10 w-28">
                  {/* Node */}
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 bg-white dark:bg-[#17191D] ${
                      isCompleted 
                        ? "border-[#10B981] text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                        : isActive
                          ? "border-[#9D4EDD] dark:border-[#B14EFF] shadow-[0_0_20px_rgba(157,78,221,0.2)] dark:shadow-[0_0_20px_rgba(177,78,255,0.2)]"
                          : "border-[#E9EDF4] dark:border-[#2A2E35] text-[#94A3B8]"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" strokeWidth={3} />
                    ) : isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#9D4EDD] dark:bg-[#B14EFF] animate-pulse" />
                    ) : (
                      <span className="text-[12px] font-bold text-[#64748B] dark:text-[#666]">0{idx + 1}</span>
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className="mt-5 text-center flex flex-col items-center">
                    <p 
                      className={`text-[11px] uppercase tracking-[0.1em] font-bold leading-tight transition-colors duration-300 mb-2 ${
                        isCompleted ? "text-[#0F172A] dark:text-[#E2E8F0]" : isActive ? "text-[#0F172A] dark:text-white" : "text-[#64748B] dark:text-[#666]"
                      }`}
                    >
                      {stage}
                    </p>
                    
                    {/* Status Badge */}
                    <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isCompleted 
                        ? "bg-[#10B981]/10 text-[#10B981]" 
                        : isActive
                          ? "bg-[#9D4EDD] dark:bg-[#B14EFF] text-white"
                          : "bg-[#F1F5F9] dark:bg-[#222] text-[#64748B] dark:text-[#888]"
                    }`}>
                      {isCompleted ? "Completed" : isActive ? "Active" : "Pending"}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-[#17191D] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[20px] p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ImageIcon className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mb-1">Assets Created</p>
          <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">{assetsCount}</h3>
        </div>

        <div className="bg-white dark:bg-[#17191D] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[20px] p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mb-1">Approvals Completed</p>
          <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">{approvalsCount}</h3>
        </div>

        <div className="bg-white dark:bg-[#17191D] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[20px] p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-[#9D4EDD]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FolderKanban className="w-5 h-5 text-[#9D4EDD] dark:text-[#B14EFF]" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mb-1">Overall Progress</p>
          <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">{progressPercentage}%</h3>
        </div>

        <div className="bg-white dark:bg-[#17191D] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[20px] p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#888] mb-1">Days Remaining</p>
          <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">Active</h3>
        </div>
      </div>
    </div>
  )
}
