import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";

import "./globals.css";

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
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
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import MaintenancePage from "@/app/maintenance/page";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const session = await auth();
  const isSuperAdmin = (session?.user as any)?.role === "SUPER_ADMIN";
  
  let isMaintenanceMode = false;
  try {
    const settings = await prisma.platformSettings.findUnique({ where: { id: "global" }});
    isMaintenanceMode = settings?.isMaintenanceMode || false;
    
    // Check scheduling if manual toggle isn't on
    if (!isMaintenanceMode && settings?.scheduledMaintenanceStart) {
      const now = new Date();
      if (now >= settings.scheduledMaintenanceStart) {
        if (!settings.scheduledMaintenanceEnd || now <= settings.scheduledMaintenanceEnd) {
          isMaintenanceMode = true;
        }
      }
    }
  } catch (e) {
    console.error("Failed to check maintenance mode:", e);
  }

  const showMaintenance = isMaintenanceMode && !isSuperAdmin;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${poppins.variable} h-full antialiased`}
    >
      <head>
        <Script id="theme-script" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: `
          try {
            var theme = localStorage.getItem('theme');
            var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (theme === 'dark' || (!theme && systemDark)) {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          } catch (e) {}
        `}} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">

        <ThemeProvider>
          {!showMaintenance && <SessionGuard />}
          {showMaintenance ? <MaintenancePage /> : children}
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
