import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PricingPlan } from '@/components/marketing/content';

interface PricingTableProps {
  plans: PricingPlan[];
}

export function PricingTable({ plans }: PricingTableProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`h-full border ${
            plan.highlighted
              ? 'border-wisebox-primary-400 shadow-lg shadow-teal-100'
              : 'border-gray-200 shadow-sm'
          }`}
        >
          <CardHeader>
            <CardTitle className="text-wisebox-text-primary">{plan.name}</CardTitle>
            <CardDescription>{plan.subtitle}</CardDescription>
            <p className="text-3xl font-bold text-wisebox-primary-700">{plan.price}</p>
            <p className="text-sm text-wisebox-text-secondary">{plan.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-wisebox-text-secondary">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-wisebox-primary-600" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className={`w-full ${
                plan.highlighted
                  ? 'bg-wisebox-primary-600 text-white hover:bg-wisebox-primary-700'
                  : 'bg-white text-wisebox-primary-700 hover:bg-teal-50'
              }`}
              variant={plan.highlighted ? 'default' : 'outline'}
            >
              <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
