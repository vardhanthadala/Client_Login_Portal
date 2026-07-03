"use client"

import { motion } from "framer-motion"
import { Users, LayoutDashboard, BrainCircuit, ShieldCheck, Zap, FileText } from "lucide-react"

const features = [
  {
    name: "Client Onboarding Wizards",
    description: "Send beautifully designed, customized onboarding questionnaires to your new clients.",
    icon: FileText,
  },
  {
    name: "AI-Powered Summaries",
    description: "Automatically extract target audience, brand voice, and goals using our Gemini AI integration.",
    icon: BrainCircuit,
  },
  {
    name: "Admin Dashboard",
    description: "Track the onboarding progress of all your clients in one centralized, real-time dashboard.",
    icon: LayoutDashboard,
  },
  {
    name: "Dedicated Client Portals",
    description: "Give your clients a professional portal to upload files, answer questions, and view status.",
    icon: Users,
  },
  {
    name: "Secure & Encrypted",
    description: "Enterprise-grade security with hashed passwords, isolated tenants, and secure sessions.",
    icon: ShieldCheck,
  },
  {
    name: "Instant Provisioning",
    description: "Sign up today and your company workspace is ready in milliseconds. Zero setup required.",
    icon: Zap,
  },
]

export function Features() {
  return (
    <div id="features" className="py-24 bg-white sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-[#5A52FF]">Everything you need</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Streamline your entire company workflow
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Stop chasing clients for passwords and assets. Dexze provides a white-glove onboarding experience that makes your company look incredibly professional.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div 
                key={feature.name} 
                className="flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-indigo-50">
                    <feature.icon className="h-6 w-6 text-[#5A52FF]" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
