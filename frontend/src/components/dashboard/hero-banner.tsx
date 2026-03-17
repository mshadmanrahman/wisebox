"use client"

import * as React from "react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
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
    <div className={cn("relative rounded-3xl overflow-hidden h-44 sm:h-52 md:h-56 bg-primary/5", className)}>
      {/* Gradient background */}
      <img src="/images/gradients/gradient-24.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      {/* Left-heavy overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent dark:from-black/50 dark:via-black/25 dark:to-transparent" />

      {/* Content - always white text, left-aligned */}
      <div className="relative z-10 flex flex-col justify-center h-full p-6 sm:p-8 max-w-md">
        <p className="text-sm font-medium text-white/70">
          {t('dashboard:heroBanner.label')}
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-white">
          {currentSlide?.title ?? t('dashboard:heroBanner.defaultTitle')}
        </h2>
        {currentSlide?.subtitle && (
          <p className="mt-2 text-sm text-white/60 leading-relaxed line-clamp-2">
            {currentSlide.subtitle}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <Link
            href={heroCtaHref}
            className="bg-white/90 text-gray-900 hover:bg-white rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 inline-flex items-center"
          >
            {currentSlide?.cta_text || t('dashboard:addNewProperty')}
          </Link>
          <Link
            href="/assessment/start"
            className="border border-white/30 text-white hover:bg-white/10 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 inline-flex items-center"
          >
            {t('dashboard:getFreeAssessment')}
          </Link>
        </div>
      </div>
    </div>
  )
}
