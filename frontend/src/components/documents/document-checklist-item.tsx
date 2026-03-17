"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
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
  const { t } = useTranslation('properties');

  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2 shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-medium text-foreground">
              {document.name}
            </h4>
            {document.category === "primary" && (
              <Badge
                variant="outline"
                className="h-4 px-1.5 text-[10px] leading-none bg-primary/10 text-primary border-primary/20"
              >
                Primary
              </Badge>
            )}
            {document.required && (
              <Badge
                variant="outline"
                className="h-4 px-1.5 text-[10px] leading-none text-destructive border-destructive/20"
              >
                Required
              </Badge>
            )}
          </div>
          {document.description && (
            <p className="text-xs text-muted-foreground mt-1">
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
            "flex-1 flex items-center justify-center gap-1.5 rounded-md border-2 px-3 py-2 text-sm font-medium transition-all duration-200",
            "hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value === "have"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground"
          )}
        >
          <Check className={cn("h-4 w-4", value === "have" && "text-primary")} strokeWidth={1.5} />
          <span>{t('documents.have')}</span>
        </button>

        <button
          type="button"
          onClick={() => onChange("dont-have")}
          disabled={disabled}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 rounded-md border-2 px-3 py-2 text-sm font-medium transition-all duration-200",
            "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value === "dont-have"
              ? "border-border bg-muted text-muted-foreground"
              : "border-border bg-card text-muted-foreground"
          )}
        >
          <X className={cn("h-4 w-4", value === "dont-have" && "text-muted-foreground")} strokeWidth={1.5} />
          <span>{t('documents.dontHave')}</span>
        </button>
      </div>
    </div>
  )
}
