"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProjectAction, updateProjectStageAction, deleteProjectAction, generateProjectPhasesAction } from "@/app/actions/projects"
import { Loader2, Plus, ArrowRight, ArrowLeft, Trash2, CheckCircle2, CircleDashed, CircleDot, CheckCircle } from "lucide-react"
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
type Project = {
  id: string
  name: string
  stages: any
  currentStageIdx: number
}

export default function ManageProjects({
  clientProfileId,
  initialProjects
}: {
  clientProfileId: string
  initialProjects: Project[]
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  const [isAdding, setIsAdding] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customStages, setCustomStages] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingPhases, setIsGeneratingPhases] = useState(false)

  const handleGenerateAiPhases = async () => {
    if (!customName) return
    setIsGeneratingPhases(true)
    try {
      const res = await generateProjectPhasesAction(customName)
      if (res.success && res.data) {
        setCustomStages(res.data.join(", "))
      } else {
        toast.error(res.error)
      }
    } catch (e: any) {
      toast.error("Error: " + e.message)
    } finally {
      setIsGeneratingPhases(false)
    }
  }

  const handleAddProject = async () => {
    if (!customName || !customStages) return toast.error("Please fill all fields")
    const name = customName
    const stagesArray = customStages.split(",").map(s => s.trim()).filter(s => s)

    if (stagesArray.length < 2) return toast.error("At least 2 stages are required")

    setIsLoading(true)
    const res = await createProjectAction(clientProfileId, name, stagesArray)
    if (res.success && res.data) {
      setProjects([...projects, res.data as any])
      setIsAdding(false)
      setCustomName("")
      setCustomStages("")
    } else {
      toast.error(res.error)
    }
    setIsLoading(false)
  }

  const handleUpdateStage = async (project: Project, direction: 1 | -1) => {
    const stagesArray = Array.isArray(project.stages) ? project.stages : []
    const newIdx = project.currentStageIdx + direction
    if (newIdx < 0 || newIdx >= stagesArray.length) return

    // Optimistic update
    setProjects(projects.map(p => p.id === project.id ? { ...p, currentStageIdx: newIdx } : p))

    const res = await updateProjectStageAction(project.id, newIdx, clientProfileId)
    if (!res.success) {
      toast.error(res.error)
      // Revert on error
      setProjects(projects.map(p => p.id === project.id ? { ...p, currentStageIdx: project.currentStageIdx } : p))
    }
  }

  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null)
  const isDeleting = deleteProjectId !== null

  const confirmDelete = async () => {
    if (!deleteProjectId) return
    const idToDelete = deleteProjectId
    setProjects(projects.filter(p => p.id !== idToDelete))
    const res = await deleteProjectAction(idToDelete, clientProfileId)
    if (!res?.success) {
      toast.error("Failed to delete project")
    } else {
      toast.success("Project deleted")
    }
    setDeleteProjectId(null)
  }

  const handleDeleteClick = (projectId: string) => {
    setDeleteProjectId(projectId)
  }

  return (
    <Card className="bg-[#F8FAFC] dark:bg-[#0F0F0F] border border-[#E2E8F0] dark:border-[#222] rounded-[24px] shadow-none overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5 border-b border-[#E2E8F0] dark:border-[#222] gap-4 sm:gap-0 bg-[#F8FAFC] dark:bg-[#0F0F0F]">
        <div className="w-full sm:w-auto">
          <CardTitle className="text-[16px] font-medium text-[#334155] dark:text-[#E2E8F0] tracking-tight flex items-center gap-2">
            Active Projects
          </CardTitle>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" variant="outline" className="gap-2 h-9 w-full sm:w-auto shrink-0 bg-white dark:bg-[#1A1A1A] text-[#475569] dark:text-[#E2E8F0] border-[#E2E8F0] dark:border-[#333] hover:bg-slate-50 dark:hover:bg-[#222] transition-colors rounded-xl shadow-sm text-[13px] font-medium">
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        )}
      </CardHeader>

      <CardContent className="px-6 py-6">
        {isAdding && (
          <div className="bg-white dark:bg-[#1A1A1A] p-6 rounded-2xl border border-[#E2E8F0] dark:border-[#333] mb-6 shadow-sm space-y-5">
            <div>
              <Label className="text-[12px] font-medium text-[#475569] dark:text-[#94A3B8] mb-2 block">Project / Service Name</Label>
              <div className="flex gap-3">
                <Input
                  placeholder="e.g. Video Editing, Social Media Management..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="bg-white dark:bg-[#111] border-[#E2E8F0] dark:border-[#333] focus-visible:ring-indigo-500 rounded-xl"
                />
                <Button
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all duration-300 rounded-xl whitespace-nowrap h-10 px-4 text-[13px] font-medium"
                  onClick={handleGenerateAiPhases}
                  disabled={!customName || isGeneratingPhases}
                >
                  {isGeneratingPhases ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Auto-Generate Phases"}
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-[12px] font-medium text-[#475569] dark:text-[#94A3B8] mb-2 block">Stages (Comma separated)</Label>
              <Input
                placeholder="e.g. Concept, Draft, Review, Final"
                value={customStages}
                onChange={(e) => setCustomStages(e.target.value)}
                className="bg-white dark:bg-[#111] border-[#E2E8F0] dark:border-[#333] focus-visible:ring-indigo-500 rounded-xl"
              />
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button variant="ghost" size="sm" className="rounded-xl font-medium text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] dark:hover:text-white dark:hover:bg-[#222]" onClick={() => { setIsAdding(false); setCustomName(""); setCustomStages("") }}>Cancel</Button>
              <Button size="sm" className="rounded-xl font-medium bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black shadow-sm" onClick={handleAddProject} disabled={!customName || !customStages || isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Project
              </Button>
            </div>
          </div>
        )}

        {projects.length > 0 ? (
          <div className="flex flex-col gap-3">
            {projects.map((project, idx) => {
              const stagesArray = Array.isArray(project.stages) ? project.stages : []
              const activeStageName = stagesArray[project.currentStageIdx]
              const isFinished = project.currentStageIdx === stagesArray.length - 1
              const isStarted = project.currentStageIdx === 0

              return (
                <div key={project.id} className="group/row flex items-center justify-between py-3.5 px-5 rounded-[16px] bg-white dark:bg-[#1A1A1A] border border-[#E2E8F0] dark:border-[#333] shadow-[0_2px_8px_rgba(0,0,0,0.02)] dark:shadow-none hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-[#222]">
                      {isFinished ? (
                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                      ) : isStarted ? (
                        <CircleDashed className="w-4 h-4 text-[#94A3B8] dark:text-[#64748B]" />
                      ) : (
                        <CircleDot className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                      <h4 className="font-medium text-[#334155] dark:text-[#E2E8F0] text-[14.5px] break-words">
                        {project.name}
                      </h4>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100/80 dark:bg-[#222] font-mono text-[10px] tracking-wider uppercase text-[#64748B] dark:text-[#94A3B8] truncate">
                        {activeStageName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0 transition-opacity">
                    <span className="font-mono text-[11px] text-[#94A3B8] dark:text-[#64748B] w-10 text-right">
                      {project.currentStageIdx + 1}/{stagesArray.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-[#94A3B8] dark:text-[#64748B] hover:text-[#334155] bg-transparent hover:bg-slate-100 dark:hover:text-white dark:hover:bg-[#222] rounded-lg"
                        onClick={() => handleUpdateStage(project, -1)}
                        disabled={project.currentStageIdx === 0}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-lg ${!isFinished ? 'text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30' : 'text-[#94A3B8] dark:text-[#64748B] hover:text-[#334155] bg-transparent hover:bg-slate-100 dark:hover:text-white dark:hover:bg-[#222]'}`}
                        onClick={() => handleUpdateStage(project, 1)}
                        disabled={isFinished}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <div className="w-px h-5 bg-[#E2E8F0] dark:bg-[#333] mx-1"></div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteClick(project.id)}
                        className="h-8 w-8 text-[#EF4444] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          !isAdding && (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center justify-center">
              <CircleDashed className="w-8 h-8 text-[#CBD5E1] dark:text-[#333] mb-3" />
              <p className="text-[13px] text-[#64748B]">No active projects.</p>
            </div>
          )
        )}
      </CardContent>
      <AlertDialog open={deleteProjectId !== null} onOpenChange={(open) => !open && setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this project? This action cannot be undone.
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
