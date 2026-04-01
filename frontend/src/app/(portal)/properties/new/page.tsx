'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { trackPropertyAdded } from '@/lib/analytics';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Building2,
  Home,
  Store,
  Tractor,
  Factory,
  ChevronRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { LocationCascade } from '@/components/property/location-cascade';
import { CoOwnerFields } from '@/components/property/co-owner-fields';
import { DocumentUploadItem } from '@/components/property/document-upload-item';
import { RadioCardGroup } from '@/components/forms';
import { useToast } from '@/hooks/use-toast';
import type {
  PropertyType,
  OwnershipStatus,
  OwnershipType,
  DocumentType,
  Property,
  ApiResponse,
  SizeUnit,
  PropertyDocument,
} from '@/types';

const SIZE_UNITS: { value: SizeUnit; label: string }[] = [
  { value: 'sqft', label: 'Sq. Ft.' },
  { value: 'katha', label: 'Katha' },
  { value: 'bigha', label: 'Bigha' },
  { value: 'acre', label: 'Acre' },
  { value: 'decimal', label: 'Decimal' },
  { value: 'shotangsho', label: 'Shotangsho' },
];

const PROPERTY_TYPE_ICONS: Record<string, React.ReactNode> = {
  land: <Tractor className="h-6 w-6" strokeWidth={1.5} />,
  building: <Building2 className="h-6 w-6" strokeWidth={1.5} />,
  apartment: <Home className="h-6 w-6" strokeWidth={1.5} />,
  commercial: <Store className="h-6 w-6" strokeWidth={1.5} />,
  agricultural: <Tractor className="h-6 w-6" strokeWidth={1.5} />,
  industrial: <Factory className="h-6 w-6" strokeWidth={1.5} />,
  residential: <Home className="h-6 w-6" strokeWidth={1.5} />,
};

const coOwnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  ownership_percentage: z.number().min(1, 'Must be at least 1%').max(100, 'Cannot exceed 100%'),
  phone: z.string(),
  email: z.string(),
});

const step1Schema = z.object({
  property_name: z.string().min(2, 'Property name must be at least 2 characters'),
  property_type_id: z.number().min(1, 'Select a property type'),
  ownership_status_id: z.number().min(1, 'Select ownership status'),
  ownership_type_id: z.number().min(1, 'Select ownership type'),
  division_id: z.number().optional(),
  district_id: z.number().optional(),
  upazila_id: z.number().optional(),
  mouza_id: z.number().optional(),
  address: z.string().optional(),
  size_value: z.number().positive('Must be a positive number').optional(),
  size_unit: z.enum(['sqft', 'katha', 'bigha', 'acre', 'decimal', 'shotangsho']).optional(),
  description: z.string().optional(),
  co_owners: z.array(coOwnerSchema).optional(),
});

type Step1FormData = z.input<typeof step1Schema>;

function getPropertyTypeIcon(slug: string): React.ReactNode {
  return PROPERTY_TYPE_ICONS[slug] || <Home className="h-6 w-6" strokeWidth={1.5} />;
}

export default function AddPropertyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useTranslation(['properties', 'common']);
  const [activeStep, setActiveStep] = useState<string>('step-1');
  const [createdProperty, setCreatedProperty] = useState<Property | null>(null);
  const [step1Error, setStep1Error] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      property_name: '',
      property_type_id: 0,
      ownership_status_id: 0,
      ownership_type_id: 0,
      address: '',
      description: '',
      co_owners: [],
    },
  });

  const watchedPropertyTypeId = watch('property_type_id');
  const watchedOwnershipTypeId = watch('ownership_type_id');
  const watchedOwnershipStatusId = watch('ownership_status_id');
  const watchedCoOwners = watch('co_owners') || [];

  const { data: propertyTypes } = useQuery({
    queryKey: ['property-types'],
    queryFn: async () => {
      const res = await api.get<{ data: PropertyType[] }>('/property-types');
      return res.data.data;
    },
    staleTime: Infinity,
  });

  const { data: ownershipStatuses } = useQuery({
    queryKey: ['ownership-statuses'],
    queryFn: async () => {
      const res = await api.get<{ data: OwnershipStatus[] }>('/ownership-statuses');
      return res.data.data;
    },
    staleTime: Infinity,
  });

  const { data: ownershipTypes } = useQuery({
    queryKey: ['ownership-types'],
    queryFn: async () => {
      const res = await api.get<{ data: OwnershipType[] }>('/ownership-types');
      return res.data.data;
    },
    staleTime: Infinity,
  });

  const selectedOwnershipType = ownershipTypes?.find((ot) => ot.id === watchedOwnershipTypeId);
  const selectedOwnershipStatus = ownershipStatuses?.find((os) => os.id === watchedOwnershipStatusId);
  const requiresCoOwners = !!(selectedOwnershipType?.requires_co_owners);

  const coOwnerTotal = watchedCoOwners.reduce(
    (sum, co) => sum + (co.ownership_percentage || 0),
    0
  );
  const mainOwnerPercentage = Math.max(0, 100 - coOwnerTotal);

  const { data: documentTypes } = useQuery({
    queryKey: ['document-types'],
    queryFn: async () => {
      const res = await api.get<{ data: DocumentType[] }>('/document-types');
      return res.data.data;
    },
    enabled: !!createdProperty,
    staleTime: Infinity,
  });

  const { data: propertyDocumentsResponse, refetch: refetchDocuments } = useQuery({
    queryKey: ['property-documents', createdProperty?.id],
    queryFn: async () => {
      const res = await api.get<
        ApiResponse<{ document_types: DocumentType[]; uploaded: PropertyDocument[] }>
      >(
        `/properties/${createdProperty!.id}/documents`
      );
      return res.data.data;
    },
    enabled: !!createdProperty,
  });

  const applicableDocTypes = useMemo(() => {
    if (!documentTypes) return [];
    return documentTypes.filter((dt) => {
      if (!dt.is_active) return false;
      if (!dt.conditional_on_ownership) return true;
      return dt.conditional_on_ownership === selectedOwnershipStatus?.slug;
    });
  }, [documentTypes, selectedOwnershipStatus]);

  const primaryDocs = applicableDocTypes.filter((dt) => dt.category === 'primary');
  const secondaryDocs = applicableDocTypes.filter((dt) => dt.category === 'secondary');
  const uploadedDocuments = propertyDocumentsResponse?.uploaded ?? [];

  const totalApplicableDocs = applicableDocTypes.length;
  const uploadedOrHandledCount = uploadedDocuments.length;
  const docCompletionPct =
    totalApplicableDocs > 0
      ? Math.round((uploadedOrHandledCount / totalApplicableDocs) * 100)
      : 0;

  const step1FilledFields = [
    watch('property_name')?.length >= 2,
    watchedPropertyTypeId > 0,
    watchedOwnershipStatusId > 0,
    watchedOwnershipTypeId > 0,
  ];
  const step1Pct = Math.round(
    (step1FilledFields.filter(Boolean).length / step1FilledFields.length) * 100
  );

  const overallPct = createdProperty
    ? Math.round((step1Pct + docCompletionPct) / 2)
    : Math.round(step1Pct / 2);

  const createPropertyMutation = useMutation({
    mutationFn: async (data: Step1FormData) => {
      const payload: Record<string, unknown> = {
        property_name: data.property_name,
        property_type_id: data.property_type_id,
        ownership_status_id: data.ownership_status_id,
        ownership_type_id: data.ownership_type_id,
      };
      if (data.division_id) payload.division_id = data.division_id;
      if (data.district_id) payload.district_id = data.district_id;
      if (data.upazila_id) payload.upazila_id = data.upazila_id;
      if (data.mouza_id) payload.mouza_id = data.mouza_id;
      if (data.address) payload.address = data.address;
      if (data.size_value && data.size_unit) {
        payload.size_value = data.size_value;
        payload.size_unit = data.size_unit;
      }
      if (data.description) payload.description = data.description;
      if (data.co_owners && data.co_owners.length > 0) {
        payload.co_owners = data.co_owners;
      }

      const res = await api.post<ApiResponse<Property>>('/properties', payload);
      return res.data.data;
    },
    onSuccess: (property) => {
      setCreatedProperty(property);
      setActiveStep('step-2');
      setStep1Error(null);
      trackPropertyAdded(property.ownership_type?.name ?? 'unknown');
      // Replace history entry so browser back doesn't re-show the creation form with stale data
      router.replace(`/properties/new?created=${property.id}`, { scroll: false });
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setStep1Error(
        axiosErr.response?.data?.message || t('properties:new.createFailed')
      );
    },
  });

  const onStep1Submit = (data: Step1FormData) => {
    if (coOwnerTotal > 100) {
      setStep1Error(
        t('properties:new.coOwnerExceedsError', { total: coOwnerTotal })
      );
      return;
    }

    setStep1Error(null);
    createPropertyMutation.mutate(data);
  };

  const handleDocUploadComplete = () => {
    refetchDocuments();
  };

  const handleFinish = () => {
    if (createdProperty) {
      router.push(`/properties/${createdProperty.id}`);
      toast({
        title: 'Property added! Upload documents to build your readiness score.',
      });
    }
  };

  const getDocForType = (docTypeId: number): PropertyDocument | null => {
    return uploadedDocuments.find((pd) => pd.document_type_id === docTypeId) ?? null;
  };

  return (
    <div className="px-6 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
        <button
          onClick={() => router.push('/properties')}
          className="hover:text-primary transition-all duration-200"
        >
          {t('properties:breadcrumb.properties')}
        </button>
        <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="text-foreground font-medium">{t('properties:breadcrumb.addNew')}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('properties:new.title')}</h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{t('properties:new.percentComplete', { percent: overallPct })}</span>
          <Progress value={overallPct} className="w-32 h-1 rounded-full" />
        </div>
      </div>

      <div className="max-w-3xl">
        <Accordion
          type="single"
          collapsible
          value={activeStep}
          onValueChange={(val) => {
            if (val === 'step-2' && !createdProperty) return;
            setActiveStep(val);
          }}
        >
          <AccordionItem value="step-1" className="border border-border rounded-xl mb-4 px-6">
            <AccordionTrigger className="text-base font-medium hover:no-underline">
              <div className="flex items-center gap-3">
                {createdProperty ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    1
                  </span>
                )}
                {t('properties:new.step1Title')}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6">
                {step1Error && (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                    {step1Error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="property_name">{t('properties:new.propertyNameRequired')}</Label>
                  <Input
                    id="property_name"
                    placeholder={t('properties:new.propertyNamePlaceholder')}
                    {...register('property_name')}
                  />
                  {errors.property_name && (
                    <p className="text-sm text-destructive">{errors.property_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t('properties:new.propertyTypeRequired')}</Label>
                  <Controller
                    name="property_type_id"
                    control={control}
                    render={({ field }) => (
                      <RadioCardGroup
                        options={
                          propertyTypes?.map((pt) => ({
                            value: pt.id.toString(),
                            label: pt.name,
                            icon: getPropertyTypeIcon(pt.slug),
                          })) || []
                        }
                        value={field.value ? field.value.toString() : ''}
                        onValueChange={(val) => field.onChange(Number(val))}
                        columns={3}
                        size="md"
                      />
                    )}
                  />
                  {errors.property_type_id && (
                    <p className="text-sm text-destructive">{errors.property_type_id.message}</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('properties:new.ownershipStatusRequired')}</Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t('properties:new.ownershipStatusDesc')}</p>
                    <Controller
                      name="ownership_status_id"
                      control={control}
                      render={({ field }) => (
                        <RadioCardGroup
                          options={
                            ownershipStatuses?.map((os) => ({
                              value: os.id.toString(),
                              label: os.display_label,
                              description: os.bengali_label || undefined,
                            })) || []
                          }
                          value={field.value ? field.value.toString() : ''}
                          onValueChange={(val) => field.onChange(Number(val))}
                          columns={2}
                          size="sm"
                        />
                      )}
                    />
                    {errors.ownership_status_id && (
                      <p className="text-sm text-destructive">{errors.ownership_status_id.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>{t('properties:new.ownershipTypeRequired')}</Label>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t('properties:new.ownershipTypeDesc')}</p>
                    <Controller
                      name="ownership_type_id"
                      control={control}
                      render={({ field }) => (
                        <RadioCardGroup
                          options={
                            ownershipTypes?.map((ot) => ({
                              value: ot.id.toString(),
                              label: ot.name,
                            })) || []
                          }
                          value={field.value ? field.value.toString() : ''}
                          onValueChange={(val) => field.onChange(Number(val))}
                          columns={2}
                          size="sm"
                        />
                      )}
                    />
                    {errors.ownership_type_id && (
                      <p className="text-sm text-destructive">{errors.ownership_type_id.message}</p>
                    )}
                  </div>
                </div>

                {requiresCoOwners && (
                  <div className="space-y-2">
                    <Label>{t('properties:new.coOwners')}</Label>
                    <Controller
                      name="co_owners"
                      control={control}
                      render={({ field }) => (
                        <CoOwnerFields
                          coOwners={field.value || []}
                          onChange={field.onChange}
                          ownerPercentage={mainOwnerPercentage}
                        />
                      )}
                    />
                    {errors.co_owners && (
                      <p className="text-sm text-destructive">
                        {t('properties:new.fixCoOwnerDetails')}
                      </p>
                    )}
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label className="text-base font-medium">{t('properties:new.locationTitle')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('properties:new.country')}: <span className="font-medium text-foreground">Bangladesh</span>
                  </p>
                  <Controller
                    name="division_id"
                    control={control}
                    render={() => (
                      <LocationCascade
                        value={{
                          division_id: watch('division_id'),
                          district_id: watch('district_id'),
                          upazila_id: watch('upazila_id'),
                          mouza_id: watch('mouza_id'),
                        }}
                        onChange={(loc) => {
                          setValue('division_id', loc.division_id);
                          setValue('district_id', loc.district_id);
                          setValue('upazila_id', loc.upazila_id);
                          setValue('mouza_id', loc.mouza_id);
                        }}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">{t('properties:new.address')}</Label>
                  <Textarea
                    id="address"
                    placeholder={t('properties:new.addressPlaceholder')}
                    rows={2}
                    {...register('address')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size_value">{t('properties:new.size')}</Label>
                    <Input
                      id="size_value"
                      type="number"
                      step="any"
                      placeholder={t('properties:new.sizePlaceholder')}
                      {...register('size_value', {
                        setValueAs: (value) =>
                          value === '' || value === null || value === undefined
                            ? undefined
                            : Number(value),
                      })}
                    />
                    {errors.size_value && (
                      <p className="text-sm text-destructive">{errors.size_value.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{t('properties:new.unitLabel')}</Label>
                    <Controller
                      name="size_unit"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ''}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('properties:new.selectUnit')} />
                          </SelectTrigger>
                          <SelectContent>
                            {SIZE_UNITS.map((u) => (
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

                <div className="space-y-2">
                  <Label htmlFor="description">{t('properties:new.descriptionOptional')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('properties:new.descriptionPlaceholder')}
                    rows={3}
                    {...register('description')}
                  />
                </div>

                <div className="pt-2 space-y-3">
                  {Object.keys(errors).length > 0 && (
                    <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                      Please fill in all required fields above ({Object.keys(errors).length}{' '}
                      {Object.keys(errors).length === 1 ? 'field needs' : 'fields need'} attention)
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-primary text-primary-foreground rounded-lg transition-all duration-200"
                    disabled={createPropertyMutation.isPending}
                  >
                    {createPropertyMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {t('properties:new.creating')}
                      </>
                    ) : (
                      t('properties:new.saveAndContinue')
                    )}
                  </Button>
                </div>
              </form>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="step-2"
            className={`border border-border rounded-xl px-6 ${!createdProperty ? 'opacity-50' : ''}`}
            disabled={!createdProperty}
          >
            <AccordionTrigger className="text-base font-medium hover:no-underline">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                    createdProperty
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  2
                </span>
                {t('properties:new.step2Title')}
                {createdProperty && totalApplicableDocs > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({uploadedOrHandledCount}/{totalApplicableDocs})
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              {createdProperty && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {t('properties:new.docCompletion', { percent: docCompletionPct })}
                    </span>
                    <Progress value={docCompletionPct} className="flex-1 h-1 rounded-full" />
                  </div>

                  {primaryDocs.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-base font-medium text-foreground">{t('properties:new.primaryDocuments')}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('properties:new.primaryDocsDesc')}
                      </p>
                      <div className="space-y-3">
                        {primaryDocs.map((dt) => (
                          <DocumentUploadItem
                            key={dt.id}
                            documentType={dt}
                            uploadedDocument={getDocForType(dt.id)}
                            propertyId={createdProperty.id}
                            onUploadComplete={handleDocUploadComplete}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {secondaryDocs.length > 0 && (
                    <div className="space-y-3">
                      <Separator />
                      <h3 className="text-base font-medium text-foreground">{t('properties:new.secondaryDocuments')}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('properties:new.secondaryDocsDesc')}
                      </p>
                      <div className="space-y-3">
                        {secondaryDocs.map((dt) => (
                          <DocumentUploadItem
                            key={dt.id}
                            documentType={dt}
                            uploadedDocument={getDocForType(dt.id)}
                            propertyId={createdProperty.id}
                            onUploadComplete={handleDocUploadComplete}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {applicableDocTypes.length === 0 && (
                    <p className="text-sm text-muted-foreground py-4">
                      {t('properties:new.noDocTypes')}
                    </p>
                  )}

                  <div className="pt-4">
                    <Button
                      type="button"
                      className="w-full sm:w-auto bg-primary text-primary-foreground rounded-lg transition-all duration-200"
                      onClick={handleFinish}
                    >
                      {t('properties:new.finish')}
                    </Button>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
