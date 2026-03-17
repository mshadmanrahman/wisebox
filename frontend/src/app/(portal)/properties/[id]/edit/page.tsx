'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod/v4';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronRight,
  Plus,
  Trash2,
  Building2,
  Trees,
  Factory,
  Wheat,
  Warehouse,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  ApiResponse,
  Property,
  PropertyType,
  OwnershipStatus,
  OwnershipType,
  Division,
  District,
  Upazila,
  Mouza,
  SizeUnit,
} from '@/types';

const coOwnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().nullable(),
  ownership_percentage: z.number().min(0).max(100),
  phone: z.string().nullable(),
  email: z.string().nullable(),
});

const editPropertySchema = z.object({
  property_name: z.string().min(1, 'Property name is required'),
  property_type_id: z.number().min(1, 'Select a property type'),
  ownership_status_id: z.number().min(1, 'Select ownership status'),
  ownership_type_id: z.number().min(1, 'Select ownership type'),
  division_id: z.number().nullable(),
  district_id: z.number().nullable(),
  upazila_id: z.number().nullable(),
  mouza_id: z.number().nullable(),
  address: z.string().nullable(),
  size_value: z.number().nullable(),
  size_unit: z
    .enum(['sqft', 'katha', 'bigha', 'acre', 'decimal', 'shotangsho'])
    .nullable(),
  description: z.string().nullable(),
  co_owners: z.array(coOwnerSchema),
});

type EditPropertyForm = z.infer<typeof editPropertySchema>;

const propertyTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  land: Trees,
  building: Building2,
  apartment: Building2,
  commercial: Factory,
  agricultural: Wheat,
  industrial: Warehouse,
};

const sizeUnits: { value: SizeUnit; label: string }[] = [
  { value: 'sqft', label: 'sq ft' },
  { value: 'katha', label: 'Katha' },
  { value: 'bigha', label: 'Bigha' },
  { value: 'acre', label: 'Acre' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'shotangsho', label: 'Shotangsho' },
];

export default function EditPropertyPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation(['properties', 'common']);
  const id = params.id as string;

  // Fetch current property
  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ['property', Number(id)],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Property>>(`/properties/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // Reference data
  const { data: propertyTypes } = useQuery({
    queryKey: ['property-types'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PropertyType[]>>('/property-types');
      return res.data.data;
    },
    staleTime: Infinity,
  });

  const { data: ownershipStatuses } = useQuery({
    queryKey: ['ownership-statuses'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<OwnershipStatus[]>>(
        '/ownership-statuses'
      );
      return res.data.data;
    },
    staleTime: Infinity,
  });

  const { data: ownershipTypes } = useQuery({
    queryKey: ['ownership-types'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<OwnershipType[]>>(
        '/ownership-types'
      );
      return res.data.data;
    },
    staleTime: Infinity,
  });

  // Form setup
  const form = useForm<EditPropertyForm>({
    resolver: zodResolver(editPropertySchema),
    defaultValues: {
      property_name: '',
      property_type_id: 0,
      ownership_status_id: 0,
      ownership_type_id: 0,
      division_id: null,
      district_id: null,
      upazila_id: null,
      mouza_id: null,
      address: null,
      size_value: null,
      size_unit: null,
      description: null,
      co_owners: [],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'co_owners',
  });

  // Pre-fill form when property loads
  useEffect(() => {
    if (property) {
      reset({
        property_name: property.property_name,
        property_type_id: property.property_type_id,
        ownership_status_id: property.ownership_status_id,
        ownership_type_id: property.ownership_type_id,
        division_id: property.division_id,
        district_id: property.district_id,
        upazila_id: property.upazila_id,
        mouza_id: property.mouza_id,
        address: property.address,
        size_value: property.size_value,
        size_unit: property.size_unit,
        description: property.description,
        co_owners: (property.co_owners ?? []).map((co) => ({
          name: co.name,
          relationship: co.relationship,
          ownership_percentage: co.ownership_percentage,
          phone: co.phone,
          email: co.email,
        })),
      });
    }
  }, [property, reset]);

  // Location cascading
  const divisionId = watch('division_id');
  const districtId = watch('district_id');
  const upazilaId = watch('upazila_id');

  const { data: divisions } = useQuery({
    queryKey: ['divisions'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Division[]>>(
        '/locations/divisions'
      );
      return res.data.data;
    },
    staleTime: Infinity,
  });

  const { data: districts } = useQuery({
    queryKey: ['districts', divisionId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<District[]>>(
        `/locations/districts?division_id=${divisionId}`
      );
      return res.data.data;
    },
    enabled: !!divisionId,
  });

  const { data: upazilas } = useQuery({
    queryKey: ['upazilas', districtId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Upazila[]>>(
        `/locations/upazilas?district_id=${districtId}`
      );
      return res.data.data;
    },
    enabled: !!districtId,
  });

  const { data: mouzas } = useQuery({
    queryKey: ['mouzas', upazilaId],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Mouza[]>>(
        `/locations/mouzas?upazila_id=${upazilaId}`
      );
      return res.data.data;
    },
    enabled: !!upazilaId,
  });

  // Check if selected ownership type requires co-owners
  const selectedOwnershipTypeId = watch('ownership_type_id');
  const requiresCoOwners =
    ownershipTypes?.find((ot) => ot.id === selectedOwnershipTypeId)
      ?.requires_co_owners ?? false;

  // Mutation
  const updateMutation = useMutation({
    mutationFn: async (data: EditPropertyForm) => {
      const payload = {
        ...data,
        co_owners: data.co_owners.length > 0 ? data.co_owners : undefined,
      };
      return api.put<ApiResponse<Property>>(`/properties/${id}`, payload);
    },
    onSuccess: () => {
      router.push(`/properties/${id}`);
    },
  });

  const onSubmit = (data: EditPropertyForm) => {
    updateMutation.mutate(data);
  };

  if (propertyLoading) {
    return (
      <div className="px-6 py-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-5 w-64 rounded bg-wisebox-background-lighter" />
          <div className="h-96 w-full rounded-xl bg-wisebox-background-card" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="px-6 py-8">
        <div className="rounded-xl border border-wisebox-status-danger/20 bg-wisebox-status-danger/10 p-8 text-center space-y-4">
          <p className="text-sm text-wisebox-status-danger">
            {t('properties:detail.notFound')}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/properties">
              <ArrowLeft className="h-4 w-4" />
              {t('properties:detail.backToProperties')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-wisebox-text-secondary">
        <Link
          href="/properties"
          className="hover:text-wisebox-text-primary transition-colors"
        >
          {t('properties:breadcrumb.properties')}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/properties/${id}`}
          className="hover:text-wisebox-text-primary transition-colors truncate max-w-[200px]"
        >
          {property.property_name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-wisebox-text-primary font-medium">{t('properties:breadcrumb.edit')}</span>
      </nav>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Property Name */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('properties:edit.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="property_name">{t('properties:edit.propertyName')}</Label>
              <Input
                id="property_name"
                placeholder={t('properties:edit.propertyNamePlaceholder')}
                {...register('property_name')}
              />
              {errors.property_name && (
                <p className="text-xs text-wisebox-status-danger">
                  {errors.property_name.message}
                </p>
              )}
            </div>

            {/* Property Type - Card Selector */}
            <div className="space-y-2">
              <Label>{t('properties:edit.propertyType')}</Label>
              <Controller
                control={control}
                name="property_type_id"
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {(propertyTypes ?? []).map((pt) => {
                      const Icon =
                        propertyTypeIcons[pt.slug] ?? Building2;
                      const selected = field.value === pt.id;
                      return (
                        <button
                          key={pt.id}
                          type="button"
                          onClick={() => field.onChange(pt.id)}
                          className={cn(
                            'flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-all',
                            selected
                              ? 'border-wisebox-primary bg-wisebox-primary-50 text-wisebox-primary-700'
                              : 'border-wisebox-border hover:border-wisebox-border-light text-wisebox-text-secondary'
                          )}
                        >
                          <Icon className="h-6 w-6" />
                          {pt.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              />
              {errors.property_type_id && (
                <p className="text-xs text-wisebox-status-danger">
                  {errors.property_type_id.message}
                </p>
              )}
            </div>

            {/* Ownership Status + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('properties:edit.ownershipStatus')}</Label>
                <Controller
                  control={control}
                  name="ownership_status_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('properties:edit.selectStatus')} />
                      </SelectTrigger>
                      <SelectContent>
                        {(ownershipStatuses ?? []).map((os) => (
                          <SelectItem key={os.id} value={String(os.id)}>
                            {os.display_label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.ownership_status_id && (
                  <p className="text-xs text-wisebox-status-danger">
                    {errors.ownership_status_id.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t('properties:edit.ownershipType')}</Label>
                <Controller
                  control={control}
                  name="ownership_type_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) => field.onChange(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('properties:edit.selectType')} />
                      </SelectTrigger>
                      <SelectContent>
                        {(ownershipTypes ?? []).map((ot) => (
                          <SelectItem key={ot.id} value={String(ot.id)}>
                            {ot.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.ownership_type_id && (
                  <p className="text-xs text-wisebox-status-danger">
                    {errors.ownership_type_id.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('properties:edit.descriptionOptional')}</Label>
              <Textarea
                id="description"
                placeholder={t('properties:edit.descriptionPlaceholder')}
                rows={3}
                {...register('description')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Co-owners */}
        {requiresCoOwners && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{t('properties:edit.coOwners')}</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      name: '',
                      relationship: null,
                      ownership_percentage: 0,
                      phone: null,
                      email: null,
                    })
                  }
                >
                  <Plus className="h-4 w-4" />
                  {t('properties:edit.addCoOwner')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.length === 0 && (
                <p className="text-sm text-wisebox-text-secondary text-center py-4">
                  {t('properties:edit.noCoOwners')}
                </p>
              )}
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {t('properties:edit.coOwnerIndex', { index: index + 1 })}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-wisebox-text-secondary hover:text-wisebox-status-danger"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{t('properties:edit.name')}</Label>
                      <Input
                        placeholder={t('properties:edit.fullName')}
                        {...register(`co_owners.${index}.name`)}
                      />
                      {errors.co_owners?.[index]?.name && (
                        <p className="text-xs text-wisebox-status-danger">
                          {errors.co_owners[index].name?.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('properties:edit.relationship')}</Label>
                      <Input
                        placeholder={t('properties:edit.relationshipPlaceholder')}
                        {...register(`co_owners.${index}.relationship`)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('properties:edit.ownershipPercent')}</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="0"
                        {...register(
                          `co_owners.${index}.ownership_percentage`,
                          { valueAsNumber: true }
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{t('properties:edit.phone')}</Label>
                      <Input
                        placeholder="+880..."
                        {...register(`co_owners.${index}.phone`)}
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">{t('properties:edit.email')}</Label>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...register(`co_owners.${index}.email`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('properties:edit.location')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Division */}
              <div className="space-y-2">
                <Label>{t('properties:edit.division')}</Label>
                <Controller
                  control={control}
                  name="division_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) => {
                        const numVal = Number(val);
                        field.onChange(numVal);
                        setValue('district_id', null);
                        setValue('upazila_id', null);
                        setValue('mouza_id', null);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('properties:edit.selectDivision')} />
                      </SelectTrigger>
                      <SelectContent>
                        {(divisions ?? []).map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* District */}
              <div className="space-y-2">
                <Label>{t('properties:edit.district')}</Label>
                <Controller
                  control={control}
                  name="district_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) => {
                        const numVal = Number(val);
                        field.onChange(numVal);
                        setValue('upazila_id', null);
                        setValue('mouza_id', null);
                      }}
                      disabled={!divisionId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('properties:edit.selectDistrict')} />
                      </SelectTrigger>
                      <SelectContent>
                        {(districts ?? []).map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Upazila */}
              <div className="space-y-2">
                <Label>{t('properties:edit.upazila')}</Label>
                <Controller
                  control={control}
                  name="upazila_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) => {
                        const numVal = Number(val);
                        field.onChange(numVal);
                        setValue('mouza_id', null);
                      }}
                      disabled={!districtId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('properties:edit.selectUpazila')} />
                      </SelectTrigger>
                      <SelectContent>
                        {(upazilas ?? []).map((u) => (
                          <SelectItem key={u.id} value={String(u.id)}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Mouza */}
              <div className="space-y-2">
                <Label>{t('properties:edit.mouza')}</Label>
                <Controller
                  control={control}
                  name="mouza_id"
                  render={({ field }) => (
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(val) => field.onChange(Number(val))}
                      disabled={!upazilaId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('properties:edit.selectMouza')} />
                      </SelectTrigger>
                      <SelectContent>
                        {(mouzas ?? []).map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.name}
                            {m.jl_number ? ` (JL ${m.jl_number})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">{t('properties:edit.addressOptional')}</Label>
              <Textarea
                id="address"
                placeholder={t('properties:edit.addressPlaceholder')}
                rows={2}
                {...register('address')}
              />
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size_value">{t('properties:edit.sizeOptional')}</Label>
                <Input
                  id="size_value"
                  type="number"
                  step="any"
                  min={0}
                  placeholder="0"
                  {...register('size_value', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('properties:edit.unit')}</Label>
                <Controller
                  control={control}
                  name="size_unit"
                  render={({ field }) => (
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={(val) =>
                        field.onChange(val as SizeUnit)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('properties:edit.selectUnit')} />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeUnits.map((u) => (
                          <SelectItem key={u.value} value={u.value}>
                            {u.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            className="bg-wisebox-primary hover:bg-wisebox-primary-hover text-white"
          >
            {updateMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {t('properties:edit.saveChanges')}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={`/properties/${id}`}>{t('common:cancel')}</Link>
          </Button>
        </div>

        {updateMutation.isError && (
          <p className="text-sm text-wisebox-status-danger">
            {t('properties:edit.updateFailed')}
          </p>
        )}
      </form>
    </div>
  );
}
