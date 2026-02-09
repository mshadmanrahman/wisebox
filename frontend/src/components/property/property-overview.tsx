'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  MapPin,
  Calendar,
  Building2,
  Users,
  Pencil,
  Trash2,
  Ruler,
  FileText,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Property } from '@/types';

interface PropertyOverviewProps {
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
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  under_review: {
    label: 'Under Review',
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  verified: {
    label: 'Verified',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  archived: {
    label: 'Archived',
    className: 'bg-gray-100 text-gray-500 border-gray-200',
  },
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
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const status = statusConfig[property.status];
  const location = formatLocation(property);

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/properties/${property.id}`),
    onSuccess: () => {
      router.push('/properties');
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl">{property.property_name}</CardTitle>
            {property.property_type && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{property.property_type.name}</span>
              </div>
            )}
          </div>
          <Badge
            variant="outline"
            className={cn('shrink-0 text-xs', status.className)}
          >
            {status.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Ownership */}
        {(property.ownership_status || property.ownership_type) && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Ownership
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {property.ownership_status && (
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <span>{property.ownership_status.display_label}</span>
                </div>
              )}
              {property.ownership_type && (
                <div>
                  <span className="text-muted-foreground">Type: </span>
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
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Location
            </h3>
            <p className="text-sm">{location}</p>
          </div>
        )}

        {/* Address */}
        {property.address && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Tag className="h-4 w-4 text-muted-foreground" />
              Address
            </h3>
            <p className="text-sm">{property.address}</p>
          </div>
        )}

        {/* Size */}
        {property.size_value && property.size_unit && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              Size
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
              <FileText className="h-4 w-4 text-muted-foreground" />
              Description
            </h3>
            <p className="text-sm text-muted-foreground">
              {property.description}
            </p>
          </div>
        )}

        {/* Created date */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>Created {formatDate(property.created_at)}</span>
        </div>

        {/* Co-owners */}
        {property.co_owners && property.co_owners.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                Co-owners ({property.co_owners.length})
              </h3>
              <div className="space-y-2">
                {property.co_owners.map((owner) => (
                  <div
                    key={owner.id}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{owner.name}</p>
                      {owner.relationship && (
                        <p className="text-xs text-muted-foreground">
                          {owner.relationship}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {owner.ownership_percentage}%
                    </Badge>
                  </div>
                ))}
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
              Edit Property
            </Link>
          </Button>

          <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4" />
                Delete Property
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure?</DialogTitle>
                <DialogDescription>
                  This will permanently delete &quot;{property.property_name}&quot;
                  and all associated documents. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
              {deleteMutation.isError && (
                <p className="text-sm text-red-600">
                  Failed to delete property. Please try again.
                </p>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
