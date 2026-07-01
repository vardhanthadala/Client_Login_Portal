import type { Metadata } from "next";
import { Inter, Calistoga, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  variable: "--font-sans", 
  subsets: ["latin"], 
  display: "swap" 
});
const calistoga = Calistoga({ 
  variable: "--font-display", 
  subsets: ["latin"], 
  weight: "400", 
  display: "swap" 
});
const jetbrainsMono = JetBrains_Mono({ 
  variable: "--font-mono", 
  subsets: ["latin"], 
  display: "swap" 
});

export const metadata: Metadata = {
  title: "Client Portal",
  description: "Client Login and Management Portal",
};

import { Toaster } from "@/components/ui/sonner";
import SessionGuard from "@/components/SessionGuard";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${calistoga.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <SessionGuard />
        {children}
        <Toaster 
          position="top-center" 
          toastOptions={{
            classNames: {
              error: 'bg-red-50 text-red-900 border border-red-100 shadow-xl rounded-2xl p-4 font-sans font-bold flex items-center gap-2 text-sm',
              success: 'bg-emerald-50 text-emerald-900 border border-emerald-100 shadow-xl rounded-2xl p-4 font-sans font-bold flex items-center gap-2 text-sm',
              warning: 'bg-amber-50 text-amber-900 border border-amber-100 shadow-xl rounded-2xl p-4 font-sans font-bold flex items-center gap-2 text-sm',
              info: 'bg-blue-50 text-blue-900 border border-blue-100 shadow-xl rounded-2xl p-4 font-sans font-bold flex items-center gap-2 text-sm',
            }
          }}
        />
      </body>
    </html>
  );
}
