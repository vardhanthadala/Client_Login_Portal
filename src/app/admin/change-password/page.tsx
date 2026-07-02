"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { updatePasswordAction } from "@/app/actions/auth"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await updatePasswordAction(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        signOut({ callbackUrl: '/login' })
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Change your password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          For security reasons, you must change your temporary password before accessing the dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center">
              <h3 className="text-xl font-medium text-green-600 mb-2">Password Updated!</h3>
              <p className="text-gray-500 text-sm">Please log in again with your new password. Redirecting...</p>
            </div>
          ) : (
            <form action={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="mt-1">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              <div>
                <Button
                  type="submit"
                  className="w-full flex justify-center bg-[#5A52FF] hover:bg-blue-700 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
