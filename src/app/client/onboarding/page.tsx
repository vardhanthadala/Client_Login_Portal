"use client"

import { toast } from "sonner"
import { useWizardStore } from "@/store/useWizardStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { UploadCloud, CheckCircle2, Briefcase, Image as ImageIcon, Target, FileSignature, Check, Rocket, ArrowRight, Loader2, Sparkles, HelpCircle } from "lucide-react"
import { submitWizardAction } from "@/app/actions/client"
import { motion, AnimatePresence } from "framer-motion"

import { FiLayers } from "react-icons/fi"

type SectionId = "business" | "brand" | "goals" | "sla"

export default function ClientOnboardingWizard() {
  const { businessDetails, slaDetails, updateData } = useWizardStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<SectionId>("business")

  // Validation checks
  const isBusinessComplete = !!(businessDetails?.businessName && businessDetails?.website && businessDetails?.description)
  const isBrandComplete = true // Optional - always marked complete
  const isGoalsComplete = !!(businessDetails?.questionnaire?.audience && businessDetails?.questionnaire?.goals)
  const isSlaComplete = !!(slaDetails?.slaAgreed && slaDetails?.signature)

  const steps = [
    { id: "business", title: "Business Profile", desc: "Company details & website", icon: Briefcase, complete: isBusinessComplete },
    { id: "brand", title: "Brand Assets", desc: "Logos, styleguides & vectors", icon: ImageIcon, complete: isBrandComplete },
    { id: "goals", title: "Marketing Goals", desc: "Audience & requirements", icon: Target, complete: isGoalsComplete },
    { id: "sla", title: "Service Agreement", desc: "Sign the terms & SLA", icon: FileSignature, complete: isSlaComplete }
  ] as const

  const completedCount = [isBusinessComplete, isGoalsComplete, isSlaComplete].filter(Boolean).length
  const progressPercentage = Math.round((completedCount / 3) * 100)
  const allComplete = completedCount === 3

  const validateSection = (section: SectionId): boolean => {
    if (section === "business") {
      if (!businessDetails?.businessName || !businessDetails?.website || !businessDetails?.description) {
        toast.error("Please fill in all the Business Profile fields before proceeding.")
        return false
      }
    }
    if (section === "brand") {
      return true // Optional - no validation
    }
    if (section === "goals") {
      if (!businessDetails?.questionnaire?.audience || !businessDetails?.questionnaire?.goals) {
        toast.error("Please complete the Marketing Questionnaire before proceeding.")
        return false
      }
    }
    return true
  }

  const handleTabChange = (tab: SectionId) => {
    const currentIndex = steps.findIndex(s => s.id === activeTab)
    const targetIndex = steps.findIndex(s => s.id === tab)
    
    if (targetIndex > currentIndex) {
      for (let i = currentIndex; i < targetIndex; i++) {
        if (!validateSection(steps[i].id)) {
          return
        }
      }
    }
    setActiveTab(tab)
  }

  const handleNext = () => {
    if (!validateSection(activeTab)) {
      return
    }
    const currentIndex = steps.findIndex(s => s.id === activeTab)
    if (currentIndex < steps.length - 1) {
      setActiveTab(steps[currentIndex + 1].id)
    }
  }

  const handleSubmit = async () => {
    if (!isBusinessComplete) return toast.error("Please complete your Business Profile first.")
    if (!isGoalsComplete) return toast.error("Please answer the Marketing Questionnaire.")
    if (!isSlaComplete) return toast.error("Please review and sign the Service Level Agreement.")

    setIsSubmitting(true)
    try {
      const result = await submitWizardAction({ 
        businessDetails, 
        questionnaire: businessDetails?.questionnaire, 
        slaDetails 
      })
      if (result?.success) {
        toast.success("Portal activated successfully!")
        window.location.href = "/client/dashboard"
      } else {
        toast.error(result?.error || "Failed to submit onboarding data.")
      }
    } catch (err: any) {
      toast.error("Network error: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        
        {/* Onboarding Header Banner */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#5A52FF]/10 text-[#5A52FF] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Getting Started
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-sans">
            Client Onboarding Questionnaire
          </h1>
          <p className="text-[#64748B] text-sm mt-1 font-medium">
            Please complete your brand profile details and sign the agreement to activate your portal.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
          {/* Left Side: Setup Navigation Panel (Stripe Style) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-[#F3F4F6]">
                <div className="w-9 h-9 bg-gradient-to-tr from-[#5A52FF] to-[#7C3AED] rounded-xl flex items-center justify-center text-white shadow-md shadow-[#5A52FF]/20">
                  <FiLayers className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="font-extrabold text-lg text-[#0F172A] tracking-tight">Client Portal</span>
                  <span className="text-xs text-[#64748B] block font-medium -mt-1">Onboarding Setup</span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-xs font-bold text-[#64748B] tracking-wider mb-1.5">
                  <span>SETUP PROGRESS</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-gradient-to-r from-[#5A52FF] to-[#7C3AED] transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">Get Started</h2>
                <p className="text-sm text-[#64748B] mt-1 font-medium">Complete these sections to customize your brand experience inside your portal.</p>
              </div>

              <div className="space-y-2 flex-1">
                {steps.map((step) => {
                  const Icon = step.icon
                  const isActive = activeTab === step.id
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleTabChange(step.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-2xl text-left transition-all ${
                        isActive 
                          ? "bg-[#5A52FF]/5 border border-[#5A52FF]/20" 
                          : "hover:bg-[#F9FAFB] border border-transparent"
                      }`}
                    >
                      <div className={`mt-0.5 p-2 rounded-xl transition-colors ${
                        isActive 
                          ? "bg-[#5A52FF] text-white" 
                          : "bg-[#F3F4F6] text-[#64748B]"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm leading-none ${isActive ? "text-[#5A52FF]" : "text-[#0F172A]"}`}>
                            {step.title}
                          </span>
                          {step.complete && (
                            <div className="w-4 h-4 bg-[#10B981] rounded-full flex items-center justify-center text-white">
                              <Check className="w-3 h-3 stroke-[3px]" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-[#64748B] mt-1 font-medium">{step.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              {allComplete && (
                <div className="mt-6 pt-6 border-t border-[#F3F4F6]">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-[#5A52FF] hover:bg-[#4F46E5] text-white font-bold text-sm h-12 rounded-2xl transition-all shadow-lg shadow-[#5A52FF]/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Activating...
                      </>
                    ) : (
                      "Activate Portal"
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-[#111827] text-white rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-gray-950/10 min-h-[140px] flex flex-col justify-center">
              <div className="absolute right-[-20%] bottom-[-20%] w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
              <Sparkles className="w-8 h-8 text-[#5A52FF] mb-3 animate-pulse" />
              <h4 className="font-extrabold text-sm tracking-tight">Enterprise Onboarding</h4>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed font-medium">
                Your details will be processed automatically to configure your dedicated dashboard, brand assets gallery, and communication line.
              </p>
            </div>
          </div>

          {/* Right Side: Active Step View Panel */}
          <div className="lg:col-span-8 flex flex-col">
            <Card className="bg-white border border-[#E5E7EB] rounded-3xl shadow-sm overflow-hidden min-h-[500px] flex flex-col flex-1">
            
            <div className="p-8 border-b border-[#F3F4F6]">
              {activeTab === "business" && (
                <div>
                  <span className="text-[#5A52FF] text-xs font-bold uppercase tracking-widest">Section 1 of 4</span>
                  <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mt-1 font-sans">Business Profile</h3>
                  <p className="text-[#64748B] text-sm mt-1">Provide basic information about your company name, website, and industry focus.</p>
                </div>
              )}
              {activeTab === "brand" && (
                <div>
                  <span className="text-[#5A52FF] text-xs font-bold uppercase tracking-widest">Section 2 of 4</span>
                  <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mt-1 font-sans">Brand Assets</h3>
                  <p className="text-[#64748B] text-sm mt-1">Upload brand assets like dark/light logos, design guides, or reference imagery.</p>
                </div>
              )}
              {activeTab === "goals" && (
                <div>
                  <span className="text-[#5A52FF] text-xs font-bold uppercase tracking-widest">Section 3 of 4</span>
                  <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mt-1 font-sans">Marketing Questionnaire</h3>
                  <p className="text-[#64748B] text-sm mt-1">Share your business goals and describe the customers you aim to reach.</p>
                </div>
              )}
              {activeTab === "sla" && (
                <div>
                  <span className="text-[#5A52FF] text-xs font-bold uppercase tracking-widest">Section 4 of 4</span>
                  <h3 className="text-2xl font-extrabold text-[#0F172A] tracking-tight mt-1 font-sans">Service Agreement</h3>
                  <p className="text-[#64748B] text-sm mt-1">Read and sign our digital Service Level Agreement terms to complete authorization.</p>
                </div>
              )}
            </div>

            <div className="flex-1 p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {activeTab === "business" && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-[#475569] font-extrabold">Business Name</Label>
                        <Input 
                          value={businessDetails?.businessName || ""} 
                          onChange={(e) => updateData("businessDetails", { businessName: e.target.value })}
                          placeholder="e.g. Acme Corporation" 
                          className="bg-white border-[#E5E7EB] hover:bg-[#F9FAFB] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#5A52FF]/10 focus-visible:border-[#5A52FF] rounded-xl transition-all shadow-none h-12 px-4 font-medium text-[#0F172A]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-[#475569] font-extrabold">Website</Label>
                        <Input 
                          value={businessDetails?.website || ""} 
                          onChange={(e) => updateData("businessDetails", { website: e.target.value })}
                          placeholder="e.g. https://acme.com" 
                          className="bg-white border-[#E5E7EB] hover:bg-[#F9FAFB] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#5A52FF]/10 focus-visible:border-[#5A52FF] rounded-xl transition-all shadow-none h-12 px-4 font-medium text-[#0F172A]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-[#475569] font-extrabold">Company Description</Label>
                        <Textarea 
                          value={businessDetails?.description || ""} 
                          onChange={(e) => updateData("businessDetails", { description: e.target.value })}
                          placeholder="What does your company do? What is your industry?" 
                          className="bg-white border-[#E5E7EB] hover:bg-[#F9FAFB] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#5A52FF]/10 focus-visible:border-[#5A52FF] rounded-xl transition-all shadow-none min-h-[140px] resize-none px-4 py-3 font-medium text-[#0F172A]"
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "brand" && (
                    <div className="space-y-6">
                      <input 
                        type="file" 
                        id="file-upload" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          
                          try {
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ filename: file.name, contentType: file.type })
                            })
                            const { uploadUrl, fileUrl } = await res.json()
                            
                            await fetch(uploadUrl, {
                              method: "PUT",
                              headers: { "Content-Type": file.type },
                              body: file
                            })
                            
                            const newAssets = [...(businessDetails?.brandAssets || []), { name: file.name, url: fileUrl }]
                            updateData("businessDetails", { brandAssets: newAssets })
                            toast.success(`Successfully uploaded ${file.name}`)
                          } catch (err) {
                            console.error("Upload failed", err)
                            toast.error("Upload failed. Please check AWS keys.")
                          }
                        }} 
                      />
                      <Label htmlFor="file-upload" className="border-2 border-dashed border-[#CBD5E1] rounded-2xl p-10 flex flex-col items-center justify-center text-[#64748B] hover:bg-[#F9FAFB] hover:border-[#5A52FF]/50 hover:text-[#5A52FF] transition-all duration-300 cursor-pointer w-full group">
                        <div className="w-14 h-14 bg-[#F3F4F6] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                          <UploadCloud className="h-7 w-7 text-[#94A3B8] group-hover:text-[#5A52FF] transition-colors" />
                        </div>
                        <p className="font-bold text-[#0F172A] text-base">Drag & drop files or click to browse</p>
                        <p className="text-xs mt-1 text-[#64748B]">PNG, JPG, SVG, vector graphics, or PDF guidelines</p>
                      </Label>
                      
                      {businessDetails?.brandAssets?.length > 0 && (
                        <div className="space-y-2 mt-6">
                          <Label className="text-xs uppercase tracking-widest text-[#475569] font-extrabold block mb-2">Uploaded Brand Assets</Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {businessDetails.brandAssets.map((asset: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl">
                                <span className="text-xs font-bold text-[#0F172A] truncate max-w-[80%]">{asset.name}</span>
                                <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "goals" && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-[#475569] font-extrabold">Who is your target audience?</Label>
                        <Textarea 
                          value={businessDetails?.questionnaire?.audience || ""}
                          onChange={(e) => updateData("businessDetails", { questionnaire: { ...businessDetails?.questionnaire, audience: e.target.value } })}
                          placeholder="Who are your ideal customers? Mention age, location, habits, or industries." 
                          className="bg-white border-[#E5E7EB] hover:bg-[#F9FAFB] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#5A52FF]/10 focus-visible:border-[#5A52FF] rounded-xl transition-all shadow-none min-h-[140px] resize-none px-4 py-3 font-medium text-[#0F172A]" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-[#475569] font-extrabold">What are your primary business goals?</Label>
                        <Textarea 
                          value={businessDetails?.questionnaire?.goals || ""}
                          onChange={(e) => updateData("businessDetails", { questionnaire: { ...businessDetails?.questionnaire, goals: e.target.value } })}
                          placeholder="Describe the main objectives (e.g. brand visibility, click-through-rates, launch awareness)." 
                          className="bg-white border-[#E5E7EB] hover:bg-[#F9FAFB] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#5A52FF]/10 focus-visible:border-[#5A52FF] rounded-xl transition-all shadow-none min-h-[140px] resize-none px-4 py-3 font-medium text-[#0F172A]" 
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "sla" && (
                    <div className="space-y-6">
                      <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl p-6 h-56 overflow-y-auto text-sm text-[#475569] shadow-inner custom-scrollbar">
                        <h4 className="font-extrabold text-[#0F172A] mb-4 text-base tracking-tight font-sans">Service Level Agreement (SLA)</h4>
                        <p className="mb-3"><strong className="text-[#0F172A]">1. Scope of Services:</strong> We will provide marketing and design services as outlined in your plan.</p>
                        <p className="mb-3"><strong className="text-[#0F172A]">2. Communication:</strong> All communications should happen via this portal for tracking purposes.</p>
                        <p className="mb-3"><strong className="text-[#0F172A]">3. Revisions:</strong> Each deliverable includes a specified number of revisions. Additional revisions may incur fees.</p>
                        <p className="mb-3"><strong className="text-[#0F172A]">4. Payment Terms:</strong> Invoices are due upon receipt unless otherwise specified.</p>
                        <p className="mb-4"><strong className="text-[#0F172A]">5. Confidentiality:</strong> Both parties agree to keep sensitive business information confidential.</p>
                        <p className="italic text-[#64748B]">By signing below, you agree to these terms and conditions.</p>
                      </div>
                      
                      <div className="flex items-center space-x-3 pt-2">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            id="sla-agree" 
                            checked={slaDetails?.slaAgreed || false}
                            onChange={(e) => updateData("slaDetails", { slaAgreed: e.target.checked })}
                            className="peer w-5 h-5 appearance-none border-2 border-[#CBD5E1] rounded-md checked:bg-[#5A52FF] checked:border-[#5A52FF] transition-all cursor-pointer focus:ring-4 focus:ring-[#5A52FF]/20 outline-none"
                          />
                          <Check className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3px]" />
                        </div>
                        <Label htmlFor="sla-agree" className="text-sm font-semibold text-[#0F172A] cursor-pointer hover:text-[#5A52FF] transition-colors">
                          I have read and agree to the Service Level Agreement
                        </Label>
                      </div>

                      <div className="space-y-3 pt-6 border-t border-[#F3F4F6] group">
                        <Label className="text-xs uppercase tracking-widest text-[#475569] font-extrabold group-focus-within:text-[#5A52FF] transition-colors">Digital Signature</Label>
                        <Input 
                          value={slaDetails?.signature || ""} 
                          onChange={(e) => updateData("slaDetails", { signature: e.target.value })}
                          placeholder="Type your full legal name to sign" 
                          className="bg-white border-[#E5E7EB] hover:bg-[#F9FAFB] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#5A52FF]/10 focus-visible:border-[#5A52FF] rounded-xl transition-all shadow-none h-12 px-4 text-[#0F172A] font-medium"
                        />
                        <p className="text-xs text-[#94A3B8] font-medium">Typing your name acts as a legally binding digital signature.</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6 bg-[#F9FAFB] border-t border-[#F3F4F6] flex justify-between items-center rounded-b-3xl">
              <span className="text-xs font-bold text-[#64748B]">
                {activeTab === "sla" ? "Final Step" : "Save and proceed to continue"}
              </span>
              
              {activeTab !== "sla" ? (
                <Button 
                  onClick={handleNext}
                  className="bg-[#5A52FF] hover:bg-[#4F46E5] text-white font-bold h-10 px-5 rounded-xl transition-all shadow-sm"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !allComplete}
                  className={`font-bold h-10 px-6 rounded-xl transition-all shadow-md ${
                    allComplete 
                      ? "bg-[#5A52FF] hover:bg-[#4F46E5] text-white shadow-[#5A52FF]/10" 
                      : "bg-[#F3F4F6] text-[#94A3B8] border border-[#E5E7EB] cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> Activating...
                    </>
                  ) : (
                    "Activate Portal"
                  )}
                </Button>
              )}
            </div>

          </Card>
        </div>
      </div>
    </main>
  </div>
  )
}
