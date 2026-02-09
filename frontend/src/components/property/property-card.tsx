'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
}

const statusConfig: Record<
  Property['status'],
  { label: string; className: string }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  active: {
    label: 'Active',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  verified: {
    label: 'Verified',
    className: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  archived: {
    label: 'Archived',
    className: 'bg-slate-100 text-slate-500 border-slate-200',
  },
};

function completionBarColor(percentage: number): string {
  if (percentage >= 80) return 'bg-wisebox-status-success';
  if (percentage >= 40) return 'bg-wisebox-status-warning';
  return 'bg-wisebox-status-danger';
}

function completionTextColor(percentage: number): string {
  if (percentage >= 80) return 'text-wisebox-status-success';
  if (percentage >= 40) return 'text-wisebox-status-warning';
  return 'text-wisebox-status-danger';
}

function buildLocation(property: Property): string | null {
  const parts: string[] = [];
  if (property.division?.name) parts.push(property.division.name);
  if (property.district?.name) parts.push(property.district.name);
  return parts.length > 0 ? parts.join(' > ') : null;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const status = statusConfig[property.status];
  const location = buildLocation(property);
  const pct = property.completion_percentage;

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-snug line-clamp-2 group-hover:text-wisebox-primary-700 transition-colors">
              {property.property_name}
            </CardTitle>
            <Badge
              variant="outline"
              className={cn('shrink-0 text-[11px]', status.className)}
            >
              {status.label}
            </Badge>
          </div>
          {property.property_type && (
            <Badge variant="secondary" className="w-fit text-xs mt-1">
              {property.property_type.name}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Completion</span>
              <span className={cn('font-medium', completionTextColor(pct))}>
                {pct}%
              </span>
            </div>
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  completionBarColor(pct)
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
