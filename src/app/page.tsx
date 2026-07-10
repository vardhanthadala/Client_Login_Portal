import { Navbar } from "@/components/marketing/Navbar"
import { Hero } from "@/components/marketing/Hero"
import { Bands } from "@/components/marketing/Bands"
import { BeforeAfter } from "@/components/marketing/BeforeAfter"
import { AgencyFeatures } from "@/components/marketing/AgencyFeatures"
import { ClientFeatures } from "@/components/marketing/ClientFeatures"
import { LogoMarquee } from "@/components/marketing/LogoMarquee"
import { Pricing } from "@/components/marketing/Pricing"
import { FAQ } from "@/components/marketing/FAQ"
import { FooterCTA } from "@/components/marketing/FooterCTA"


export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <main>
        <Hero />
        <BeforeAfter />
        <Bands />
        
        <div id="features" className="max-w-[1300px] 2xl:max-w-[1700px] min-[2000px]:max-w-[2100px] mx-auto px-4 sm:px-6 lg:px-8 my-16 sm:my-24">
          <div className="rounded-[32px] border border-black overflow-hidden bg-white">
            <AgencyFeatures />
            <ClientFeatures />
          </div>
        </div>

        <LogoMarquee />
        <Pricing />
        <FAQ />
        <FooterCTA />
      </main>
      
      {/* Footer Wrapper */}
      <div className="bg-[#FAFAFA] px-4 sm:px-6 lg:px-8">
        <footer className="max-w-[1400px] 2xl:max-w-[1800px] min-[2000px]:max-w-[2200px] mx-auto bg-[#111111] pt-12 sm:pt-16 pb-0 relative overflow-hidden shadow-2xl rounded-t-[20px] sm:rounded-t-[32px]">
          <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-12">
            
            {/* Top Section */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
              
              {/* Left Column (Brand & Contact) */}
              <div className="flex flex-col gap-8">
                {/* Social Icons */}
                <div className="flex gap-4">
                  <a href="#" className="w-[42px] h-[42px] rounded-full border-[1.5px] border-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:border-white transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                  <a href="#" className="w-[42px] h-[42px] rounded-full border-[1.5px] border-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:border-white transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                  <a href="#" className="w-[42px] h-[42px] rounded-full border-[1.5px] border-gray-700 flex items-center justify-center text-gray-300 hover:text-white hover:border-white transition-colors">
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                  </a>
                </div>
                
                {/* Contact Info */}
                <div className="text-gray-300 space-y-4 text-[14px] font-medium tracking-wide mt-2">
                  <p>Hyderabad, Telangana<br/>India</p>
                  <p>hello@dexze.com</p>
                  <p>+91 8886669630</p>
                </div>
              </div>
  
              {/* Right Column (Links Grid) */}
              <div className="grid grid-cols-3 gap-10 sm:gap-20 text-[14px]">
                <div className="flex flex-col gap-4">
                  <h4 className="text-gray-400 mb-1 uppercase tracking-widest text-[11px] font-medium">MENU</h4>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">About</a>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">Industries</a>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">Product</a>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">Categories</a>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-gray-400 mb-1 uppercase tracking-widest text-[11px] font-medium">PRODUCTS</h4>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">Portals</a>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">Dashboard</a>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">White-label</a>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">API</a>
                </div>
                <div className="flex flex-col gap-4">
                  <h4 className="text-gray-400 mb-1 uppercase tracking-widest text-[11px] font-medium">LEGAL</h4>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">Blog</a>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">Contact</a>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">Terms</a>
                  <a href="#" className="text-gray-200 hover:text-white transition-colors font-medium">Tutorials</a>
                </div>
              </div>
            </div>
  
            {/* Divider with overlapping button */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-end">
                <a href="#pricing" className="bg-white text-black px-8 py-2.5 rounded-full text-[13px] font-semibold hover:bg-black hover:text-white border border-transparent hover:border-white transition-all mr-0 md:mr-12">
                  Get Started
                </a>
              </div>
            </div>
  
            {/* Bottom Info Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-[12px] text-gray-400 mb-10 px-1">
              <p className="max-w-[360px] leading-relaxed">
                From branding to digital marketing. Our expert team is here to elevate your brand and connect you with your audience
              </p>
              <div className="flex flex-wrap gap-8 uppercase tracking-widest font-medium text-[10px]">
                <a href="#" className="hover:text-white transition-colors">TERMS & CONDITIONS</a>
                <a href="#" className="hover:text-white transition-colors">PRIVACY POLICY</a>
              </div>
            </div>
  
          </div>
  
          {/* Massive Typography - Scaled down for boxed format */}
          <div className="w-full overflow-hidden select-none relative mt-4">
            <h1 className="text-[clamp(3.5rem,14vw,20rem)] font-bold text-[#2A2A2A] whitespace-nowrap leading-[0.75] tracking-tighter text-center ml-[-2%] mr-[-2%]">
              dexze.-dexze
            </h1>
          </div>
        </footer>
      </div>
    </div>
  )
}
