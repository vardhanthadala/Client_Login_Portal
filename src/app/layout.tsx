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
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
