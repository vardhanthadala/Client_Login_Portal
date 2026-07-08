"use client"

import Link from "next/link"
import { RiArrowGoBackFill } from "react-icons/ri"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Key, ShieldCheck } from "lucide-react"
import { PremiumIcon } from "@/components/PremiumIcon"

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasSecret, setHasSecret] = useState(false)
  const [hasAwsSecret, setHasAwsSecret] = useState(false)
  
  const [keys, setKeys] = useState({
    razorpayKeyId: "",
    razorpayKeySecret: "",
    awsAccessKeyId: "",
    awsSecretAccessKey: "",
    awsRegion: "",
    awsS3BucketName: ""
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      if (res.ok) {
        setKeys(prev => ({ 
          ...prev, 
          razorpayKeyId: data.razorpayKeyId || "",
          awsAccessKeyId: data.awsAccessKeyId || "",
          awsRegion: data.awsRegion || "",
          awsS3BucketName: data.awsS3BucketName || ""
        }))
        setHasSecret(data.hasRazorpaySecret)
        setHasAwsSecret(data.hasAwsSecret)
      } else {
        toast.error("Failed to load settings")
      }
    } catch (error) {
      toast.error("An error occurred loading settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(keys)
      })
      const data = await res.json()
      
      if (res.ok) {
        toast.success("Settings saved securely")
        if (keys.razorpayKeySecret) {
          setHasSecret(true)
          setKeys(prev => ({ ...prev, razorpayKeySecret: "" })) // clear from input
        }
        if (keys.awsSecretAccessKey) {
          setHasAwsSecret(true)
          setKeys(prev => ({ ...prev, awsSecretAccessKey: "" })) // clear from input
        }
      } else {
        toast.error(data.error || "Failed to save settings")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 p-8 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 pb-32">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-2">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors -ml-3">
            <RiArrowGoBackFill className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-4xl font-sans font-bold text-[#0F172A] dark:text-white tracking-tight">Portal Settings</h1>
        </div>

        <Card className="bg-[#FFFFFF] dark:bg-[#171A21] border border-[#0F172A]/5 dark:border-white/5 rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)] overflow-hidden">
          <CardHeader className="pb-4 px-8 pt-7 border-b border-[#0F172A]/5 dark:border-white/5">
            <div className="flex items-center gap-3">
              <PremiumIcon icon={Key} />
              <CardTitle className="text-xl font-sans font-bold text-[#0F172A] dark:text-white tracking-tight">Payment Gateway (Razorpay)</CardTitle>
            </div>
            <CardDescription className="text-[14px] text-[#64748B] dark:text-[#94A3B8] pt-2">
              Configure your Razorpay API keys to receive payments directly from your clients. These keys are heavily encrypted at rest using AES-256-GCM encryption.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="razorpayKeyId" className="text-[13px] font-bold text-[#475569] dark:text-[#CBD5E1] uppercase tracking-wider mb-2 block">Razorpay Key ID</Label>
                <Input 
                  id="razorpayKeyId" 
                  value={keys.razorpayKeyId}
                  onChange={(e) => setKeys({ ...keys, razorpayKeyId: e.target.value })}
                  placeholder="rzp_live_xxxxxxxxxxxxxx" 
                  className="h-12 rounded-[14px] border-[#0F172A]/10 dark:border-white/10 bg-[#FAFBFD] dark:bg-[#1C2029] text-[15px] focus-visible:ring-[#22C55E] focus-visible:border-[#22C55E]"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-2">
                  <Label htmlFor="razorpayKeySecret" className="text-[13px] font-bold text-[#475569] dark:text-[#CBD5E1] uppercase tracking-wider m-0">Razorpay Key Secret</Label>
                  {hasSecret && (
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
                      <ShieldCheck className="w-3 h-3" /> Securely configured
                    </span>
                  )}
                </div>
                <Input 
                  id="razorpayKeySecret" 
                  type="password"
                  value={keys.razorpayKeySecret}
                  onChange={(e) => setKeys({ ...keys, razorpayKeySecret: e.target.value })}
                  placeholder={hasSecret ? "•••••••••••••••••••••••••••••••• (Leave blank to keep current)" : "Enter secret key to encrypt"} 
                  className="h-12 rounded-[14px] border-[#0F172A]/10 dark:border-white/10 bg-[#FAFBFD] dark:bg-[#1C2029] text-[15px] focus-visible:ring-[#22C55E] focus-visible:border-[#22C55E]"
                />
                <p className="text-[13px] text-[#64748B] dark:text-[#888] mt-2">
                  Your secret is never exposed to the frontend after saving.
                </p>
              </div>
            </CardContent>
            <CardFooter className="px-8 py-5 border-t border-[#F1F5F9] dark:border-[#222] bg-[#F8FAFC]/50 dark:bg-[#1A1A1A]/50 flex justify-end">
              <Button type="submit" className="bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:bg-[#1E293B] dark:hover:bg-[#E2E8F0] font-bold rounded-xl h-11 px-6 shadow-md transition-colors" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Razorpay Config
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="bg-white dark:bg-[#111111] border border-[#E9EDF4] dark:border-[#2A2E35] rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
          <CardHeader className="pb-4 px-8 pt-7 border-b border-[#F1F5F9] dark:border-[#222]">
            <div className="flex items-center gap-3">
              <PremiumIcon icon={ShieldCheck} />
              <CardTitle className="text-xl font-sans font-bold text-[#0F172A] dark:text-white tracking-tight">AWS S3 Storage (BYOS)</CardTitle>
            </div>
            <CardDescription className="text-[14px] text-[#64748B] dark:text-[#94A3B8] pt-2">
              Bring Your Own Storage. Configure your AWS S3 bucket so all client uploads are stored securely in your infrastructure. Secrets are encrypted at rest using AES-256-GCM.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="awsAccessKeyId" className="text-[13px] font-bold text-[#475569] dark:text-[#CBD5E1] uppercase tracking-wider mb-2 block">AWS Access Key ID</Label>
                  <Input 
                    id="awsAccessKeyId" 
                    value={keys.awsAccessKeyId}
                    onChange={(e) => setKeys({ ...keys, awsAccessKeyId: e.target.value })}
                    placeholder="AKIAIOSFODNN7EXAMPLE" 
                    className="h-12 rounded-xl border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[15px] focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="awsSecretAccessKey" className="text-[13px] font-bold text-[#475569] dark:text-[#CBD5E1] uppercase tracking-wider m-0">AWS Secret Access Key</Label>
                    {hasAwsSecret && (
                      <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
                        <ShieldCheck className="w-3 h-3" /> Configured
                      </span>
                    )}
                  </div>
                  <Input 
                    id="awsSecretAccessKey" 
                    type="password"
                    value={keys.awsSecretAccessKey}
                    onChange={(e) => setKeys({ ...keys, awsSecretAccessKey: e.target.value })}
                    placeholder={hasAwsSecret ? "••••••••••••••••••••••••••••••••" : "Enter AWS Secret Key"} 
                    className="h-12 rounded-xl border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[15px] focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="awsRegion" className="text-[13px] font-bold text-[#475569] dark:text-[#CBD5E1] uppercase tracking-wider mb-2 block">AWS Region</Label>
                  <Input 
                    id="awsRegion" 
                    value={keys.awsRegion}
                    onChange={(e) => setKeys({ ...keys, awsRegion: e.target.value })}
                    placeholder="us-east-1" 
                    className="h-12 rounded-xl border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[15px] focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awsS3BucketName" className="text-[13px] font-bold text-[#475569] dark:text-[#CBD5E1] uppercase tracking-wider mb-2 block">S3 Bucket Name</Label>
                  <Input 
                    id="awsS3BucketName" 
                    value={keys.awsS3BucketName}
                    onChange={(e) => setKeys({ ...keys, awsS3BucketName: e.target.value })}
                    placeholder="my-agency-uploads" 
                    className="h-12 rounded-xl border-[#E2E8F0] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1A1A1A] text-[15px] focus-visible:ring-emerald-500 focus-visible:border-emerald-500"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-8 py-5 border-t border-[#F1F5F9] dark:border-[#222] bg-[#F8FAFC]/50 dark:bg-[#1A1A1A]/50 flex justify-end">
              <Button type="submit" className="bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:bg-[#1E293B] dark:hover:bg-[#E2E8F0] font-bold rounded-xl h-11 px-6 shadow-md transition-colors" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save AWS Config
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
