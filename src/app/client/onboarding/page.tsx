"use client"

import { toast } from "sonner"
import { useWizardStore } from "@/store/useWizardStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { UploadCloud } from "lucide-react"
import { submitWizardAction } from "@/app/actions/client"

export default function ClientOnboardingWizard() {
  const { step, nextStep, prevStep, businessDetails, slaDetails, updateData } = useWizardStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => {
    if (step === 2) {
      if (!businessDetails?.businessName || !businessDetails?.website || !businessDetails?.description) {
        return toast.error("Please fill in all the required fields (Business Name, Website, and Description) before continuing.")
      }
    }

    if (step === 4) {
      if (!businessDetails?.questionnaire?.audience || !businessDetails?.questionnaire?.goals) {
        return toast.error("Please answer both questions in the questionnaire before continuing.")
      }
    }

    if (step === 5) {
      if (!slaDetails?.slaAgreed || !slaDetails?.signature) {
        return toast.error("Please agree to the Service Level Agreement and provide your digital signature.")
      }
    }

    if (step < 6) {
      nextStep()
    } else {
      submitWizard()
    }
  }

  const submitWizard = async () => {
    setIsSubmitting(true)
    try {
      const result = await submitWizardAction({ businessDetails, questionnaire: businessDetails?.questionnaire, slaDetails })
      if (result?.success) {
        window.location.href = "/client/dashboard"
      } else {
        toast.error("Error: " + (result?.error || "Unknown error occurred."))
      }
    } catch (err: any) {
      toast.error("Network or Server Error: " + err.message)
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CardHeader className="pt-8">
              <CardTitle className="text-3xl font-bold tracking-[-0.02em] text-foreground">Welcome to Dexze!</CardTitle>
              <CardDescription className="text-base mt-2">Let's set up your brand. Estimated time: 10-15 minutes.</CardDescription>
            </CardHeader>
          </motion.div>
        )
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl font-bold tracking-[-0.02em] text-foreground">Business Details</CardTitle>
              <CardDescription>Tell us a bit about your company.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-semibold">Business Name</Label>
                <Input 
                  value={businessDetails?.businessName || ""} 
                  onChange={(e) => updateData("businessDetails", { businessName: e.target.value })}
                  placeholder="Acme Corp" 
                  className="bg-muted/50 border-border h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-semibold">Website</Label>
                <Input 
                  value={businessDetails?.website || ""} 
                  onChange={(e) => updateData("businessDetails", { website: e.target.value })}
                  placeholder="https://acmecorp.com" 
                  className="bg-muted/50 border-border h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-semibold">Company Description</Label>
                <Textarea 
                  value={businessDetails?.description || ""} 
                  onChange={(e) => updateData("businessDetails", { description: e.target.value })}
                  placeholder="What does your company do?" 
                  className="bg-muted/50 border-border min-h-[100px] resize-none"
                />
              </div>
            </CardContent>
          </motion.div>
        )
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl font-bold tracking-[-0.02em] text-foreground">Brand Identity</CardTitle>
              <CardDescription>Upload your brand assets (Logos, Guidelines).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
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
                  } catch (err) {
                    console.error("Upload failed", err)
                    toast.error("Upload failed. Please check AWS keys.")
                  }
                }} 
              />
              <Label htmlFor="file-upload" className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-primary/50 hover:text-primary transition-all duration-200 cursor-pointer w-full">
                <UploadCloud className="h-10 w-10 mb-3" />
                <p className="font-medium text-sm">Click to browse and upload assets</p>
                <p className="text-xs mt-1 text-muted-foreground">Supports PNG, JPG, SVG, PDF</p>
              </Label>
              {businessDetails?.brandAssets?.length > 0 && (
                <div className="space-y-2 mt-6 p-4 bg-muted/30 rounded-xl border border-border">
                  <h4 className="text-xs uppercase tracking-[0.12em] font-semibold text-muted-foreground">Uploaded Assets</h4>
                  <ul className="text-sm list-none space-y-2">
                    {businessDetails.brandAssets.map((asset: any, idx: number) => (
                      <li key={idx} className="flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
                        <a href={asset.url} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium">
                          {asset.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </motion.div>
        )
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl font-bold tracking-[-0.02em] text-foreground">Marketing Questionnaire</CardTitle>
              <CardDescription>Help us understand your goals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-semibold">Who is your target audience?</Label>
                <Textarea 
                  value={businessDetails?.questionnaire?.audience || ""}
                  onChange={(e) => updateData("businessDetails", { questionnaire: { ...businessDetails?.questionnaire, audience: e.target.value } })}
                  placeholder="Describe your ideal customer" 
                  className="bg-muted/50 border-border min-h-[100px] resize-none" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-semibold">What are your primary business goals?</Label>
                <Textarea 
                  value={businessDetails?.questionnaire?.goals || ""}
                  onChange={(e) => updateData("businessDetails", { questionnaire: { ...businessDetails?.questionnaire, goals: e.target.value } })}
                  placeholder="e.g., Increase sales, brand awareness" 
                  className="bg-muted/50 border-border min-h-[100px] resize-none" 
                />
              </div>
            </CardContent>
          </motion.div>
        )
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl font-bold tracking-[-0.02em] text-foreground">Contracts & SLA</CardTitle>
              <CardDescription>Please review and agree to our Service Level Agreement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="bg-muted/30 border border-border rounded-xl p-4 h-48 overflow-y-auto text-sm text-muted-foreground">
                <h4 className="font-bold text-foreground mb-2">Service Level Agreement (SLA)</h4>
                <p className="mb-2">1. Scope of Services. We will provide marketing and design services as outlined in your plan.</p>
                <p className="mb-2">2. Communication. All communications should happen via this portal for tracking purposes.</p>
                <p className="mb-2">3. Revisions. Each deliverable includes a specified number of revisions. Additional revisions may incur fees.</p>
                <p className="mb-2">4. Payment Terms. Invoices are due upon receipt unless otherwise specified.</p>
                <p className="mb-2">5. Confidentiality. Both parties agree to keep sensitive business information confidential.</p>
                <p>By signing below, you agree to these terms and conditions.</p>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="sla-agree" 
                  checked={slaDetails?.slaAgreed || false}
                  onChange={(e) => updateData("slaDetails", { slaAgreed: e.target.checked })}
                  className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                />
                <Label htmlFor="sla-agree" className="text-sm font-medium leading-none cursor-pointer">
                  I have read and agree to the Service Level Agreement
                </Label>
              </div>

              <div className="space-y-2 pt-4 border-t border-border/50">
                <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-semibold">Digital Signature</Label>
                <Input 
                  value={slaDetails?.signature || ""} 
                  onChange={(e) => updateData("slaDetails", { signature: e.target.value })}
                  placeholder="Type your full name to sign" 
                  className="bg-muted/50 border-border h-11"
                />
                <p className="text-xs text-muted-foreground">Typing your name acts as a legally binding digital signature.</p>
              </div>
            </CardContent>
          </motion.div>
        )
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <CardHeader className="pt-8">
              <CardTitle className="text-3xl font-bold tracking-[-0.02em] text-foreground">Review & Submit</CardTitle>
              <CardDescription className="text-base mt-2">Almost done! Please review your information.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-foreground text-center font-medium">Everything looks great. Click submit to finalize your onboarding and enter your portal.</p>
              </div>
            </CardContent>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8 flex justify-between items-center px-2 gap-2">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="flex flex-col items-center w-full">
              <div className={`h-2 w-full rounded-full transition-all duration-300 ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
            </div>
          ))}
        </div>

        <Card className="overflow-hidden relative min-h-[400px] flex flex-col border-border shadow-xl rounded-2xl">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
          
          <div className="flex-1" />
          
          <CardFooter className="flex justify-between border-t border-border bg-muted/20 p-6">
            {step > 1 ? (
              <Button variant="outline" onClick={prevStep} className="bg-background">
                Back
              </Button>
            ) : <div />}
            <Button onClick={handleNext} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : step === 6 ? "Submit" : "Continue"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
