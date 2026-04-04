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
          className={`relative flex h-full flex-col rounded-3xl p-8 transition-all duration-300 ${
            plan.highlighted
              ? 'border-2 border-primary bg-primary/[0.03] dark:bg-primary/[0.05]'
              : 'border border-border dark:border-white/10 bg-card dark:bg-white/[0.03] hover:border-border/80 dark:hover:border-white/15'
          }`}
        >
          {plan.highlighted && (
            <span className="absolute -top-3.5 left-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Recommended
            </span>
          )}

          <div className="mb-6">
            <p className="text-sm font-medium text-foreground">{plan.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{plan.subtitle}</p>
            <p className="mt-4 heading-section text-3xl font-bold text-foreground">
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
            className={`w-full rounded-full transition-all duration-300 ${
              plan.highlighted
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 py-3.5 text-base shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25'
                : 'border border-border bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted'
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
