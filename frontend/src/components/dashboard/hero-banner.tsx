"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  autoRotate = true,
  rotationInterval = 30000,
  className,
}: DashboardHeroBannerProps) {
  const [activeSlide, setActiveSlide] = React.useState(0)

  React.useEffect(() => {
    if (!autoRotate || slides.length < 2) {
      return
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length)
    }, rotationInterval)

    return () => window.clearInterval(interval)
  }, [slides.length, autoRotate, rotationInterval])

  React.useEffect(() => {
    if (activeSlide > Math.max(0, slides.length - 1)) {
      setActiveSlide(0)
    }
  }, [activeSlide, slides.length])

  const { t } = useTranslation(['dashboard', 'common'])
  const currentSlide = slides[activeSlide] ?? null
  const heroCtaHref = resolveHeroCtaHref(currentSlide?.cta_url, '/properties/new')

  return (
    <Card className={cn("border-wisebox-primary-100 overflow-hidden", className)}>
      <CardContent className="p-0">
        <div
          className="bg-gradient-to-r from-wisebox-primary-700 via-wisebox-primary-600 to-wisebox-primary-500 text-white p-8 sm:p-10 min-h-[220px] flex flex-col justify-between"
          style={
            currentSlide?.background_color
              ? { background: currentSlide.background_color }
              : undefined
          }
        >
          <div className="flex items-center gap-8">
            {/* Left: text content */}
            <div className="flex-1 space-y-3">
              <p className="text-white/80 text-sm uppercase tracking-[0.08em]">
                {t('dashboard:heroBanner.label')}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {currentSlide?.title ?? t('dashboard:heroBanner.defaultTitle')}
              </h1>
              {currentSlide?.subtitle && (
                <p className="text-white/90 text-sm sm:text-base">
                  {currentSlide.subtitle}
                </p>
              )}
              <div className="pt-5 flex flex-wrap items-center gap-3">
                <Button asChild className="bg-white text-wisebox-primary-700 hover:bg-white/90">
                  <Link href={heroCtaHref}>
                    {currentSlide?.cta_text || t('dashboard:addNewProperty')}
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/assessment/start">{t('dashboard:getFreeAssessment')}</Link>
                </Button>
              </div>
            </div>

            {/* Right: optional image */}
            {currentSlide?.image_path && (
              <div className="hidden md:block flex-shrink-0 w-[200px] h-[180px] relative">
                <Image
                  src={currentSlide.image_path}
                  alt={currentSlide.image_alt ?? currentSlide.title ?? ""}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          {/* Slide indicators */}
          {slides.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    index === activeSlide
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/60"
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
