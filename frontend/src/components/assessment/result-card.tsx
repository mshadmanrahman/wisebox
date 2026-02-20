"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    bgColor: "bg-wisebox-status-success/10",
    textColor: "text-wisebox-status-success",
    borderColor: "border-wisebox-status-success/20",
    badgeBg: "bg-wisebox-status-success/10",
    badgeText: "text-wisebox-status-success",
    badgeBorder: "border-wisebox-status-success/20",
  },
  yellow: {
    icon: AlertTriangle,
    label: "Needs Attention",
    bgColor: "bg-wisebox-status-warning/10",
    textColor: "text-wisebox-status-warning",
    borderColor: "border-wisebox-status-warning/20",
    badgeBg: "bg-wisebox-status-warning/10",
    badgeText: "text-wisebox-status-warning",
    badgeBorder: "border-wisebox-status-warning/20",
  },
  red: {
    icon: XCircle,
    label: "Critical Issues",
    bgColor: "bg-wisebox-status-danger/10",
    textColor: "text-wisebox-status-danger",
    borderColor: "border-wisebox-status-danger/20",
    badgeBg: "bg-wisebox-status-danger/10",
    badgeText: "text-wisebox-status-danger",
    badgeBorder: "border-wisebox-status-danger/20",
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
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className={cn("border-b-2", config.borderColor)}>
        <CardTitle className="text-2xl flex items-center gap-2">
          <StatusIcon className={cn("h-6 w-6", config.textColor)} />
          Your Property Readiness Score
        </CardTitle>
        <CardDescription>
          Instant assessment based on your answers
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Score Badge */}
        <div className="flex items-center justify-center">
          <div
            className={cn(
              "rounded-xl border-2 px-6 py-4 inline-flex flex-col items-center gap-2",
              config.bgColor,
              config.borderColor
            )}
          >
            <div className={cn("text-5xl font-bold", config.textColor)}>
              {score}
              <span className="text-2xl">/100</span>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-sm font-semibold",
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
          <h3 className="font-semibold text-wisebox-text-primary text-lg">
            What this means
          </h3>
          <p className="text-wisebox-text-secondary leading-relaxed">
            {summary}
          </p>
        </div>

        {/* Detected Gaps */}
        <div className="space-y-3">
          <h3 className="font-semibold text-wisebox-text-primary text-lg">
            Detected gaps
          </h3>
          {gaps.length === 0 ? (
            <div
              className={cn(
                "rounded-lg border p-4 text-center",
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
                  className="flex items-start gap-2 text-wisebox-text-secondary"
                >
                  <span className="text-wisebox-status-danger mt-0.5">•</span>
                  <span className="text-sm">{gap}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recommended Services */}
        {recommendedServices.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-wisebox-text-primary text-lg">
              Recommended services
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {recommendedServices.map((service) => (
                <div
                  key={service.id}
                  className="rounded-lg border border-wisebox-border p-4 hover:border-wisebox-primary-300 hover:bg-wisebox-primary-50/30 transition-colors"
                >
                  <p className="font-semibold text-wisebox-text-primary">
                    {service.name}
                  </p>
                  {service.description && (
                    <p className="text-xs text-wisebox-text-secondary mt-1">
                      {service.description}
                    </p>
                  )}
                  <p className="text-sm text-wisebox-primary-600 font-medium mt-2">
                    Starting at ${service.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            asChild
            className="flex-1 bg-wisebox-primary hover:bg-wisebox-primary-hover"
          >
            <Link href="/register">Create account to protect your property</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href="/workspace/services">Talk to an expert</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
