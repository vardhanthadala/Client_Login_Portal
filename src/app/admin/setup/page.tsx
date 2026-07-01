import { prisma } from "@/lib/prisma"
import SetupForm from "./SetupForm"
import { ShieldCheck, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function SetupPage() {
  const adminExists = await prisma.user.findFirst({
    where: { role: "ADMIN" }
  })

  if (adminExists) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Left Side - Gradient */}
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

        {/* Right Side - Locked Message */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Complete</h2>
            <p className="text-gray-500 text-[15px] leading-relaxed mb-8">
              An admin account has already been configured for this portal. For security, this page is now permanently locked.
            </p>
            <Link href="/login">
              <button className="w-full bg-[#2ea3f2] hover:bg-[#258bce] text-white h-12 rounded-lg text-[15px] font-medium transition-colors flex items-center justify-center gap-2">
                Go to Login
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
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
