'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Division, District, Upazila, Mouza } from '@/types';

interface LocationCascadeProps {
  value: {
    division_id?: number;
    district_id?: number;
    upazila_id?: number;
    mouza_id?: number;
    mouza_name?: string;
  };
  onChange: (location: {
    division_id?: number;
    district_id?: number;
    upazila_id?: number;
    mouza_id?: number;
    mouza_name?: string;
  }) => void;
}

export function LocationCascade({ value, onChange }: LocationCascadeProps) {
  const { t, i18n } = useTranslation('properties');
  const isBn = i18n.language === 'bn';
  const [manualMouza, setManualMouza] = useState(false);

  const { data: divisions, isLoading: divisionsLoading } = useQuery({
    queryKey: ['locations', 'divisions'],
    queryFn: async () => {
      const res = await api.get<{ data: Division[] }>('/locations/divisions');
      return res.data.data;
    },
    staleTime: Infinity,
  });

  const { data: districts, isLoading: districtsLoading } = useQuery({
    queryKey: ['locations', 'districts', value.division_id],
    queryFn: async () => {
      const res = await api.get<{ data: District[] }>('/locations/districts', {
        params: { division_id: value.division_id },
      });
      return res.data.data;
    },
    enabled: !!value.division_id,
    staleTime: Infinity,
  });

  const { data: upazilas, isLoading: upazilasLoading } = useQuery({
    queryKey: ['locations', 'upazilas', value.district_id],
    queryFn: async () => {
      const res = await api.get<{ data: Upazila[] }>('/locations/upazilas', {
        params: { district_id: value.district_id },
      });
      return res.data.data;
    },
    enabled: !!value.district_id,
    staleTime: Infinity,
  });

  const { data: mouzas, isLoading: mouzasLoading } = useQuery({
    queryKey: ['locations', 'mouzas', value.upazila_id],
    queryFn: async () => {
      const res = await api.get<{ data: Mouza[] }>('/locations/mouzas', {
        params: { upazila_id: value.upazila_id },
      });
      return res.data.data;
    },
    enabled: !!value.upazila_id,
    staleTime: Infinity,
  });
  const hasMouzaOptions = (mouzas?.length ?? 0) > 0;

  const handleDivisionChange = (divisionId: string) => {
    onChange({
      division_id: Number(divisionId),
      district_id: undefined,
      upazila_id: undefined,
      mouza_id: undefined,
    });
  };

  const handleDistrictChange = (districtId: string) => {
    onChange({
      ...value,
      district_id: Number(districtId),
      upazila_id: undefined,
      mouza_id: undefined,
    });
  };

  const handleUpazilaChange = (upazilaId: string) => {
    onChange({
      ...value,
      upazila_id: Number(upazilaId),
      mouza_id: undefined,
    });
  };

  const handleMouzaChange = (mouzaId: string) => {
    onChange({
      ...value,
      mouza_id: Number(mouzaId),
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label>{t('locationCascade.division')}</Label>
        <Select
          value={value.division_id?.toString() ?? ''}
          onValueChange={handleDivisionChange}
          disabled={divisionsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={divisionsLoading ? t('locationCascade.loading') : t('locationCascade.selectDivision')} />
          </SelectTrigger>
          <SelectContent>
            {divisions?.map((div) => (
              <SelectItem key={div.id} value={div.id.toString()}>
                {isBn && div.bn_name ? div.bn_name : div.name}
                {isBn && div.bn_name ? ` (${div.name})` : div.bn_name ? ` (${div.bn_name})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('locationCascade.district')}</Label>
        <Select
          value={value.district_id?.toString() ?? ''}
          onValueChange={handleDistrictChange}
          disabled={!value.division_id || districtsLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !value.division_id
                  ? t('locationCascade.selectDivisionFirst')
                  : districtsLoading
                    ? t('locationCascade.loading')
                    : t('locationCascade.selectDistrict')
              }
            />
          </SelectTrigger>
          <SelectContent>
            {districts?.map((dist) => (
              <SelectItem key={dist.id} value={dist.id.toString()}>
                {isBn && dist.bn_name ? dist.bn_name : dist.name}
                {isBn && dist.bn_name ? ` (${dist.name})` : dist.bn_name ? ` (${dist.bn_name})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('locationCascade.upazila')}</Label>
        <Select
          value={value.upazila_id?.toString() ?? ''}
          onValueChange={handleUpazilaChange}
          disabled={!value.district_id || upazilasLoading}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={
                !value.district_id
                  ? t('locationCascade.selectDistrictFirst')
                  : upazilasLoading
                    ? t('locationCascade.loading')
                    : t('locationCascade.selectUpazila')
              }
            />
          </SelectTrigger>
          <SelectContent>
            {upazilas?.map((upz) => (
              <SelectItem key={upz.id} value={upz.id.toString()}>
                {isBn && upz.bn_name ? upz.bn_name : upz.name}
                {isBn && upz.bn_name ? ` (${upz.name})` : upz.bn_name ? ` (${upz.bn_name})` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('locationCascade.mouza')}</Label>
        {/* Show text input when no mouza options or user toggles manual entry */}
        {(manualMouza || (!mouzasLoading && value.upazila_id && !hasMouzaOptions)) ? (
          <div className="space-y-1">
            <Input
              placeholder="Type mouza name manually"
              value={value.mouza_name ?? ''}
              onChange={(e) => onChange({ ...value, mouza_id: undefined, mouza_name: e.target.value })}
              disabled={!value.upazila_id}
            />
            {hasMouzaOptions && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => { setManualMouza(false); onChange({ ...value, mouza_name: undefined }); }}
              >
                Select from list instead
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <Select
              value={value.mouza_id?.toString() ?? ''}
              onValueChange={handleMouzaChange}
              disabled={!value.upazila_id || mouzasLoading}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !value.upazila_id
                      ? t('locationCascade.selectUpazilaFirst')
                      : mouzasLoading
                        ? t('locationCascade.loading')
                        : t('locationCascade.selectMouza')
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {mouzas?.map((mz) => (
                  <SelectItem key={mz.id} value={mz.id.toString()}>
                    {isBn && mz.bn_name ? mz.bn_name : mz.name}
                    {isBn && mz.bn_name ? ` (${mz.name})` : mz.bn_name ? ` (${mz.bn_name})` : ''}
                    {mz.jl_number ? ` - JL ${mz.jl_number}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasMouzaOptions && (
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => setManualMouza(true)}
              >
                Type manually instead
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
