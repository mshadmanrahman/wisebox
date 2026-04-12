"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type AssessmentStatus = "red" | "yellow" | "green"

export interface RecommendedService {
  id: number
  name: string
  price: number
  description?: string
}

export interface AssessmentResultCardProps {
  score: number
  status: AssessmentStatus
  summary: string
  gaps: string[]
  recommendedServices?: RecommendedService[]
  className?: string
}

const statusConfig = {
  green: {
    icon: CheckCircle2,
    label: "Excellent",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-500/20",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600",
    badgeBorder: "border-emerald-500/20",
  },
  yellow: {
    icon: AlertTriangle,
    label: "Needs Attention",
    bgColor: "bg-amber-500/10",
    textColor: "text-amber-600",
    borderColor: "border-amber-500/20",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600",
    badgeBorder: "border-amber-500/20",
  },
  red: {
    icon: XCircle,
    label: "Critical Issues",
    bgColor: "bg-destructive/10",
    textColor: "text-destructive",
    borderColor: "border-destructive/20",
    badgeBg: "bg-destructive/10",
    badgeText: "text-destructive",
    badgeBorder: "border-destructive/20",
  },
}

export function AssessmentResultCard({
  score,
  status,
  summary,
  gaps,
  recommendedServices = [],
  className,
}: AssessmentResultCardProps) {
  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none", className)}>
      {/* Header */}
      <div className="space-y-1 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <StatusIcon className={cn("h-6 w-6", config.textColor)} strokeWidth={1.5} />
          Your Property Readiness Score
        </h2>
        <p className="text-sm text-muted-foreground">
          Instant assessment based on your answers
        </p>
      </div>

      <div className="space-y-6">
        {/* Score Badge */}
        <div className="flex items-center justify-center">
          <div
            className={cn(
              "rounded-xl border px-6 py-4 inline-flex flex-col items-center gap-2",
              config.bgColor,
              config.borderColor
            )}
          >
            <div className={cn("text-5xl font-semibold", config.textColor)}>
              {score}
              <span className="text-2xl">/100</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "px-2.5 py-0.5 rounded-full text-xs font-medium",
                config.badgeBg,
                config.badgeText,
                config.badgeBorder
              )}
            >
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <h3 className="text-base font-medium text-foreground">
            What this means
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </div>

        {/* Detected Gaps */}
        <div className="space-y-3">
          <h3 className="text-base font-medium text-foreground">
            Detected gaps
          </h3>
          {gaps.length === 0 ? (
            <div
              className={cn(
                "rounded-xl border p-4 text-center",
                config.bgColor,
                config.borderColor
              )}
            >
              <p className={cn("text-sm font-medium", config.textColor)}>
                No major gaps detected from your current answers!
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {gaps.slice(0, 8).map((gap, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-muted-foreground"
                >
                  <span className="text-destructive mt-0.5">&#8226;</span>
                  <span className="text-sm">{gap}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recommended Services */}
        {recommendedServices.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-medium text-foreground">
              Recommended services
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {recommendedServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-card border border-border rounded-xl p-4 hover:bg-muted transition-all duration-200"
                >
                  <p className="text-sm font-medium text-foreground">
                    {service.name}
                  </p>
                  {service.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {service.description}
                    </p>
                  )}
                  {service.price > 0 && (
                    <p className="text-sm text-primary font-medium mt-2">
                      Paid service
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            asChild
            className="flex-1 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200"
          >
            <Link href="/register">Create account to protect your property</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="flex-1 border border-border text-foreground hover:bg-muted rounded-lg transition-all duration-200"
          >
            <Link href="/register?redirect=/workspace/services">Talk to an expert</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
