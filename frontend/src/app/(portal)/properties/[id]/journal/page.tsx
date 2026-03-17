'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronDown, ChevronUp, FileText, User } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FormResponse {
  template_name: string;
  summary: string;
  completed_at: string;
  responses: Record<string, string | string[]>;
}

interface Consultation {
  id: number;
  ticket_number: string;
  service_name: string;
  consultant_name: string;
  completed_at: string;
  consultation_notes: string;
  resolution_notes: string;
  forms_completed: FormResponse[];
}

interface PropertyJournalData {
  property: {
    id: number;
    property_name: string;
    property_type: string;
    location: string;
  };
  consultations: Consultation[];
  total_consultations: number;
}

export default function PropertyJournalPage() {
  const params = useParams();
  const { t, i18n } = useTranslation('properties');
  const propertyId = Number(params.id);
  const [expandedConsultations, setExpandedConsultations] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['property-journal', propertyId],
    queryFn: async () => {
      const res = await api.get<{ data: PropertyJournalData }>(`/properties/${propertyId}/journal`);
      return res.data.data;
    },
    enabled: Number.isFinite(propertyId),
  });

  const toggleConsultation = (consultationId: number) => {
    setExpandedConsultations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(consultationId)) {
        newSet.delete(consultationId);
      } else {
        newSet.add(consultationId);
      }
      return newSet;
    });
  };

  if (isLoading || !data) {
    return (
      <div className="px-6 py-8">
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">
            {t('journal.loading')}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { property, consultations, total_consultations } = data;

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-wisebox-text-primary">{t('journal.title')}</h1>
        <p className="text-wisebox-text-secondary mt-2">
          {property.property_name} • {property.property_type}
        </p>
      </div>

      {/* Stats Card */}
      <Card className="bg-gradient-to-r from-wisebox-primary-50 to-wisebox-primary-100 border-wisebox-primary-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-wisebox-text-secondary">{t('journal.totalConsultations')}</p>
              <p className="text-4xl font-bold text-wisebox-primary-700 mt-1">{total_consultations}</p>
            </div>
            <FileText className="h-16 w-16 text-wisebox-primary-300" />
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {consultations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 text-wisebox-text-muted mx-auto mb-4" />
            <p className="text-wisebox-text-secondary">{t('journal.noConsultations')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {consultations.map((consultation, index) => {
            const isExpanded = expandedConsultations.has(consultation.id);
            const isLast = index === consultations.length - 1;

            return (
              <div key={consultation.id} className="relative">
                {/* Timeline connector */}
                {!isLast && (
                  <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-wisebox-primary-200 -mb-4" />
                )}

                <Card className="relative">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-wisebox-primary-100 flex items-center justify-center border-4 border-white shadow-sm">
                        <Calendar className="h-5 w-5 text-wisebox-primary-700" />
                      </div>

                      {/* Header content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg">{consultation.service_name}</CardTitle>
                            <p className="text-sm text-wisebox-text-secondary mt-1">
                              {new Date(consultation.completed_at).toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <Badge variant="outline" className="bg-wisebox-status-success/20 text-wisebox-status-success border-wisebox-status-success/30">
                            {t('journal.completed')}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-sm text-wisebox-text-secondary">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>{consultation.consultant_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{t('journal.formsCompleted', { count: consultation.forms_completed.length })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Expand/collapse button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleConsultation(consultation.id)}
                        className="flex-shrink-0"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Expanded content */}
                  {isExpanded && (
                    <CardContent className="pt-0 space-y-4">
                      {/* Consultation Notes */}
                      {consultation.consultation_notes && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-wisebox-text-primary">{t('journal.consultationNotes')}</h4>
                          <div className="bg-wisebox-background-lighter rounded-lg p-4 text-sm whitespace-pre-wrap">
                            {consultation.consultation_notes}
                          </div>
                        </div>
                      )}

                      {/* Resolution Notes */}
                      {consultation.resolution_notes && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-wisebox-text-primary">{t('journal.summary')}</h4>
                          <div className="bg-wisebox-background-lighter rounded-lg p-4 text-sm whitespace-pre-wrap">
                            {consultation.resolution_notes}
                          </div>
                        </div>
                      )}

                      {/* Completed Forms */}
                      {consultation.forms_completed.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-wisebox-text-primary">{t('journal.formsCompletedTitle')}</h4>
                          {consultation.forms_completed.map((form, formIndex) => (
                            <div
                              key={formIndex}
                              className="bg-wisebox-background-lighter rounded-lg p-4 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-wisebox-text-primary">{form.template_name}</h5>
                                <span className="text-xs text-wisebox-text-secondary">
                                  {new Date(form.completed_at).toLocaleTimeString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              {form.summary && (
                                <p className="text-sm text-wisebox-text-secondary whitespace-pre-wrap">
                                  {form.summary}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
