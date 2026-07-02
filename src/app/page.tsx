import { Navbar } from "@/components/marketing/Navbar"
import { Hero } from "@/components/marketing/Hero"
import { Features } from "@/components/marketing/Features"
import { Pricing } from "@/components/marketing/Pricing"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
      </main>
      
      <footer className="bg-white py-12 border-t border-gray-100 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-[#5A52FF] rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">D</span>
            </div>
            <span className="font-semibold text-gray-900">Dexze</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Dexze Technologies. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
