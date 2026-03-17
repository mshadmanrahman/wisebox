"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface RadioCardOption {
  value: string
  label: string
  description?: string
  icon?: React.ReactNode
  disabled?: boolean
}

interface RadioCardGroupProps extends Omit<React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>, 'children'> {
  options: RadioCardOption[]
  columns?: 1 | 2 | 3
  size?: 'sm' | 'md' | 'lg'
}

const RadioCardGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioCardGroupProps
>(({ options, columns = 2, size = 'md', className, ...props }, ref) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn("grid gap-3", gridCols[columns], className)}
      {...props}
    >
      {options.map((option) => (
        <RadioCardItem
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          size={size}
        >
          {option.icon && (
            <div className="text-primary">
              {option.icon}
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium text-foreground">
              {option.label}
            </div>
            {option.description && (
              <div className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {option.description}
              </div>
            )}
          </div>
        </RadioCardItem>
      ))}
    </RadioGroupPrimitive.Root>
  )
})
RadioCardGroup.displayName = "RadioCardGroup"

interface RadioCardItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const RadioCardItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioCardItemProps
>(({ className, children, size = 'md', ...props }, ref) => {
  const cardSizes = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "group relative flex items-start rounded-xl border-2 bg-card transition-all duration-200 cursor-pointer shadow-sm dark:shadow-none",
        "hover:border-primary hover:bg-primary/5",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-primary data-[state=checked]:bg-primary/10",
        cardSizes[size],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 w-full">
        {children}
        <div
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
            "border-border",
            "group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary"
          )}
        >
          <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
            <Check className="h-3 w-3 text-white" strokeWidth={3} />
          </RadioGroupPrimitive.Indicator>
        </div>
      </div>
    </RadioGroupPrimitive.Item>
  )
})
RadioCardItem.displayName = "RadioCardItem"

export { RadioCardGroup, RadioCardItem }
export type { RadioCardGroupProps }
