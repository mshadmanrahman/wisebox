'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  land: <Tractor className="h-6 w-6" />,
  apartment: <Building2 className="h-6 w-6" />,
  commercial: <Store className="h-6 w-6" />,
  agricultural: <Tractor className="h-6 w-6" />,
  industrial: <Factory className="h-6 w-6" />,
  residential: <Home className="h-6 w-6" />,
};

const coOwnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  ownership_percentage: z.number().min(1, 'Must be at least 1%').max(99, 'Must be under 100%'),
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
  return PROPERTY_TYPE_ICONS[slug] || <Home className="h-6 w-6" />;
}

export default function AddPropertyPage() {
  const router = useRouter();
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
  const requiresCoOwners = selectedOwnershipType?.requires_co_owners ?? false;

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
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setStep1Error(
        axiosErr.response?.data?.message || 'Failed to create property. Please try again.'
      );
    },
  });

  const onStep1Submit = (data: Step1FormData) => {
    setStep1Error(null);
    createPropertyMutation.mutate(data);
  };

  const handleDocUploadComplete = () => {
    refetchDocuments();
  };

  const handleFinish = () => {
    if (createdProperty) {
      router.push(`/properties/${createdProperty.id}`);
    }
  };

  const getDocForType = (docTypeId: number): PropertyDocument | null => {
    return uploadedDocuments.find((pd) => pd.document_type_id === docTypeId) ?? null;
  };

  return (
    <div className="px-6 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <button
          onClick={() => router.push('/properties')}
          className="hover:text-teal-600 transition-colors"
        >
          Properties
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 font-medium">Add New</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Property</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>{overallPct}% complete</span>
          <Progress value={overallPct} className="w-32 h-2" />
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
          <AccordionItem value="step-1" className="border rounded-lg mb-4 px-6">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              <div className="flex items-center gap-3">
                {createdProperty ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-600" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-bold">
                    1
                  </span>
                )}
                Property &amp; Ownership
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6">
                {step1Error && (
                  <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {step1Error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="property_name">Property Name *</Label>
                  <Input
                    id="property_name"
                    placeholder="e.g. Family Home in Dhaka"
                    {...register('property_name')}
                  />
                  {errors.property_name && (
                    <p className="text-sm text-red-500">{errors.property_name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Property Type *</Label>
                  <Controller
                    name="property_type_id"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {propertyTypes?.map((pt) => (
                          <button
                            key={pt.id}
                            type="button"
                            onClick={() => field.onChange(pt.id)}
                            className={`
                              flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all
                              ${
                                field.value === pt.id
                                  ? 'border-teal-500 ring-2 ring-teal-200 bg-teal-50'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }
                            `}
                          >
                            <span
                              className={
                                field.value === pt.id ? 'text-teal-600' : 'text-gray-400'
                              }
                            >
                              {getPropertyTypeIcon(pt.slug)}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                field.value === pt.id ? 'text-teal-700' : 'text-gray-700'
                              }`}
                            >
                              {pt.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                  {errors.property_type_id && (
                    <p className="text-sm text-red-500">{errors.property_type_id.message}</p>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ownership Status *</Label>
                    <Controller
                      name="ownership_status_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ? field.value.toString() : ''}
                          onValueChange={(val) => field.onChange(Number(val))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="How did you acquire it?" />
                          </SelectTrigger>
                          <SelectContent>
                            {ownershipStatuses?.map((os) => (
                              <SelectItem key={os.id} value={os.id.toString()}>
                                {os.display_label}
                                {os.bengali_label ? ` (${os.bengali_label})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.ownership_status_id && (
                      <p className="text-sm text-red-500">{errors.ownership_status_id.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Ownership Type *</Label>
                    <Controller
                      name="ownership_type_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ? field.value.toString() : ''}
                          onValueChange={(val) => field.onChange(Number(val))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sole, Joint, or Co-Ownership?" />
                          </SelectTrigger>
                          <SelectContent>
                            {ownershipTypes?.map((ot) => (
                              <SelectItem key={ot.id} value={ot.id.toString()}>
                                {ot.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.ownership_type_id && (
                      <p className="text-sm text-red-500">{errors.ownership_type_id.message}</p>
                    )}
                  </div>
                </div>

                {requiresCoOwners && (
                  <div className="space-y-2">
                    <Label>Co-Owners</Label>
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
                      <p className="text-sm text-red-500">
                        Please fix co-owner details above.
                      </p>
                    )}
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <Label className="text-base font-medium">Location</Label>
                  <p className="text-sm text-gray-500">Country: Bangladesh</p>
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
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Street address, house number, etc."
                    rows={2}
                    {...register('address')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="size_value">Size</Label>
                    <Input
                      id="size_value"
                      type="number"
                      step="any"
                      placeholder="e.g. 1200"
                      {...register('size_value', {
                        setValueAs: (value) =>
                          value === '' || value === null || value === undefined
                            ? undefined
                            : Number(value),
                      })}
                    />
                    {errors.size_value && (
                      <p className="text-sm text-red-500">{errors.size_value.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Controller
                      name="size_unit"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value ?? ''}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select unit" />
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
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Any additional details about this property..."
                    rows={3}
                    {...register('description')}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
                    disabled={createPropertyMutation.isPending}
                  >
                    {createPropertyMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Save & Continue'
                    )}
                  </Button>
                </div>
              </form>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="step-2"
            className={`border rounded-lg px-6 ${!createdProperty ? 'opacity-50' : ''}`}
            disabled={!createdProperty}
          >
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    createdProperty
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  2
                </span>
                Upload Documents
                {createdProperty && totalApplicableDocs > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({uploadedOrHandledCount}/{totalApplicableDocs})
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-6">
              {createdProperty && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Document completion: {docCompletionPct}%
                    </span>
                    <Progress value={docCompletionPct} className="flex-1 h-2" />
                  </div>

                  {primaryDocs.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900">Primary Documents</h3>
                      <p className="text-sm text-gray-500">
                        Essential documents for property verification.
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
                      <h3 className="text-lg font-semibold text-gray-900">Secondary Documents</h3>
                      <p className="text-sm text-gray-500">
                        Supporting documents that improve your property score.
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
                    <p className="text-sm text-gray-500 py-4">
                      No document types available for this property configuration.
                    </p>
                  )}

                  <div className="pt-4">
                    <Button
                      type="button"
                      className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700"
                      onClick={handleFinish}
                    >
                      Finish
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
