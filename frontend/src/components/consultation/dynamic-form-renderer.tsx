'use client';

import { useState, FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
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
import type { ApiResponse } from '@/types';

export interface ConsultationFormField {
  id: number;
  field_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number';
  field_label: string;
  field_name: string;
  field_options: string[] | null;
  help_text: string | null;
  is_required: boolean;
  sort_order: number;
}

export interface ConsultationFormTemplate {
  id: number;
  name: string;
  description: string;
  fields: ConsultationFormField[];
}

interface DynamicFormRendererProps {
  template: ConsultationFormTemplate;
  ticketId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DynamicFormRenderer({
  template,
  ticketId,
  onSuccess,
  onCancel,
}: DynamicFormRendererProps) {
  const queryClient = useQueryClient();
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Validate required fields
      const newErrors: Record<string, string> = {};
      template.fields.forEach((field) => {
        if (field.is_required && !responses[field.field_name]) {
          newErrors[field.field_name] = `${field.field_label} is required`;
        }
      });

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        throw new Error('Please fill all required fields');
      }

      const res = await api.post<ApiResponse<unknown>>(
        `/consultation-forms/tickets/${ticketId}/submit`,
        {
          template_id: template.id,
          responses,
        }
      );
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['consultant-ticket', ticketId] });
      await queryClient.invalidateQueries({ queryKey: ['ticket-responses', ticketId] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    submitMutation.mutate();
  };

  const handleFieldChange = (fieldName: string, value: string | string[]) => {
    setResponses((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (fieldName: string, option: string, checked: boolean) => {
    const currentValues = (responses[fieldName] as string[]) || [];
    const newValues = checked
      ? [...currentValues, option]
      : currentValues.filter((v) => v !== option);
    handleFieldChange(fieldName, newValues);
  };

  const renderField = (field: ConsultationFormField) => {
    const fieldValue = responses[field.field_name] || '';
    const fieldError = errors[field.field_name];

    switch (field.field_type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-wisebox-status-danger ml-1">*</span>}
            </Label>
            {field.help_text && (
              <p className="text-xs text-wisebox-text-secondary">{field.help_text}</p>
            )}
            <Input
              id={field.field_name}
              value={fieldValue as string}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              className={fieldError ? 'border-wisebox-status-danger' : ''}
            />
            {fieldError && <p className="text-xs text-wisebox-status-danger">{fieldError}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-wisebox-status-danger ml-1">*</span>}
            </Label>
            {field.help_text && (
              <p className="text-xs text-wisebox-text-secondary">{field.help_text}</p>
            )}
            <Textarea
              id={field.field_name}
              rows={4}
              value={fieldValue as string}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              className={fieldError ? 'border-wisebox-status-danger' : ''}
            />
            {fieldError && <p className="text-xs text-wisebox-status-danger">{fieldError}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-wisebox-status-danger ml-1">*</span>}
            </Label>
            {field.help_text && (
              <p className="text-xs text-wisebox-text-secondary">{field.help_text}</p>
            )}
            <Input
              id={field.field_name}
              type="number"
              value={fieldValue as string}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              className={fieldError ? 'border-wisebox-status-danger' : ''}
            />
            {fieldError && <p className="text-xs text-wisebox-status-danger">{fieldError}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-wisebox-status-danger ml-1">*</span>}
            </Label>
            {field.help_text && (
              <p className="text-xs text-wisebox-text-secondary">{field.help_text}</p>
            )}
            <Input
              id={field.field_name}
              type="date"
              value={fieldValue as string}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              className={fieldError ? 'border-wisebox-status-danger' : ''}
            />
            {fieldError && <p className="text-xs text-wisebox-status-danger">{fieldError}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.field_name}>
              {field.field_label}
              {field.is_required && <span className="text-wisebox-status-danger ml-1">*</span>}
            </Label>
            {field.help_text && (
              <p className="text-xs text-wisebox-text-secondary">{field.help_text}</p>
            )}
            <Select
              value={fieldValue as string}
              onValueChange={(value) => handleFieldChange(field.field_name, value)}
            >
              <SelectTrigger className={fieldError ? 'border-wisebox-status-danger' : ''}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {field.field_options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError && <p className="text-xs text-wisebox-status-danger">{fieldError}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.field_label}
              {field.is_required && <span className="text-wisebox-status-danger ml-1">*</span>}
            </Label>
            {field.help_text && (
              <p className="text-xs text-wisebox-text-secondary mb-2">{field.help_text}</p>
            )}
            <div className="space-y-2">
              {field.field_options?.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={field.field_name}
                    value={option}
                    checked={fieldValue === option}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    className="w-4 h-4 text-wisebox-primary-500"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
            {fieldError && <p className="text-xs text-wisebox-status-danger mt-1">{fieldError}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.field_label}
              {field.is_required && <span className="text-wisebox-status-danger ml-1">*</span>}
            </Label>
            {field.help_text && (
              <p className="text-xs text-wisebox-text-secondary mb-2">{field.help_text}</p>
            )}
            <div className="space-y-2">
              {field.field_options?.map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={((fieldValue as string[]) || []).includes(option)}
                    onChange={(e) => handleCheckboxChange(field.field_name, option, e.target.checked)}
                    className="w-4 h-4 text-wisebox-primary-500 rounded"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
            {fieldError && <p className="text-xs text-wisebox-status-danger mt-1">{fieldError}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  if (submitMutation.isSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-wisebox-status-success mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-wisebox-text-primary mb-2">
          Form Submitted Successfully!
        </h3>
        <p className="text-sm text-wisebox-text-secondary mb-4">
          Your consultation form has been saved to the property record.
        </p>
        <Button onClick={() => onSuccess?.()} className="bg-wisebox-primary-500">
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-wisebox-text-primary">{template.name}</h2>
        {template.description && (
          <p className="text-sm text-wisebox-text-secondary mt-1">{template.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {template.fields.map((field) => renderField(field))}
      </div>

      {submitMutation.error && (
        <div className="p-3 rounded-md bg-wisebox-status-danger/10 border border-wisebox-status-danger/20">
          <p className="text-sm text-wisebox-status-danger">
            {(submitMutation.error as Error).message || 'Failed to submit form. Please try again.'}
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitMutation.isPending}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={submitMutation.isPending}
          className="bg-wisebox-primary-500 hover:bg-wisebox-primary-600"
        >
          {submitMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Form'
          )}
        </Button>
      </div>
    </form>
  );
}
