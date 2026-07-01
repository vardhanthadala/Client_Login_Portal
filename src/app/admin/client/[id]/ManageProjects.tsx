"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createProjectAction, updateProjectStageAction, deleteProjectAction, generateProjectPhasesAction } from "@/app/actions/projects"
import { Loader2, Plus, ArrowRight, ArrowLeft, Trash2, CheckCircle2 } from "lucide-react"
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
    <Card className="hover:border-primary/50 transition-all duration-200">
      <CardHeader className="flex flex-row items-start justify-between pb-4 border-b border-border/50">
        <div>
          <CardTitle className="text-lg font-sans font-bold">Active Projects</CardTitle>
          <CardDescription>Track deliverable progress for this client.</CardDescription>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Project
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="pt-6">
        {isAdding && (
          <div className="bg-muted/30 p-4 rounded-xl border border-border mb-6 space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block">Project / Service Name</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="e.g. Video Editing, Social Media Management..." 
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-primary text-primary hover:bg-primary/10 whitespace-nowrap"
                  onClick={handleGenerateAiPhases}
                  disabled={!customName || isGeneratingPhases}
                >
                  {isGeneratingPhases ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "✨ Auto-Generate Phases"}
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-xs uppercase tracking-wider mb-2 block">Stages (Comma separated)</Label>
              <Input 
                placeholder="e.g. Concept, Draft, Review, Final" 
                value={customStages}
                onChange={(e) => setCustomStages(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                You can manually type the phases, or use the ✨ Auto-Generate button to let AI create standard phases for your service.
              </p>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setCustomName(""); setCustomStages("") }}>Cancel</Button>
              <Button size="sm" onClick={handleAddProject} disabled={!customName || !customStages || isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Project
              </Button>
            </div>
          </div>
        )}

        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map(project => {
              const stagesArray = Array.isArray(project.stages) ? project.stages : []
              const activeStageName = stagesArray[project.currentStageIdx]
              const isFinished = project.currentStageIdx === stagesArray.length - 1
              
              return (
                <div key={project.id} className="border border-border rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card hover:border-primary/30 transition-colors">
                  <div>
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                      {project.name}
                      {isFinished && <span className="bg-green-100 text-green-700 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Complete</span>}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Current Stage: <strong className="text-primary">{activeStageName}</strong> 
                      <span className="opacity-50 mx-1">|</span> 
                      ({project.currentStageIdx + 1} of {stagesArray.length})
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUpdateStage(project, -1)}
                      disabled={project.currentStageIdx === 0}
                    >
                      <ArrowLeft className="w-3 h-3 mr-1" /> Back
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUpdateStage(project, 1)}
                      disabled={isFinished}
                      className={!isFinished ? "border-primary text-primary hover:bg-primary/10" : ""}
                    >
                      Next <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteClick(project.id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          !isAdding && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No active projects tracked.</p>
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
