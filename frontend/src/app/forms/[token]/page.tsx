'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, Loader2, AlertCircle, Clock } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface FormField {
  id: number;
  field_type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number';
  field_label: string;
  field_name: string;
  field_options: string[] | null;
  help_text: string | null;
  is_required: boolean;
  sort_order: number;
}

interface FormTemplate {
  id: number;
  name: string;
  description: string;
  fields: FormField[];
}

interface FormData {
  template: FormTemplate;
  ticket_number: string;
  property_name: string;
  customer_email: string;
  expires_at: string;
  prefill?: Record<string, string>;
}

type PageState = 'loading' | 'form' | 'submitting' | 'success' | 'error';

interface ErrorInfo {
  message: string;
  code: string;
}

export default function PublicFormPage() {
  const params = useParams();
  const token = params.token as string;

  const [pageState, setPageState] = useState<PageState>('loading');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<Record<string, string | string[]>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);

  // Fetch form data on mount
  useEffect(() => {
    fetchFormData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchFormData() {
    try {
      const res = await fetch(`${API_URL}/public-forms/${token}`);
      const json = await res.json();

      if (!res.ok) {
        setErrorInfo({
          message: json.message || 'Something went wrong.',
          code: json.error_code || 'unknown',
        });
        setPageState('error');
        return;
      }

      setFormData(json.data);

      // Pre-fill responses from existing property data
      if (json.data.prefill) {
        const fieldNames = new Set(json.data.template.fields.map((f: FormField) => f.field_name));
        const initial: Record<string, string> = {};
        for (const [key, value] of Object.entries(json.data.prefill)) {
          if (fieldNames.has(key) && value) {
            initial[key] = value as string;
          }
        }
        setResponses(initial);
      }

      setPageState('form');
    } catch {
      setErrorInfo({
        message: 'Unable to load the form. Please check your internet connection and try again.',
        code: 'network_error',
      });
      setPageState('error');
    }
  }

  function handleFieldChange(fieldName: string, value: string | string[]) {
    setResponses((prev) => ({ ...prev, [fieldName]: value }));
    if (fieldErrors[fieldName]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  }

  function handleCheckboxChange(fieldName: string, option: string, checked: boolean) {
    const currentValues = (responses[fieldName] as string[]) || [];
    const newValues = checked
      ? [...currentValues, option]
      : currentValues.filter((v) => v !== option);
    handleFieldChange(fieldName, newValues);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formData) return;

    // Client-side validation
    const newErrors: Record<string, string> = {};
    formData.template.fields.forEach((field) => {
      if (field.is_required) {
        const val = responses[field.field_name];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          newErrors[field.field_name] = `${field.field_label} is required`;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setPageState('submitting');

    try {
      const res = await fetch(`${API_URL}/public-forms/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ responses }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.missing_fields) {
          const errors: Record<string, string> = {};
          (json.missing_fields as string[]).forEach((f) => {
            errors[f] = 'This field is required';
          });
          setFieldErrors(errors);
          setPageState('form');
          return;
        }
        setErrorInfo({
          message: json.message || 'Failed to submit form.',
          code: json.error_code || 'submit_error',
        });
        setPageState('error');
        return;
      }

      setPageState('success');
    } catch {
      setErrorInfo({
        message: 'Unable to submit the form. Please check your connection and try again.',
        code: 'network_error',
      });
      setPageState('error');
    }
  }

  function renderField(field: FormField) {
    const value = responses[field.field_name] || '';
    const error = fieldErrors[field.field_name];
    const baseInputClass =
      'w-full rounded-lg border bg-[#1a1f2e] text-white px-4 py-3 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors';
    const errorBorderClass = error ? 'border-red-500' : 'border-gray-700';

    switch (field.field_type) {
      case 'text':
        return (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.field_name} className="block text-sm font-medium text-gray-200">
              {field.field_label}
              {field.is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.help_text && <p className="text-xs text-gray-400">{field.help_text}</p>}
            <input
              id={field.field_name}
              type="text"
              value={value as string}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              className={`${baseInputClass} ${errorBorderClass}`}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.field_name} className="block text-sm font-medium text-gray-200">
              {field.field_label}
              {field.is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.help_text && <p className="text-xs text-gray-400">{field.help_text}</p>}
            <textarea
              id={field.field_name}
              rows={4}
              value={value as string}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              className={`${baseInputClass} ${errorBorderClass} resize-y`}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        );

      case 'number':
        return (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.field_name} className="block text-sm font-medium text-gray-200">
              {field.field_label}
              {field.is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.help_text && <p className="text-xs text-gray-400">{field.help_text}</p>}
            <input
              id={field.field_name}
              type="number"
              value={value as string}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              className={`${baseInputClass} ${errorBorderClass}`}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.field_name} className="block text-sm font-medium text-gray-200">
              {field.field_label}
              {field.is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.help_text && <p className="text-xs text-gray-400">{field.help_text}</p>}
            <input
              id={field.field_name}
              type="date"
              value={value as string}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              className={`${baseInputClass} ${errorBorderClass}`}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.field_name} className="block text-sm font-medium text-gray-200">
              {field.field_label}
              {field.is_required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.help_text && <p className="text-xs text-gray-400">{field.help_text}</p>}
            <select
              id={field.field_name}
              value={value as string}
              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
              className={`${baseInputClass} ${errorBorderClass}`}
            >
              <option value="">Select an option</option>
              {field.field_options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        );

      case 'radio':
        return (
          <div key={field.id} className="space-y-2">
            <span className="block text-sm font-medium text-gray-200">
              {field.field_label}
              {field.is_required && <span className="text-red-400 ml-1">*</span>}
            </span>
            {field.help_text && <p className="text-xs text-gray-400">{field.help_text}</p>}
            <div className="space-y-2 pt-1">
              {field.field_options?.map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name={field.field_name}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                    className="w-4 h-4 text-emerald-500 border-gray-600 focus:ring-emerald-500/50"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="space-y-2">
            <span className="block text-sm font-medium text-gray-200">
              {field.field_label}
              {field.is_required && <span className="text-red-400 ml-1">*</span>}
            </span>
            {field.help_text && <p className="text-xs text-gray-400">{field.help_text}</p>}
            <div className="space-y-2 pt-1">
              {field.field_options?.map((option) => (
                <label key={option} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={((value as string[]) || []).includes(option)}
                    onChange={(e) => handleCheckboxChange(field.field_name, option, e.target.checked)}
                    className="w-4 h-4 text-emerald-500 border-gray-600 rounded focus:ring-emerald-500/50"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  }

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-[#0f1219] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading your form...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (pageState === 'error' && errorInfo) {
    const isExpired = errorInfo.code === 'expired';
    const isCompleted = errorInfo.code === 'already_completed';

    return (
      <div className="min-h-screen bg-[#0f1219] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#151a27] rounded-2xl border border-gray-800 p-8 text-center">
          {isExpired ? (
            <Clock className="h-16 w-16 text-amber-400 mx-auto mb-4" />
          ) : isCompleted ? (
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          ) : (
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          )}
          <h2 className="text-xl font-semibold text-white mb-2">
            {isExpired
              ? 'Form Expired'
              : isCompleted
                ? 'Already Completed'
                : 'Something Went Wrong'}
          </h2>
          <p className="text-gray-400 text-sm">
            {errorInfo.message}
          </p>
          {(isExpired || errorInfo.code === 'not_found') && (
            <p className="text-gray-500 text-xs mt-4">
              Please contact your consultant to request a new form link.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Success state
  if (pageState === 'success') {
    return (
      <div className="min-h-screen bg-[#0f1219] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-[#151a27] rounded-2xl border border-gray-800 p-8 text-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Form Submitted Successfully!
          </h2>
          <p className="text-gray-400 text-sm mb-2">
            Thank you for completing the form. Your consultant has been notified and will review your responses.
          </p>
          <p className="text-gray-500 text-xs">
            You can safely close this page.
          </p>
        </div>
      </div>
    );
  }

  // Form state
  if (!formData) return null;

  const sortedFields = [...formData.template.fields].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="min-h-screen bg-[#0f1219] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-1">Wisebox</h1>
          <p className="text-gray-500 text-sm">Property Consultation Form</p>
        </div>

        {/* Ticket info banner */}
        <div className="bg-[#151a27] rounded-xl border border-gray-800 p-4 mb-6">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500">Ticket:</span>{' '}
              <span className="text-white font-medium">{formData.ticket_number}</span>
            </div>
            <div>
              <span className="text-gray-500">Property:</span>{' '}
              <span className="text-white font-medium">{formData.property_name}</span>
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-[#151a27] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">{formData.template.name}</h2>
            {formData.template.description && (
              <p className="text-sm text-gray-400 mt-1">{formData.template.description}</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {sortedFields.map((field) => renderField(field))}

            {Object.keys(fieldErrors).length > 0 && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                <p className="text-sm text-red-400">Please fill in all required fields before submitting.</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-800">
              <button
                type="submit"
                disabled={pageState === 'submitting'}
                className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 text-sm transition-colors flex items-center justify-center gap-2"
              >
                {pageState === 'submitting' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Form'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          Powered by Wisebox. Your responses are securely stored.
        </p>
      </div>
    </div>
  );
}
