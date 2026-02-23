'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, AlertTriangle } from 'lucide-react';

const RELATIONSHIPS = ['Parent', 'Sibling', 'Spouse', 'Child', 'Other'] as const;

interface CoOwnerEntry {
  name: string;
  relationship: string;
  ownership_percentage: number;
  phone: string;
  email: string;
}

interface CoOwnerFieldsProps {
  coOwners: CoOwnerEntry[];
  onChange: (coOwners: CoOwnerEntry[]) => void;
  ownerPercentage: number;
}

export function CoOwnerFields({ coOwners, onChange, ownerPercentage }: CoOwnerFieldsProps) {
  const { t } = useTranslation('properties');
  const totalCoOwnerPercentage = coOwners.reduce((sum, co) => sum + (co.ownership_percentage || 0), 0);
  const exceeds100 = totalCoOwnerPercentage > 100;

  const addCoOwner = () => {
    onChange([
      ...coOwners,
      { name: '', relationship: '', ownership_percentage: 0, phone: '', email: '' },
    ]);
  };

  const removeCoOwner = (index: number) => {
    onChange(coOwners.filter((_, i) => i !== index));
  };

  const updateCoOwner = (index: number, field: keyof CoOwnerEntry, value: string | number) => {
    const updated = coOwners.map((co, i) => {
      if (i !== index) return co;
      return { ...co, [field]: value };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-wisebox-primary-50 px-4 py-3">
        <span className="text-sm font-medium text-wisebox-primary-800">
          {t('coOwnerFields.yourOwnership', { percent: ownerPercentage })}
        </span>
        {exceeds100 && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-amber-700">
            <AlertTriangle className="h-4 w-4" />
            {t('coOwnerFields.totalExceeds')}
          </span>
        )}
      </div>

      {coOwners.map((coOwner, index) => (
        <div
          key={index}
          className="relative rounded-lg border border-wisebox-border bg-wisebox-background-card p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-wisebox-text-secondary">
              {t('coOwnerFields.coOwnerIndex', { index: index + 1 })}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-wisebox-text-muted hover:text-red-500"
              onClick={() => removeCoOwner(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{t('coOwnerFields.nameRequired')}</Label>
              <Input
                placeholder={t('coOwnerFields.fullName')}
                value={coOwner.name}
                onChange={(e) => updateCoOwner(index, 'name', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t('coOwnerFields.relationshipRequired')}</Label>
              <Select
                value={coOwner.relationship}
                onValueChange={(val) => updateCoOwner(index, 'relationship', val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('coOwnerFields.selectRelationship')} />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIPS.map((rel) => (
                    <SelectItem key={rel} value={rel}>
                      {t(`coOwnerFields.relationships.${rel}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t('coOwnerFields.ownershipRequired')}</Label>
              <Input
                type="number"
                min={1}
                max={100}
                placeholder={t('coOwnerFields.ownershipPlaceholder')}
                value={coOwner.ownership_percentage || ''}
                onChange={(e) =>
                  updateCoOwner(index, 'ownership_percentage', Number(e.target.value))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{t('coOwnerFields.phone')}</Label>
              <Input
                type="tel"
                placeholder="+880..."
                value={coOwner.phone}
                onChange={(e) => updateCoOwner(index, 'phone', e.target.value)}
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs">{t('coOwnerFields.email')}</Label>
              <Input
                type="email"
                placeholder="email@example.com"
                value={coOwner.email}
                onChange={(e) => updateCoOwner(index, 'email', e.target.value)}
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full border-dashed"
        onClick={addCoOwner}
      >
        <Plus className="h-4 w-4 mr-1.5" />
        {t('coOwnerFields.addCoOwner')}
      </Button>
    </div>
  );
}
