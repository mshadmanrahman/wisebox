import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PricingPlan } from '@/components/marketing/content';

interface PricingTableProps {
  plans: PricingPlan[];
}

export function PricingTable({ plans }: PricingTableProps) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.name}
          className={`relative flex h-full flex-col rounded-xl border p-6 transition-all duration-200 ${
            plan.highlighted
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-wisebox-border-light'
          }`}
        >
          {plan.highlighted && (
            <span className="absolute -top-3 left-6 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
              Recommended
            </span>
          )}

          <div className="mb-6">
            <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
            <p className="mt-3 font-[family-name:var(--font-geist-sans)] text-3xl font-semibold text-foreground" style={{ letterSpacing: '-0.02em' }}>
              {plan.price}
              {plan.priceSuffix && (
                <span className="text-base font-normal text-muted-foreground">{plan.priceSuffix}</span>
              )}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground" style={{ lineHeight: '1.6' }}>
              {plan.description}
            </p>
          </div>

          <ul className="mb-8 flex-1 space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            asChild
            className={`w-full rounded-lg transition-all duration-200 ${
              plan.highlighted
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'border border-border bg-transparent text-muted-foreground hover:border-wisebox-border-light hover:text-foreground'
            }`}
            variant={plan.highlighted ? 'default' : 'outline'}
          >
            <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
          </Button>
        </div>
      ))}
    </div>
  );
}
