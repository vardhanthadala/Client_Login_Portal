"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Check, Clock, CircleDot } from "lucide-react"

type Project = {
  id: string
  name: string
  stages: any
  currentStageIdx: number
}

export default function ProjectTracker({ project }: { project: Project }) {
  const stages = Array.isArray(project.stages) ? project.stages : []
  const currentStage = Math.max(0, Math.min(project.currentStageIdx, stages.length - 1))
  
  // Calculate the width of the active progress line
  const progressPercentage = stages.length > 1 
    ? (currentStage / (stages.length - 1)) * 100 
    : 0

  return (
    <Card className="bg-white border-[#E5E7EB] rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-[#5A52FF]/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(90,82,255,0.06)] overflow-hidden mb-6 last:mb-0">
      <CardHeader className="pb-4 px-8 pt-7 bg-white border-b border-[#F1F5F9]">
        <CardTitle className="text-xl font-sans font-bold text-[#0F172A]">{project.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-10 pb-12 px-4 sm:px-8 overflow-x-auto">
        <div className="relative min-w-[600px]">
          {/* Base Background Line */}
          <div className="absolute top-5 left-8 right-8 h-[3px] bg-[#F1F5F9] rounded-full" />
          
          {/* Active Progress Line */}
          <div 
            className="absolute top-5 left-8 h-[3px] bg-[#5A52FF] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `calc(${progressPercentage}% - 4rem)` }}
          />
          
          <div className="relative flex justify-between w-full">
            {stages.map((stage: string, idx: number) => {
              const isCompleted = idx < project.currentStageIdx
              const isActive = idx === project.currentStageIdx
              const isUpcoming = idx > project.currentStageIdx
              
              return (
                <div key={idx} className="flex flex-col items-center group relative z-10 w-24">
                  {/* Circle Indicator */}
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                      isCompleted 
                        ? "bg-[#5A52FF] border-white text-white shadow-[0_0_0_2px_#5A52FF,0_4px_10px_rgba(90,82,255,0.3)]" 
                        : isActive
                          ? "bg-white border-[#5A52FF] text-[#5A52FF] shadow-[0_0_0_4px_rgba(90,82,255,0.1)]"
                          : "bg-[#F8FAFC] border-white text-[#94A3B8] shadow-[0_0_0_2px_#E2E8F0]"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" strokeWidth={3} />
                    ) : isActive ? (
                      <CircleDot className="w-5 h-5 animate-[spin_4s_linear_infinite]" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className="mt-4 text-center">
                    <p 
                      className={`text-[11px] uppercase tracking-[0.15em] font-bold leading-tight transition-colors duration-300 ${
                        isCompleted ? "text-[#0F172A]" : isActive ? "text-[#5A52FF]" : "text-[#94A3B8]"
                      }`}
                    >
                      {stage}
                    </p>
                    {isActive && (
                      <div className="mt-1.5 flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5A52FF] animate-pulse" />
                        <p className="text-[10px] uppercase tracking-wider text-[#5A52FF] font-semibold">Active</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
