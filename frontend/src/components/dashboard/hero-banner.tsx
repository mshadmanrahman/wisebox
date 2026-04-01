"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HeroSlide {
  id: number
  title: string
  subtitle?: string | null
  cta_text?: string | null
  cta_url?: string | null
  background_color?: string | null
  image_path?: string | null
  image_alt?: string | null
  display_order: number
}

export interface DashboardHeroBannerProps {
  slides: HeroSlide[]
  autoRotate?: boolean
  rotationInterval?: number
  className?: string
}

export function DashboardHeroBanner({ className }: DashboardHeroBannerProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-foreground dark:bg-card p-8 sm:p-10", className)}>
      {/* CSS ambient glow orbs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-primary/10 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

      <div className="relative z-10">
        <p className="text-xs font-medium text-white/60 dark:text-muted-foreground uppercase tracking-wider">Wisebox</p>
        <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-white dark:text-foreground">Get Land Related Service Online</h2>
        <p className="mt-1 text-sm text-white/70 dark:text-muted-foreground">Learn more about our services</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/workspace/services"
            className="bg-white text-foreground rounded-full px-5 py-2.5 text-sm font-medium hover:bg-white/90 transition-all"
          >
            Learn More
          </a>
          <a
            href="/assessment/start"
            className="border border-white/30 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-white/10 transition-all dark:border-border dark:text-foreground dark:hover:bg-muted"
          >
            Get Free Assessment
          </a>
        </div>
      </div>
    </div>
  )
}
