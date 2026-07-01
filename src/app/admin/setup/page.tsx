import { prisma } from "@/lib/prisma"
import SetupForm from "./SetupForm"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function SetupPage() {
  const adminExists = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  })

  if (adminExists) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md bg-zinc-900 border-zinc-800 text-zinc-100">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-500 font-bold">Setup Locked</AlertTitle>
          <AlertDescription className="text-zinc-400 mt-2">
            An admin account has already been registered for this portal. 
            For security reasons, this setup page is now permanently locked.
          </AlertDescription>
          <div className="mt-6">
            <Link href="/login">
              <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-zinc-100">
                Return to Login
              </Button>
            </Link>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <SetupForm />
    </div>
  )
}
