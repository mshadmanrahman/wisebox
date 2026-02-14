"use client"

import * as React from "react"
import { Check, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-wisebox-primary-50/50 pb-4">
        <CardTitle className="text-lg">Question {questionNumber}</CardTitle>
        <CardDescription className="text-base text-wisebox-text-primary mt-2">
          {question}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 pb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange(true)}
            disabled={disabled}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border-2 py-5 sm:py-6 text-base sm:text-lg font-semibold transition-all",
              "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-wisebox-primary-500 focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "min-h-[80px]",
              value === true
                ? "border-wisebox-status-success bg-wisebox-status-success/10 text-wisebox-status-success"
                : "border-wisebox-border bg-wisebox-background-card text-wisebox-text-primary hover:border-wisebox-status-success/40 hover:bg-wisebox-status-success/5"
            )}
          >
            <Check
              className={cn(
                "h-6 w-6 sm:h-7 sm:w-7",
                value === true && "text-wisebox-status-success"
              )}
              strokeWidth={2.5}
            />
            <span>Yes</span>
          </button>

          <button
            type="button"
            onClick={() => onChange(false)}
            disabled={disabled}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border-2 py-5 sm:py-6 text-base sm:text-lg font-semibold transition-all",
              "hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-wisebox-border-light focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "min-h-[80px]",
              value === false
                ? "border-wisebox-border-light bg-wisebox-background-lighter text-wisebox-text-secondary"
                : "border-wisebox-border bg-wisebox-background-card text-wisebox-text-primary hover:border-wisebox-border-light hover:bg-wisebox-background-lighter"
            )}
          >
            <X
              className={cn(
                "h-6 w-6 sm:h-7 sm:w-7",
                value === false && "text-wisebox-text-secondary"
              )}
              strokeWidth={2.5}
            />
            <span>No</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
