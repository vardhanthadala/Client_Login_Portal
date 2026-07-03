"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2, Key, ShieldCheck } from "lucide-react"

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
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#5A52FF]" />
              <CardTitle>Payment Gateway (Razorpay)</CardTitle>
            </div>
            <CardDescription>
              Configure your Razorpay API keys to receive payments directly from your clients. These keys are heavily encrypted at rest using AES-256-GCM encryption.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="razorpayKeyId">Razorpay Key ID</Label>
                <Input 
                  id="razorpayKeyId" 
                  value={keys.razorpayKeyId}
                  onChange={(e) => setKeys({ ...keys, razorpayKeyId: e.target.value })}
                  placeholder="rzp_live_xxxxxxxxxxxxxx" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="razorpayKeySecret">Razorpay Key Secret</Label>
                  {hasSecret && (
                    <span className="text-xs text-green-600 flex items-center gap-1 font-medium bg-green-50 px-2 py-0.5 rounded-full">
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
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your secret is never exposed to the frontend after saving.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="bg-[#5A52FF] hover:bg-blue-700" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Razorpay Config
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <CardTitle>AWS S3 Storage (BYOS)</CardTitle>
            </div>
            <CardDescription>
              Bring Your Own Storage. Configure your AWS S3 bucket so all client uploads are stored securely in your infrastructure. Secrets are encrypted at rest using AES-256-GCM.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="awsAccessKeyId">AWS Access Key ID</Label>
                  <Input 
                    id="awsAccessKeyId" 
                    value={keys.awsAccessKeyId}
                    onChange={(e) => setKeys({ ...keys, awsAccessKeyId: e.target.value })}
                    placeholder="AKIAIOSFODNN7EXAMPLE" 
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="awsSecretAccessKey">AWS Secret Access Key</Label>
                    {hasAwsSecret && (
                      <span className="text-xs text-green-600 flex items-center gap-1 font-medium bg-green-50 px-2 py-0.5 rounded-full">
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
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="awsRegion">AWS Region</Label>
                  <Input 
                    id="awsRegion" 
                    value={keys.awsRegion}
                    onChange={(e) => setKeys({ ...keys, awsRegion: e.target.value })}
                    placeholder="us-east-1" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="awsS3BucketName">S3 Bucket Name</Label>
                  <Input 
                    id="awsS3BucketName" 
                    value={keys.awsS3BucketName}
                    onChange={(e) => setKeys({ ...keys, awsS3BucketName: e.target.value })}
                    placeholder="my-agency-uploads" 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={saving}>
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
