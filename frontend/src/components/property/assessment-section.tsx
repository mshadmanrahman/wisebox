'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Property, PropertyAssessment } from '@/types';

interface AssessmentSectionProps {
  property: Property;
  assessmentHistory?: PropertyAssessment[];
}

function scoreColor(status: 'red' | 'yellow' | 'green'): string {
  if (status === 'green') return 'text-wisebox-status-success';
  if (status === 'yellow') return 'text-wisebox-status-warning';
  return 'text-wisebox-status-danger';
}

function scoreBgColor(status: 'red' | 'yellow' | 'green'): string {
  if (status === 'green') return 'bg-wisebox-status-success/10 border-wisebox-status-success/20';
  if (status === 'yellow') return 'bg-wisebox-status-warning/10 border-wisebox-status-warning/20';
  return 'bg-wisebox-status-danger/10 border-wisebox-status-danger/20';
}

function scoreRingColor(status: 'red' | 'yellow' | 'green'): string {
  if (status === 'green') return 'ring-wisebox-status-success/30';
  if (status === 'yellow') return 'ring-wisebox-status-warning/30';
  return 'ring-wisebox-status-danger/30';
}

const statusLabelKey: Record<'red' | 'yellow' | 'green', string> = {
  green: 'assessment.complete',
  yellow: 'assessment.partial',
  red: 'assessment.critical',
};

function recommendationKey(percentage: number): string {
  if (percentage === 0) return 'assessment.recommendation0';
  if (percentage < 80) return 'assessment.recommendationLow';
  if (percentage < 100) return 'assessment.recommendationHigh';
  return 'assessment.recommendation100';
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

export function AssessmentSection({ property, assessmentHistory = [] }: AssessmentSectionProps) {
  const { t } = useTranslation('properties');
  const pct = property.completion_percentage;
  const status = property.completion_status;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-wisebox-text-secondary" />
          {t('assessment.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex items-start gap-5">
          {/* Score circle */}
          <div
            className={cn(
              'flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-2 ring-4',
              scoreBgColor(status),
              scoreRingColor(status)
            )}
          >
            <span className={cn('text-2xl font-bold', scoreColor(status))}>
              {pct}
            </span>
            <span className={cn('text-[10px] font-medium', scoreColor(status))}>
              {t(statusLabelKey[status])}
            </span>
          </div>

          {/* Recommendation */}
          <div className="space-y-3 pt-1">
            <p className="text-sm text-wisebox-text-secondary leading-relaxed">
              {t(recommendationKey(pct))}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/workspace/services">
                {t('assessment.viewServices')}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-semibold text-wisebox-text-primary">{t('assessment.history')}</h3>
          {assessmentHistory.length === 0 ? (
            <p className="text-sm text-wisebox-text-secondary">{t('assessment.noAssessments')}</p>
          ) : (
            <div className="space-y-2">
              {assessmentHistory.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-wisebox-text-primary">{assessment.overall_score}/100</p>
                    <p className="text-xs text-wisebox-text-secondary">{assessment.summary || t('assessment.noSummary')}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-xs font-medium uppercase', scoreColor(assessment.score_status))}>
                      {t(statusLabelKey[assessment.score_status])}
                    </p>
                    <p className="text-xs text-wisebox-text-secondary">{formatDate(assessment.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
