"use client"

import * as React from "react"
import { DocumentChecklistItem } from "./document-checklist-item"
import { cn } from "@/lib/utils"

export interface DocumentChecklistDocument {
  id: number
  name: string
  required: boolean
  category: "primary" | "secondary"
  description?: string
}

export interface DocumentChecklistSectionProps {
  documents: DocumentChecklistDocument[]
  values: Record<number, "have" | "dont-have">
  onChange: (documentId: number, value: "have" | "dont-have") => void
  disabled?: boolean
  showProgress?: boolean
}

export function DocumentChecklistSection({
  documents,
  values,
  onChange,
  disabled = false,
  showProgress = true,
}: DocumentChecklistSectionProps) {
  const primaryDocs = documents.filter((doc) => doc.category === "primary")
  const secondaryDocs = documents.filter((doc) => doc.category === "secondary")

  // Weighted progress calculation
  // Primary docs: weight = 2, Secondary docs: weight = 1
  const primaryCount = primaryDocs.filter((doc) => values[doc.id] === "have").length
  const secondaryCount = secondaryDocs.filter((doc) => values[doc.id] === "have").length

  const totalWeight = primaryDocs.length * 2 + secondaryDocs.length
  const completedWeight = primaryCount * 2 + secondaryCount

  const progressPct = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0

  const progressColor =
    progressPct >= 80
      ? "text-wisebox-status-success"
      : progressPct >= 50
        ? "text-wisebox-status-warning"
        : "text-destructive"

  const progressBgColor =
    progressPct >= 80
      ? "bg-wisebox-status-success"
      : progressPct >= 50
        ? "bg-wisebox-status-warning"
        : "bg-destructive"

  const totalAnswered = Object.keys(values).length
  const totalDocs = documents.length

  return (
    <div className="space-y-6">
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">
              Document Availability
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {totalAnswered}/{totalDocs} answered
              </span>
              <span className={cn("text-sm font-semibold", progressColor)}>
                {progressPct}%
              </span>
            </div>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", progressBgColor)}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Primary documents are weighted 2x in the score calculation
          </p>
        </div>
      )}

      {primaryDocs.length > 0 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Primary Documents
            </h4>
            <p className="text-xs text-muted-foreground">
              Essential documents for property verification (weighted 2x)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {primaryDocs.map((doc) => (
              <DocumentChecklistItem
                key={doc.id}
                document={doc}
                value={values[doc.id] || null}
                onChange={(value) => onChange(doc.id, value)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}

      {secondaryDocs.length > 0 && (
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">
              Secondary Documents
            </h4>
            <p className="text-xs text-muted-foreground">
              Supporting documents that improve your property score
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {secondaryDocs.map((doc) => (
              <DocumentChecklistItem
                key={doc.id}
                document={doc}
                value={values[doc.id] || null}
                onChange={(value) => onChange(doc.id, value)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
