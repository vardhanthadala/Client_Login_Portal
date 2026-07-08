"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

export function FadeInStagger({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.1 }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeInItem({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { 
          opacity: 1, 
          y: 0, 
          transition: { type: "spring", stiffness: 300, damping: 24 } 
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
