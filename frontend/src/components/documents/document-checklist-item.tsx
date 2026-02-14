"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface DocumentChecklistItemProps {
  document: {
    id: number
    name: string
    required: boolean
    category: "primary" | "secondary"
    description?: string
  }
  value?: "have" | "dont-have" | null
  onChange: (value: "have" | "dont-have") => void
  disabled?: boolean
}

export function DocumentChecklistItem({
  document,
  value,
  onChange,
  disabled = false,
}: DocumentChecklistItemProps) {
  return (
    <div className="rounded-lg border border-wisebox-border bg-wisebox-background-card p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-medium text-wisebox-text-primary">
              {document.name}
            </h4>
            {document.category === "primary" && (
              <Badge
                variant="outline"
                className="h-4 px-1.5 text-[10px] leading-none bg-wisebox-primary-50 text-wisebox-primary-700 border-wisebox-primary-200"
              >
                Primary
              </Badge>
            )}
            {document.required && (
              <Badge
                variant="outline"
                className="h-4 px-1.5 text-[10px] leading-none text-wisebox-status-danger border-wisebox-status-danger/20"
              >
                Required
              </Badge>
            )}
          </div>
          {document.description && (
            <p className="text-xs text-wisebox-text-secondary mt-1">
              {document.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange("have")}
          disabled={disabled}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-md border-2 px-3 py-2 text-sm font-medium transition-all",
            "hover:bg-wisebox-primary-50 focus:outline-none focus:ring-2 focus:ring-wisebox-primary-500 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value === "have"
              ? "border-wisebox-primary-600 bg-wisebox-primary-50 text-wisebox-primary-700"
              : "border-wisebox-border bg-wisebox-background-card text-wisebox-text-secondary"
          )}
        >
          <Check className={cn("h-4 w-4", value === "have" && "text-wisebox-primary-600")} />
          <span>Have</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("dont-have")}
          disabled={disabled}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-md border-2 px-3 py-2 text-sm font-medium transition-all",
            "hover:bg-wisebox-background-lighter focus:outline-none focus:ring-2 focus:ring-wisebox-border-light focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value === "dont-have"
              ? "border-wisebox-border-light bg-wisebox-background-lighter text-wisebox-text-secondary"
              : "border-wisebox-border bg-wisebox-background-card text-wisebox-text-secondary"
          )}
        >
          <X className={cn("h-4 w-4", value === "dont-have" && "text-wisebox-text-secondary")} />
          <span>Don&apos;t have</span>
        </button>
      </div>
    </div>
  )
}
