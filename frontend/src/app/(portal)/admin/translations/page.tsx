'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Languages, Search, ChevronLeft, ChevronRight, Pencil, Check, X, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const NAMESPACES = [
  'common', 'auth', 'dashboard', 'properties', 'tickets',
  'orders', 'settings', 'notifications', 'consultant', 'admin', 'forms',
] as const;

interface TranslationLocale {
  id: number;
  value: string;
  updated_at: string;
}

interface TranslationRow {
  key: string;
  namespace: string;
  en: TranslationLocale;
  bn: TranslationLocale | null;
}

interface PaginatedResponse {
  data: TranslationRow[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

function InlineEditCell({
  value,
  translationId,
  onSave,
  isSaving,
}: {
  value: string;
  translationId: number | null;
  onSave: (id: number, value: string) => void;
  isSaving: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = useCallback(() => {
    if (translationId === null) return;
    if (editValue.trim() === value) {
      setIsEditing(false);
      return;
    }
    onSave(translationId, editValue.trim());
    setIsEditing(false);
  }, [translationId, editValue, value, onSave]);

  const handleCancel = useCallback(() => {
    setEditValue(value);
    setIsEditing(false);
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  if (translationId === null) {
    return (
      <span className="text-slate-400 italic text-sm">No translation</span>
    );
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Delay to allow button mouseDown to fire first
            setTimeout(() => {
              if (isEditing) handleSave();
            }, 150);
          }}
          className="h-8 text-sm bg-white border-slate-300 text-slate-900"
          disabled={isSaving}
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="p-1 text-green-600 hover:text-green-700"
          tabIndex={-1}
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleCancel();
          }}
          className="p-1 text-slate-400 hover:text-slate-600"
          tabIndex={-1}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="group flex items-center gap-1.5 text-left w-full min-h-[32px] px-2 py-1 -mx-2 rounded hover:bg-slate-100 transition-colors"
    >
      <span className="text-sm text-slate-700 break-words flex-1">{value}</span>
      <Pencil className="h-3 w-3 text-slate-400 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
    </button>
  );
}

export default function AdminTranslationsPage() {
  const { t } = useTranslation('admin');
  const queryClient = useQueryClient();

  const [namespace, setNamespace] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }, []);

  const handleNamespaceChange = useCallback((value: string) => {
    setNamespace(value);
    setPage(1);
  }, []);

  const queryKey = ['admin', 'translations', namespace, debouncedSearch, page];

  const { data, isLoading, isFetching } = useQuery<PaginatedResponse>({
    queryKey,
    queryFn: async () => {
      const params: Record<string, string | number> = { page, per_page: 50 };
      if (namespace !== 'all') params.ns = namespace;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await api.get('/admin/translations', { params });
      return res.data;
    },
    staleTime: 60_000,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, value }: { id: number; value: string }) => {
      const res = await api.put(`/admin/translations/${id}`, { value });
      return res.data;
    },
    onMutate: async ({ id, value }) => {
      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<PaginatedResponse>(queryKey);

      queryClient.setQueryData<PaginatedResponse>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((row) => {
            if (row.en.id === id) {
              return { ...row, en: { ...row.en, value, updated_at: new Date().toISOString() } };
            }
            if (row.bn?.id === id) {
              return { ...row, bn: { ...row.bn, value, updated_at: new Date().toISOString() } };
            }
            return row;
          }),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      queryClient.invalidateQueries({ queryKey: ['admin', 'translations'] });
    },
  });

  const handleSave = useCallback(
    (id: number, value: string) => {
      updateMutation.mutate({ id, value });
    },
    [updateMutation]
  );

  const translations = data?.data ?? [];
  const totalPages = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Languages className="h-6 w-6 text-indigo-500" />
          <h1 className="text-3xl font-bold text-slate-900">
            {t('translations.title', 'Translations')}
          </h1>
        </div>
        <p className="text-slate-600">
          {t('translations.subtitle', 'Manage English and Bangla translations for all UI strings.')}
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-48">
              <Select value={namespace} onValueChange={handleNamespaceChange}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                  <SelectValue placeholder="All namespaces" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All namespaces</SelectItem>
                  {NAMESPACES.map((ns) => (
                    <SelectItem key={ns} value={ns}>
                      {ns}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t('translations.searchPlaceholder', 'Search by key or value...')}
                className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {isFetching && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>{total} {t('translations.keys', 'keys')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              <span className="ml-2 text-slate-500">{t('translations.loading', 'Loading translations...')}</span>
            </div>
          ) : translations.length === 0 ? (
            <div className="text-center py-20">
              <Languages className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">{t('translations.noResults', 'No translations found.')}</p>
              <p className="text-sm text-slate-400 mt-1">
                {t('translations.noResultsHint', 'Try adjusting your search or namespace filter.')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[200px]">
                      {t('translations.colKey', 'Key')}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('translations.colEnglish', 'English')}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('translations.colBangla', 'Bangla')}
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-[140px]">
                      {t('translations.colUpdated', 'Last Updated')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {translations.map((row) => {
                    const latestUpdate = row.bn?.updated_at
                      ? new Date(row.bn.updated_at) > new Date(row.en.updated_at)
                        ? row.bn.updated_at
                        : row.en.updated_at
                      : row.en.updated_at;

                    return (
                      <tr
                        key={`${row.namespace}.${row.key}`}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="space-y-1">
                            <code className="text-xs font-mono text-slate-600 break-all">
                              {row.key}
                            </code>
                            <Badge
                              variant="outline"
                              className="text-[10px] border-slate-200 text-slate-500 bg-slate-50"
                            >
                              {row.namespace}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <InlineEditCell
                            value={row.en.value}
                            translationId={row.en.id}
                            onSave={handleSave}
                            isSaving={updateMutation.isPending}
                          />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <InlineEditCell
                            value={row.bn?.value ?? ''}
                            translationId={row.bn?.id ?? null}
                            onSave={handleSave}
                            isSaving={updateMutation.isPending}
                          />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="text-xs text-slate-400">
                            {new Date(latestUpdate).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {t('translations.pageInfo', 'Page {{page}} of {{total}}', {
              page,
              total: totalPages,
            })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('translations.prev', 'Previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              {t('translations.next', 'Next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
