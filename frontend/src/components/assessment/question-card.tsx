"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AssessmentQuestionCardProps {
  questionNumber: number
  question: string
  value: boolean | null
  onChange: (value: boolean) => void
  disabled?: boolean
  className?: string
}

export function AssessmentQuestionCard({
  questionNumber,
  question,
  value,
  onChange,
  disabled = false,
  className,
}: AssessmentQuestionCardProps) {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none", className)}>
      <div className="space-y-1 mb-4">
        <h3 className="text-base font-medium text-foreground">Question {questionNumber}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          {question}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          disabled={disabled}
          className={cn(
            "flex items-center justify-center gap-2 h-12 rounded-lg border transition-all duration-200 text-sm font-medium",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value === true
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border bg-card text-foreground hover:bg-muted"
          )}
        >
          <Check
            className={cn(
              "h-5 w-5",
              value === true ? "text-primary-foreground" : "text-muted-foreground"
            )}
            strokeWidth={1.5}
          />
          <span>Yes</span>
        </button>

        <button
          type="button"
          onClick={() => onChange(false)}
          disabled={disabled}
          className={cn(
            "flex items-center justify-center gap-2 h-12 rounded-lg border transition-all duration-200 text-sm font-medium",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            value === false
              ? "bg-primary text-primary-foreground border-primary"
              : "border-border bg-card text-foreground hover:bg-muted"
          )}
        >
          <X
            className={cn(
              "h-5 w-5",
              value === false ? "text-primary-foreground" : "text-muted-foreground"
            )}
            strokeWidth={1.5}
          />
          <span>No</span>
        </button>
      </div>
    </div>
  )
}
