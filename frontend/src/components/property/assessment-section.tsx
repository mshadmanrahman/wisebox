'use client';

import Link from 'next/link';
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

function statusLabel(pct: number): string {
  if (pct === 0) return 'Critical';
  if (pct < 40) return 'Needs Attention';
  if (pct < 70) return 'Partial';
  if (pct < 90) return 'Good';
  return 'Excellent';
}

function recommendationText(pct: number): string {
  if (pct === 0) return 'No assessment completed yet. Run a free assessment to see where you stand.';
  if (pct < 40) return 'Several important documents are missing. Consider consulting with a property expert.';
  if (pct < 70) return 'You have some documents but key items need attention.';
  if (pct < 90) return 'Your documentation is mostly complete. A few items remain.';
  return 'Your property documentation is comprehensive.';
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

export function AssessmentSection({ property, assessmentHistory = [] }: AssessmentSectionProps) {
  const pct = property.completion_percentage;
  const status = property.completion_status;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          Readiness Assessment
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
            <span className={cn('text-2xl font-semibold', scoreColor(status))}>
              {pct}
            </span>
            <span className={cn('text-[10px] font-medium', scoreColor(status))}>
              {statusLabel(pct)}
            </span>
          </div>

          {/* Recommendation */}
          <div className="space-y-3 pt-1">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recommendationText(pct)}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/workspace/services">
                Explore Services
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-medium text-foreground">Assessment History</h3>
          {assessmentHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assessments completed yet.</p>
          ) : (
            <div className="space-y-2">
              {assessmentHistory.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-foreground">{assessment.overall_score}/100</p>
                    <p className="text-xs text-muted-foreground">{assessment.summary || 'No summary available'}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-xs font-medium uppercase', scoreColor(assessment.score_status))}>
                      {statusLabel(assessment.overall_score)}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(assessment.created_at)}</p>
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
