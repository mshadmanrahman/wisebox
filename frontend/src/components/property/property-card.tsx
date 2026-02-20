'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  index?: number;
}

const gradients = [
  'from-cyan-900/80 via-blue-900/60 to-slate-900',
  'from-emerald-900/80 via-teal-900/60 to-slate-900',
  'from-violet-900/80 via-purple-900/60 to-slate-900',
  'from-amber-900/80 via-orange-900/60 to-slate-900',
];

function buildLocation(property: Property): string | null {
  const parts: string[] = [];
  if (property.division?.name) parts.push(property.division.name);
  if (property.district?.name) parts.push(property.district.name);
  return parts.length > 0 ? parts.join(', ') : null;
}

export function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  const location = buildLocation(property);
  const gradient = gradients[index % gradients.length];

  return (
    <Link href={`/properties/${property.id}`} className="block group">
      <div
        className={cn(
          'relative rounded-2xl border border-wisebox-border overflow-hidden p-6 min-h-[200px] flex flex-col justify-between transition-all hover:shadow-lg hover:border-wisebox-border-light bg-gradient-to-br',
          gradient
        )}
      >
        {/* Type badge */}
        {property.property_type && (
          <Badge className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm text-white border-white/20 text-xs uppercase tracking-wider">
            {property.property_type.name}
          </Badge>
        )}

        <div className="space-y-3 mt-auto">
          {/* Property name */}
          <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 group-hover:text-wisebox-primary-light transition-colors">
            {property.property_name}
          </h3>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-1.5 text-sm text-white/70">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
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
                    className="w-7 h-7 rounded-full bg-wisebox-primary/30 border-2 border-white/20 flex items-center justify-center text-[10px] font-medium text-white"
                    title={owner.name}
                  >
                    {owner.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {property.co_owners.length > 3 && (
                  <div className="w-7 h-7 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-[10px] font-medium text-white">
                    +{property.co_owners.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs text-white/60">
                {property.co_owners.length} co-owner{property.co_owners.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
