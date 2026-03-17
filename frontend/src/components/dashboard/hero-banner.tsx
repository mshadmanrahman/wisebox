"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Rocket } from "lucide-react"
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

function resolveHeroCtaHref(
  rawUrl: string | null | undefined,
  fallback = '/properties/new'
): string {
  const value = rawUrl?.trim()

  if (!value) return fallback
  if (value.startsWith('/')) return value

  // Guard against malformed values like "localhost" or empty host links.
  if (!/^https?:\/\//i.test(value)) return fallback

  try {
    const parsed = new URL(value)
    const localHostnames = new Set(['localhost', '127.0.0.1'])

    if (localHostnames.has(parsed.hostname)) {
      const path = `${parsed.pathname || ''}${parsed.search}${parsed.hash}`
      if (!path || path === '/' || /^\/localhost\/?$/i.test(path)) {
        return fallback
      }

      return path.startsWith('/') ? path : `/${path}`
    }

    return value
  } catch {
    return fallback
  }
}

export function DashboardHeroBanner({
  slides,
  className,
}: DashboardHeroBannerProps) {
  const { t } = useTranslation(['dashboard', 'common'])
  // Use first slide data if available, otherwise show defaults
  const currentSlide = slides[0] ?? null
  const heroCtaHref = resolveHeroCtaHref(currentSlide?.cta_url, '/properties/new')

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none", className)}>
      <div className="space-y-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5">
          <Rocket className="w-3.5 h-3.5" strokeWidth={1.5} />
          {t('dashboard:heroBanner.label')}
        </span>

        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          {currentSlide?.title ?? t('dashboard:heroBanner.defaultTitle')}
        </h2>

        {currentSlide?.subtitle && (
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {currentSlide.subtitle}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href={heroCtaHref}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-all duration-200 inline-flex items-center h-10"
          >
            {currentSlide?.cta_text || t('dashboard:addNewProperty')}
          </Link>
          <Link
            href="/assessment/start"
            className="bg-transparent border border-border text-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-all duration-200 inline-flex items-center h-10"
          >
            {t('dashboard:getFreeAssessment')}
          </Link>
        </div>
      </div>
    </div>
  )
}
