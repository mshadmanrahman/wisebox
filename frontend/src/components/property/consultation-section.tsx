'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MessageSquare, Video, Clock, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FreeConsultationDialog } from '@/components/property/free-consultation-dialog';
import type { Property, PaginatedResponse } from '@/types';

interface ConsultationSectionProps {
  property: Property;
}

interface ConsultationTicket {
  id: number;
  ticket_number: string;
  title: string;
  status: 'open' | 'assigned' | 'scheduled' | 'completed' | 'closed';
  created_at: string;
  scheduled_at: string | null;
  completed_at: string | null;
  meet_link: string | null;
  consultant_name: string | null;
  consultation_notes: string | null;
}

const statusLabelKeys: Record<ConsultationTicket['status'], string> = {
  open: 'consultation.statusOpen',
  assigned: 'consultation.statusAssigned',
  scheduled: 'consultation.statusScheduled',
  completed: 'consultation.statusCompleted',
  closed: 'consultation.statusClosed',
};

const statusIcons: Record<ConsultationTicket['status'], React.ComponentType<{ className?: string }>> = {
  open: Clock,
  assigned: AlertCircle,
  scheduled: Calendar,
  completed: CheckCircle,
  closed: CheckCircle,
};

const statusClassNames: Record<ConsultationTicket['status'], string> = {
  open: 'bg-wisebox-status-warning/20 text-wisebox-status-warning border-wisebox-status-warning/30',
  assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  scheduled: 'bg-wisebox-primary/20 text-wisebox-primary border-wisebox-primary/30',
  completed: 'bg-wisebox-status-success/20 text-wisebox-status-success border-wisebox-status-success/30',
  closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ConsultationSection({ property }: ConsultationSectionProps) {
  const { t } = useTranslation('properties');
  const { data: consultationsResponse, isLoading } = useQuery({
    queryKey: ['property', property.id, 'consultations'],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse<ConsultationTicket>>(
        `/properties/${property.id}/consultations`
      );
      return res.data;
    },
  });

  const consultations = consultationsResponse?.data ?? [];
  const hasConsultations = consultations.length > 0;
  const activeConsultation = consultations.find(c => ['open', 'assigned', 'scheduled'].includes(c.status));

  if (isLoading) {
    return (
      <Card className="bg-wisebox-background-card border-wisebox-border">
        <CardContent className="p-6 text-sm text-wisebox-text-secondary">
          {t('consultation.loading')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-wisebox-background-card border-wisebox-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <MessageSquare className="h-5 w-5 text-wisebox-primary" />
          {t('consultation.title')}
        </CardTitle>
        <CardDescription className="text-wisebox-text-secondary">
          {t('consultation.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Active Consultation */}
        {activeConsultation && (
          <div className="bg-wisebox-background-lighter border border-wisebox-border rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn('text-xs', statusClassNames[activeConsultation.status])}>
                    {React.createElement(statusIcons[activeConsultation.status], { className: 'h-3 w-3 mr-1' })}
                    {t(statusLabelKeys[activeConsultation.status])}
                  </Badge>
                </div>
                <h4 className="font-semibold text-white">{activeConsultation.title}</h4>
                <p className="text-sm text-wisebox-text-secondary">
                  {t('consultation.ticket', { number: activeConsultation.ticket_number })}
                </p>
              </div>
            </div>

            {activeConsultation.consultant_name && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-wisebox-text-secondary">{t('consultation.consultant')}</span>
                <span className="text-white font-medium">{activeConsultation.consultant_name}</span>
              </div>
            )}

            {activeConsultation.scheduled_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-wisebox-primary" />
                <span className="text-white">{formatDateTime(activeConsultation.scheduled_at)}</span>
              </div>
            )}

            {activeConsultation.meet_link && (
              <Button asChild className="w-full bg-wisebox-primary hover:bg-wisebox-primary-hover">
                <a href={activeConsultation.meet_link} target="_blank" rel="noopener noreferrer">
                  <Video className="h-4 w-4 mr-2" />
                  {t('consultation.joinGoogleMeet')}
                </a>
              </Button>
            )}
          </div>
        )}

        {/* Book Consultation CTA */}
        {!hasConsultations && (
          <div className="bg-gradient-to-br from-wisebox-primary/10 to-wisebox-primary/5 border border-wisebox-primary/30 rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-white">{t('consultation.needExpertHelp')}</h4>
              <p className="text-sm text-wisebox-text-secondary leading-relaxed">
                {t('consultation.expertHelpDesc')}
              </p>
            </div>
            <FreeConsultationDialog
              propertyId={property.id}
              propertyName={property.property_name}
            />
          </div>
        )}

        {hasConsultations && !activeConsultation && (
          <FreeConsultationDialog
            propertyId={property.id}
            propertyName={property.property_name}
            trigger={
              <Button
                variant="outline"
                className="w-full border-wisebox-border text-white hover:bg-wisebox-background-lighter"
              >
                <Calendar className="h-4 w-4 mr-2" />
                {t('consultation.bookAnother')}
              </Button>
            }
          />
        )}

        {/* Consultation History */}
        {hasConsultations && (
          <div className="space-y-3 border-t border-wisebox-border pt-4">
            <h3 className="text-sm font-semibold text-white">{t('consultation.history')}</h3>
            <div className="space-y-2">
              {consultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="bg-wisebox-background-lighter border border-wisebox-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-medium text-white text-sm">{consultation.title}</p>
                      <p className="text-xs text-wisebox-text-muted">
                        {formatDate(consultation.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('text-xs shrink-0', statusClassNames[consultation.status])}
                    >
                      {t(statusLabelKeys[consultation.status])}
                    </Badge>
                  </div>

                  {consultation.consultant_name && (
                    <p className="text-sm text-wisebox-text-secondary">
                      {t('consultation.with')} <span className="text-white">{consultation.consultant_name}</span>
                    </p>
                  )}

                  {consultation.consultation_notes && (
                    <div className="bg-wisebox-background rounded-lg p-3">
                      <p className="text-xs font-medium text-wisebox-text-secondary mb-1">{t('consultation.consultationNotes')}</p>
                      <p className="text-sm text-white leading-relaxed">
                        {consultation.consultation_notes}
                      </p>
                    </div>
                  )}

                  {consultation.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full text-wisebox-primary hover:bg-wisebox-primary/10"
                    >
                      <Link href={`/tickets/${consultation.id}`}>
                        {t('consultation.viewFullDetails')}
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
