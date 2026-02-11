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

  const cardSizes = {
    sm: 'p-3 gap-2',
    md: 'p-4 gap-3',
    lg: 'p-6 gap-4',
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
            <div className="text-wisebox-primary-600">
              {option.icon}
            </div>
          )}
          <div className="flex-1">
            <div className="font-semibold text-wisebox-text-primary">
              {option.label}
            </div>
            {option.description && (
              <div className="text-sm text-wisebox-text-secondary mt-1">
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
        "relative flex items-start rounded-lg border-2 bg-white transition-all cursor-pointer",
        "hover:border-wisebox-primary-400 hover:bg-wisebox-primary-50",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-wisebox-primary-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-wisebox-primary-600 data-[state=checked]:bg-wisebox-primary-50",
        cardSizes[size],
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 w-full">
        {children}
        <div
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
            "border-gray-300",
            "group-data-[state=checked]:border-wisebox-primary-600 group-data-[state=checked]:bg-wisebox-primary-600"
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
