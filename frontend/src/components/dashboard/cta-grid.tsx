"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, CalendarCheck, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
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
    icon: <Plus className="h-5 w-5" />,
    title: "Add New Property",
    description: "Start a new property file in 2 steps.",
  },
  {
    id: "talk-expert",
    href: "/tickets",
    icon: <CalendarCheck className="h-5 w-5" />,
    title: "Talk to an Expert",
    description: "Open tickets and schedule with consultants.",
  },
  {
    id: "assessment",
    href: "/assessment",
    icon: <ShieldCheck className="h-5 w-5" />,
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
    <Link href={href} className="block">
      <Card className="h-full transition hover:shadow-md hover:border-wisebox-primary-200">
        <CardContent className="pt-6">
          <div className="h-10 w-10 rounded-lg bg-wisebox-primary-50 text-wisebox-primary-700 flex items-center justify-center mb-3">
            {icon}
          </div>
          <h3 className="font-semibold text-wisebox-text-primary">{title}</h3>
          <p className="text-sm text-wisebox-text-secondary mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export { CTACard }
