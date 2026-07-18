"use client"

import React, { useState, useEffect } from "react"
import { Key, ShieldCheck, CreditCard, Loader2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

export default function AdminPortalSettingsTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasRazorpaySecret, setHasRazorpaySecret] = useState(false)
  const [hasAwsSecret, setHasAwsSecret] = useState(false)
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false)
  const [showAwsSecret, setShowAwsSecret] = useState(false)
  const [keys, setKeys] = useState({
    razorpayKeyId: "",
    razorpayKeySecret: "",
    awsAccessKeyId: "",
    awsSecretAccessKey: "",
    awsRegion: "",
    awsS3BucketName: ""
  })

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async res => {
        if (!res.ok) {
          throw new Error("API returned status " + res.status)
        }
        return res.json()
      })
      .then(data => {
        setKeys(prev => ({
          ...prev,
          razorpayKeyId: data.razorpayKeyId || "",
          awsAccessKeyId: data.awsAccessKeyId || "",
          awsRegion: data.awsRegion || "",
          awsS3BucketName: data.awsS3BucketName || ""
        }))
        setHasRazorpaySecret(data.hasRazorpaySecret)
        setHasAwsSecret(data.hasAwsSecret)
      })
      .catch((err) => console.error("Failed to load settings silently:", err))
      .finally(() => setLoading(false))
  }, [])

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
        toast.success("Portal settings saved securely")
        if (keys.razorpayKeySecret) {
          setHasRazorpaySecret(true)
          setKeys(prev => ({ ...prev, razorpayKeySecret: "" }))
        }
        if (keys.awsSecretAccessKey) {
          setHasAwsSecret(true)
          setKeys(prev => ({ ...prev, awsSecretAccessKey: "" }))
        }
      } else {
        toast.error(data.error || "Failed to save settings")
      }
    } catch {
      toast.error("An error occurred")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 min-w-0">
      {/* Header */}
      <div className="bg-white dark:bg-[#171A21] p-4 sm:p-6 rounded-[20px] sm:rounded-[24px] border border-[#0F172A]/5 dark:border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#3454d1] to-[#6366f1] flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Key className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-normal text-[#0F172A] dark:text-white font-sans tracking-tight mb-0.5 sm:mb-1">Portal Settings</h2>
            <p className="text-[13px] sm:text-[15px] text-[#64748B] dark:text-[#94A3B8] font-normal">Configure your payment gateway and cloud storage credentials securely.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6 font-sans">
        {/* Razorpay Section */}
        <div className="bg-white dark:bg-[#171A21] rounded-[20px] sm:rounded-[24px] border border-[#0F172A]/5 dark:border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-3 sm:pb-4 border-b border-[#F1F5F9] dark:border-white/5">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#3454d1]/10 dark:bg-[#3454d1]/20 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4 text-[#3454d1]" />
              </div>
              <h3 className="text-base sm:text-lg font-normal text-[#0F172A] dark:text-white tracking-tight">Razorpay Payment Gateway</h3>
            </div>
            <p className="text-[12px] sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-normal">Configure your Razorpay API keys to receive payments directly from your clients. Secrets are encrypted at rest using AES-256-GCM.</p>
          </div>
          <div className="p-4 sm:p-8 flex flex-col gap-4 sm:gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Razorpay Key ID</label>
              <input
                type="text"
                value={keys.razorpayKeyId}
                onChange={(e) => setKeys({ ...keys, razorpayKeyId: e.target.value })}
                placeholder="rzp_live_xxxxxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-[#FAFBFD] dark:bg-[#1C2029] text-[15px] text-slate-900 dark:text-white outline-none focus:border-[#3454d1] focus:ring-1 focus:ring-[#3454d1] transition-all font-normal"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Razorpay Key Secret</label>
                {hasRazorpaySecret && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-normal bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                    <ShieldCheck className="w-3 h-3" /> Securely configured
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showRazorpaySecret ? "text" : "password"}
                  value={keys.razorpayKeySecret}
                  onChange={(e) => setKeys({ ...keys, razorpayKeySecret: e.target.value })}
                  placeholder={hasRazorpaySecret ? "•••••••••••••••••••••••••• (Leave blank to keep current)" : "Enter secret key to encrypt"}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-white/10 bg-[#FAFBFD] dark:bg-[#1C2029] text-[15px] text-slate-900 dark:text-white outline-none focus:border-[#3454d1] focus:ring-1 focus:ring-[#3454d1] transition-all font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showRazorpaySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[12px] text-[#94A3B8] dark:text-[#666] font-normal mt-0.5">Your secret is never exposed to the frontend after saving.</p>
            </div>
          </div>
          <div className="px-4 sm:px-8 py-3 sm:py-4 border-t border-[#F1F5F9] dark:border-white/5 bg-[#F8FAFC]/50 dark:bg-[#1A1A1A]/50 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:bg-[#1E293B] dark:hover:bg-[#E2E8F0] text-xs font-normal transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Razorpay Config
            </button>
          </div>
        </div>

        {/* AWS S3 Section */}
        <div className="bg-white dark:bg-[#171A21] rounded-[20px] sm:rounded-[24px] border border-[#0F172A]/5 dark:border-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="px-4 sm:px-8 pt-5 sm:pt-7 pb-3 sm:pb-4 border-b border-[#F1F5F9] dark:border-white/5">
            <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="text-base sm:text-lg font-normal text-[#0F172A] dark:text-white tracking-tight">AWS S3 Storage (BYOS)</h3>
            </div>
            <p className="text-[12px] sm:text-[13px] text-[#64748B] dark:text-[#94A3B8] font-normal">Bring Your Own Storage. Configure your AWS S3 bucket so all client uploads are stored securely in your infrastructure.</p>
          </div>
          <div className="p-4 sm:p-8 flex flex-col gap-4 sm:gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">AWS Access Key ID</label>
                <input
                  type="text"
                  value={keys.awsAccessKeyId}
                  onChange={(e) => setKeys({ ...keys, awsAccessKeyId: e.target.value })}
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-[#FAFBFD] dark:bg-[#1C2029] text-[15px] text-slate-900 dark:text-white outline-none focus:border-[#3454d1] focus:ring-1 focus:ring-[#3454d1] transition-all font-normal"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">AWS Secret Access Key</label>
                  {hasAwsSecret && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-normal bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                      <ShieldCheck className="w-3 h-3" /> Configured
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showAwsSecret ? "text" : "password"}
                    value={keys.awsSecretAccessKey}
                    onChange={(e) => setKeys({ ...keys, awsSecretAccessKey: e.target.value })}
                    placeholder={hasAwsSecret ? "••••••••••••••••••••••••••••••••" : "Enter AWS Secret Key"}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-white/10 bg-[#FAFBFD] dark:bg-[#1C2029] text-[15px] text-slate-900 dark:text-white outline-none focus:border-[#3454d1] focus:ring-1 focus:ring-[#3454d1] transition-all font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAwsSecret(!showAwsSecret)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showAwsSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">AWS Region</label>
                <input
                  type="text"
                  value={keys.awsRegion}
                  onChange={(e) => setKeys({ ...keys, awsRegion: e.target.value })}
                  placeholder="us-east-1"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-[#FAFBFD] dark:bg-[#1C2029] text-[15px] text-slate-900 dark:text-white outline-none focus:border-[#3454d1] focus:ring-1 focus:ring-[#3454d1] transition-all font-normal"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">S3 Bucket Name</label>
                <input
                  type="text"
                  value={keys.awsS3BucketName}
                  onChange={(e) => setKeys({ ...keys, awsS3BucketName: e.target.value })}
                  placeholder="my-agency-uploads"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-[#FAFBFD] dark:bg-[#1C2029] text-[15px] text-slate-900 dark:text-white outline-none focus:border-[#3454d1] focus:ring-1 focus:ring-[#3454d1] transition-all font-normal"
                />
              </div>
            </div>
          </div>
          <div className="px-4 sm:px-8 py-3 sm:py-4 border-t border-[#F1F5F9] dark:border-white/5 bg-[#F8FAFC]/50 dark:bg-[#1A1A1A]/50 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] hover:bg-[#1E293B] dark:hover:bg-[#E2E8F0] text-xs font-normal transition-colors flex items-center gap-2 disabled:opacity-50 shadow-md"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save AWS Config
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
