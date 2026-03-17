"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, CalendarCheck, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CTACardConfig {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  id?: string
}

export interface DashboardCTAGridProps {
  cards?: CTACardConfig[]
  counts?: {
    properties_total?: number
    tickets_open?: number
  }
  className?: string
}

const defaultCards: CTACardConfig[] = [
  {
    id: "add-property",
    href: "/properties/new",
    icon: <Plus className="w-5 h-5 text-primary" strokeWidth={1.5} />,
    title: "Add New Property",
    description: "Start a new property file in 2 steps.",
  },
  {
    id: "talk-expert",
    href: "/tickets",
    icon: <CalendarCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />,
    title: "Talk to an Expert",
    description: "Open tickets and schedule with consultants.",
  },
  {
    id: "assessment",
    href: "/assessment/start",
    icon: <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={1.5} />,
    title: "Get Free Assessment",
    description: "Answer 15 questions and get instant risk insights.",
  },
]

export function DashboardCTAGrid({
  cards = defaultCards,
  counts,
  className,
}: DashboardCTAGridProps) {
  // Enhance descriptions with counts if available
  const enhancedCards = cards.map((card) => {
    let enhancedDescription = card.description

    if (counts) {
      if (card.id === "add-property" && counts.properties_total !== undefined) {
        enhancedDescription = `${card.description} ${counts.properties_total} tracked.`
      } else if (card.id === "talk-expert" && counts.tickets_open !== undefined) {
        enhancedDescription = `${card.description} ${counts.tickets_open} open.`
      }
    }

    return {
      ...card,
      description: enhancedDescription,
    }
  })

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4", className)}>
      {enhancedCards.map((card, index) => (
        <CTACard key={card.id || index} {...card} />
      ))}
    </div>
  )
}

interface CTACardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
}

function CTACard({ href, icon, title, description }: CTACardProps) {
  return (
    <Link href={href} className="block group">
      <div className="h-full bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none hover:border-border/80 dark:hover:border-white/12 transition-all duration-200">
        <div className="mb-3">
          {icon}
        </div>
        <h3 className="text-base font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </Link>
  )
}

export { CTACard }
