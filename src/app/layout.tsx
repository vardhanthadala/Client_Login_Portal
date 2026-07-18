import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ 
  variable: "--font-sans", 
  subsets: ["latin"], 
  display: "swap" 
});


export const metadata: Metadata = {
  title: "Client Portal",
  description: "Client Login and Management Portal",
};

import { Toaster } from "@/components/ui/sonner";
import SessionGuard from "@/components/SessionGuard";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <script 
          id="theme-script" 
          dangerouslySetInnerHTML={{ __html: `
            try {
              var theme = localStorage.getItem('theme');
              var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              if (theme === 'dark' || (!theme && systemDark)) {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
            } catch (e) {}
          `}}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
