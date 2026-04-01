'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18nStore } from '@/stores/i18n';
import { getPropertyTypeStyles, scoreBarColor } from '@/lib/property-type-styles';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

function buildLocation(property: Property, lang: string): string | null {
  const parts: string[] = [];
  const useBn = lang === 'bn';
  if (property.division) {
    parts.push((useBn && property.division.bn_name) || property.division.name);
  }
  if (property.district) {
    parts.push((useBn && property.district.bn_name) || property.district.name);
  }
  return parts.length > 0 ? parts.join(', ') : null;
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const { t } = useTranslation('properties');
  const language = useI18nStore((s) => s.language);
  const location = buildLocation(property, language);
  const styles = getPropertyTypeStyles(property.property_type?.name);
  const pct = property.completion_percentage ?? 0;

  return (
    <Link href={`/properties/${property.id}`} className="block group cursor-pointer">
      <div
        className={cn(
          'relative rounded-xl border-border bg-gradient-to-br overflow-hidden p-6 min-h-[200px] flex flex-col justify-between transition-all duration-200 shadow-sm dark:shadow-none hover:shadow-md hover:-translate-y-0.5',
          styles.gradient,
          styles.border,
        )}
      >
        {/* Grain texture — top-left quadrant only */}
        <div className="property-grain absolute top-0 left-0 w-3/5 h-3/5 opacity-[0.025] pointer-events-none" />

        {/* Type badge */}
        {property.property_type && (
          <div className="absolute top-4 right-4">
            <span className={cn('text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full', styles.badge)}>
              {property.property_type.name}
            </span>
          </div>
        )}

        <div className="space-y-3 mt-auto relative">
          {/* Property name */}
          <h3 className="text-base font-medium text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200">
            {property.property_name}
          </h3>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
              <span className="truncate">{location}</span>
            </div>
          )}

          {/* Co-owner avatars */}
          {property.co_owners && property.co_owners.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <div className="flex -space-x-2">
                {property.co_owners.slice(0, 3).map((owner) => (
                  <div
                    key={owner.id}
                    className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-medium text-foreground"
                    title={owner.name}
                  >
                    {owner.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {property.co_owners.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-black/30 border-2 border-card flex items-center justify-center text-[10px] font-medium text-foreground">
                    +{property.co_owners.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {property.co_owners.length === 1
                  ? t('card.coOwner', { count: 1 })
                  : t('card.coOwners', { count: property.co_owners.length })}
              </span>
            </div>
          )}

          {/* Readiness bar */}
          {pct > 0 && (
            <div className="pt-1">
              <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                <span>Readiness</span>
                <span className="font-medium">{pct}%</span>
              </div>
              <div className="h-1 rounded-full bg-black/10 dark:bg-white/10">
                <div
                  className={cn('h-full rounded-full transition-all', scoreBarColor(pct))}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
