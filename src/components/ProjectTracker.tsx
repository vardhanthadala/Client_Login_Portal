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

  return (
    <Card className="border-border shadow-sm mb-4 last:mb-0 hover:border-primary/50 transition-all duration-200">
      <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
        <CardTitle className="text-lg font-bold">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-5 left-4 right-4 h-0.5 bg-muted rounded-full" />
          
          <div className="relative flex justify-between w-full">
            {stages.map((stage: string, idx: number) => {
              const isCompleted = idx < project.currentStageIdx
              const isActive = idx === project.currentStageIdx
              
              return (
                <div key={idx} className="flex flex-col items-center group">
                  {/* Circle Indicator */}
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 transition-colors duration-300 ${
                      isCompleted 
                        ? "bg-primary border-background text-primary-foreground" 
                        : isActive
                          ? "bg-background border-primary text-primary shadow-sm"
                          : "bg-background border-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : isActive ? (
                      <CircleDot className="w-5 h-5 animate-pulse" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <div className="mt-3 text-center w-24">
                    <p 
                      className={`text-[11px] uppercase tracking-[0.1em] font-semibold leading-tight ${
                        isCompleted || isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {stage}
                    </p>
                    {isActive && (
                      <p className="text-[10px] text-primary mt-0.5 font-medium animate-pulse">In Progress</p>
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
