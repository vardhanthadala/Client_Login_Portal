import { prisma } from "@/lib/prisma"
import SetupForm from "./SetupForm"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default async function SetupPage() {
  const adminExists = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  })

  if (adminExists) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md bg-white shadow-sm border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-500 font-bold">Setup Locked</AlertTitle>
          <AlertDescription className="text-gray-600 mt-2">
            An admin account has already been registered for this portal. 
            For security reasons, this setup page is now permanently locked.
          </AlertDescription>
          <div className="mt-6">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Image */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900">
        <Image
          src="/login-bg.png"
          alt="Abstract Background"
          fill
          priority
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Dexze Portal</h2>
          <p className="text-lg text-zinc-300 max-w-md">
            Manage your clients, track progress, and securely share deliverables all in one place.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <SetupForm />
      </div>
    </div>
  )
}
