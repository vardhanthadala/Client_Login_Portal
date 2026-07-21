"use client"

import { useActionState, useState, useEffect } from "react"
import { loginAction } from "@/app/actions/auth"
import { Loader2, Fingerprint } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function ClientLoginPage() {
  // Login State
  const [loginState, loginActionDispatch, isLoginPending] = useActionState(loginAction, undefined)

  useEffect(() => {
    if (loginState?.success) {
      window.location.href = "/client-login" // Redirect to self for middleware to handle
    }
  }, [loginState])

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center font-sans bg-white px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative h-14 w-48">
            <Image 
              src="/images/logo.png" 
              alt="Dexze" 
              fill 
              className="object-contain" 
            />
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign in to Dexze
          </h1>
        </div>

        {/* Form */}
        <form action={loginActionDispatch} className="flex flex-col gap-5">
          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="relative flex items-center h-11 bg-gray-50/50 rounded-lg border border-gray-200 focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
              <span className="absolute left-3 text-gray-400 text-sm font-medium">@</span>
              <input 
                id="email" 
                name="email"
                type="email" 
                placeholder="Enter email to get started" 
                required 
                className="bg-transparent border-none text-gray-900 text-sm font-medium outline-none w-full pl-9 pr-4 placeholder:text-gray-400 placeholder:font-normal h-full"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
            </div>
            <div className="relative flex items-center h-11 bg-gray-50/50 rounded-lg border border-gray-200 focus-within:border-gray-300 focus-within:ring-1 focus-within:ring-gray-300 transition-all">
              <Fingerprint size={16} className="absolute left-3 text-gray-400" />
              <input 
                id="password" 
                name="password"
                type="password"
                placeholder="Enter your password" 
                required 
                className="bg-transparent border-none text-gray-900 text-sm font-medium outline-none w-full pl-9 pr-4 placeholder:text-gray-400 placeholder:font-normal h-full"
              />
            </div>
          </div>

          {loginState?.error && (
            <p className="text-sm font-medium text-red-600">{loginState.error}</p>
          )}

          <button 
            type="submit" 
            disabled={isLoginPending}
            className="mt-2 h-11 w-full bg-[#111827] hover:bg-[#1f2937] text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
          >
            {isLoginPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log in"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 font-medium underline underline-offset-4">
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
