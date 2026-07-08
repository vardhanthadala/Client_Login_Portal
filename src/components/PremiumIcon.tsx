import React from "react";
import { cn } from "@/lib/utils";

interface PremiumIconProps {
  icon: React.ElementType;
  className?: string;
  iconClassName?: string;
  size?: number;
  wrapperSize?: string;
}

export function PremiumIcon({ icon: Icon, className, iconClassName, size = 18, wrapperSize = "w-8 h-8 rounded-[10px]" }: PremiumIconProps) {
  return (
    <div className={cn(`flex items-center justify-center bg-[#F8FAFC] dark:bg-[#1A1A1A] border border-[#E2E8F0]/50 dark:border-[#333]/50 shrink-0 shadow-sm transition-all duration-300`, wrapperSize, className)}>
      <Icon 
        size={size} 
        strokeWidth={2.5} 
        className={cn("text-[#0F172A] dark:text-white transition-colors duration-300", iconClassName)} 
      />
    </div>
  );
}
