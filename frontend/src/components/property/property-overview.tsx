'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  MapPin,
  Calendar,
  Building2,
  Users,
  Pencil,
  Ruler,
  FileText,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Property } from '@/types';

interface PropertyOverviewProps {
  property: Property;
}

const statusClassNames: Record<Property['status'], string> = {
  draft: 'bg-wisebox-background-lighter text-white border-wisebox-border',
  active: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  under_review: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  verified: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-wisebox-background-lighter text-wisebox-text-muted border-wisebox-border',
};

function formatLocation(property: Property): string | null {
  const parts: string[] = [];
  if (property.mouza?.name) parts.push(property.mouza.name);
  if (property.upazila?.name) parts.push(property.upazila.name);
  if (property.district?.name) parts.push(property.district.name);
  if (property.division?.name) parts.push(property.division.name);
  return parts.length > 0 ? parts.join(', ') : null;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function PropertyOverview({ property }: PropertyOverviewProps) {
  const { t } = useTranslation('properties');
  const statusClassName = statusClassNames[property.status];
  const location = formatLocation(property);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">{property.property_name}</CardTitle>
            {property.property_type && (
              <div className="flex items-center gap-1.5 text-sm text-white">
                <Building2 className="h-3.5 w-3.5" />
                <span>{property.property_type.name}</span>
              </div>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn('shrink-0 text-xs', statusClassName)}
          >
            {t(`status.${property.status}`)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Ownership */}
        {(property.ownership_status || property.ownership_type) && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-white" />
              {t('overview.ownership')}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {property.ownership_status && (
                <div>
                  <span className="text-wisebox-text-secondary">{t('overview.ownershipStatus')}: </span>
                  <span>{property.ownership_status.display_label}</span>
                </div>
              )}
              {property.ownership_type && (
                <div>
                  <span className="text-wisebox-text-secondary">{t('overview.ownershipType')}: </span>
                  <span>{property.ownership_type.name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location */}
        {location && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-white" />
              {t('overview.location')}
            </h3>
            <p className="text-sm">{location}</p>
          </div>
        )}

        {/* Address */}
        {property.address && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-white" />
              {t('overview.address')}
            </h3>
            <p className="text-sm">{property.address}</p>
          </div>
        )}

        {/* Size */}
        {property.size_value && property.size_unit && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-white" />
              {t('overview.size')}
            </h3>
            <p className="text-sm">
              {property.size_value} {property.size_unit}
            </p>
          </div>
        )}

        {/* Description */}
        {property.description && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-white" />
              {t('overview.description')}
            </h3>
            <p className="text-sm text-wisebox-text-secondary">
              {property.description}
            </p>
          </div>
        )}

        {/* Created date */}
        <div className="flex items-center gap-1.5 text-xs text-white">
          <Calendar className="h-3.5 w-3.5" />
          <span>{t('overview.created', { date: formatDate(property.created_at) })}</span>
        </div>

        {/* Co-owners */}
        {property.co_owners && property.co_owners.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Users className="h-4 w-4 text-white" />
                {property.co_owners.length === 1
                  ? t('overview.coOwnedBy', { count: property.co_owners.length })
                  : t('overview.coOwnedByPlural', { count: property.co_owners.length })}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {property.co_owners.slice(0, 4).map((owner) => (
                    <div
                      key={owner.id}
                      className="w-9 h-9 rounded-full bg-wisebox-primary/20 border-2 border-wisebox-background-card flex items-center justify-center text-xs font-medium text-wisebox-primary"
                      title={`${owner.name} (${owner.ownership_percentage}%)`}
                    >
                      {owner.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {property.co_owners.length > 4 && (
                    <div className="w-9 h-9 rounded-full bg-wisebox-background-lighter border-2 border-wisebox-background-card flex items-center justify-center text-xs font-medium text-wisebox-text-secondary">
                      +{property.co_owners.length - 4}
                    </div>
                  )}
                </div>
                <div className="text-sm text-wisebox-text-secondary">
                  {property.co_owners.slice(0, 3).map(o => o.name).join(', ')}
                  {property.co_owners.length > 3 && ` ${t('overview.more', { count: property.co_owners.length - 3 })}`}
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href={`/properties/${property.id}/edit`}>
              <Pencil className="h-4 w-4" />
              {t('overview.editProperty')}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
