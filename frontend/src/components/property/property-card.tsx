'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useI18nStore } from '@/stores/i18n';
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

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <div
        className={cn(
          'relative rounded-xl border border-border bg-card overflow-hidden p-6 min-h-[200px] flex flex-col justify-between transition-all duration-200 shadow-sm dark:shadow-none hover:shadow-md hover:border-border',
        )}
      >
        {/* Type badge */}
        {property.property_type && (
          <Badge className="absolute top-4 right-4 bg-primary/10 backdrop-blur-sm text-primary border-primary/20 text-xs uppercase tracking-wider">
            {property.property_type.name}
          </Badge>
        )}

        <div className="space-y-3 mt-auto">
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
        </div>
      </div>
    </Link>
  );
}
