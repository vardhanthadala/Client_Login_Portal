import React from 'react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-[40px] sm:text-[52px] font-bold text-[#4D4D4D] leading-[1.1] tracking-tight mb-6 font-sans">
          The site is currently<br />down for maintenance
        </h1>
        <p className="text-[#888888] text-[15px] sm:text-[17px] font-normal tracking-wide">
          We apologize for any inconveniences caused.<br />
          We're almost done.
        </p>
      </div>

      {/* Disconnected Plug SVG Graphic */}
      <div className="w-full max-w-4xl flex items-center justify-center overflow-hidden px-4">
        <svg viewBox="0 0 800 200" className="w-full h-auto max-w-[800px]" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left Wire (Light Blue) */}
          <path d="M-100 100 L250 100" stroke="#B3E5FC" strokeWidth="12" strokeLinecap="round" />
          
          {/* Left Wire Bend */}
          <path d="M250 100 L250 125 L320 125" stroke="#00B0FF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Left Plug Base (Dark Blue) */}
          <rect x="320" y="105" width="30" height="40" rx="4" fill="#01579B" />
          
          {/* Left Plug Body (Mid Blue) */}
          <rect x="350" y="90" width="40" height="70" rx="4" fill="#0277BD" />
          
          {/* Left Plug Front (Light Blue) */}
          <rect x="390" y="90" width="30" height="70" rx="4" fill="#29B6F6" />
          
          {/* Left Plug Prongs */}
          <rect x="420" y="105" width="25" height="12" rx="6" fill="#0288D1" />
          <rect x="420" y="133" width="25" height="12" rx="6" fill="#0288D1" />
          
          {/* Sparkles/Particles between plug */}
          <circle cx="460" cy="80" r="4" fill="#00B0FF" className="animate-pulse" />
          <circle cx="475" cy="150" r="6" fill="#4CAF50" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
          <circle cx="485" cy="95" r="3" fill="#00B0FF" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
          <circle cx="455" cy="130" r="5" fill="#4CAF50" className="animate-pulse" style={{ animationDelay: '0.1s' }} />
          
          {/* Right Socket Front (Light Green) */}
          <path d="M520 90 L520 160 L540 160 C545 160 550 155 550 150 L550 100 C550 95 545 90 540 90 Z" fill="#00E676" />
          
          {/* Right Socket Body (Mid Green) */}
          <rect x="550" y="85" width="40" height="80" rx="4" fill="#00C853" />
          
          {/* Right Socket Base (Dark Green) */}
          <rect x="590" y="100" width="25" height="50" rx="4" fill="#1B5E20" />
          
          {/* Right Wire Bend */}
          <path d="M615 125 L680 125 L680 95 L900 95" stroke="#00E676" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}
