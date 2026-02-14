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
  if (status === 'green') return 'bg-green-500/10 border-green-500/20';
  if (status === 'yellow') return 'bg-amber-500/10 border-amber-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

function scoreRingColor(status: 'red' | 'yellow' | 'green'): string {
  if (status === 'green') return 'ring-wisebox-status-success/30';
  if (status === 'yellow') return 'ring-wisebox-status-warning/30';
  return 'ring-wisebox-status-danger/30';
}

function statusLabel(status: 'red' | 'yellow' | 'green'): string {
  if (status === 'green') return 'Complete';
  if (status === 'yellow') return 'Partial';
  return 'Critical';
}

function recommendation(percentage: number): string {
  if (percentage === 0) {
    return 'No documents uploaded. We recommend starting with a consultancy service.';
  }
  if (percentage < 80) {
    return 'Some documents are missing. Upload remaining documents or use our document retrieval service.';
  }
  if (percentage < 100) {
    return 'Almost there! Upload the remaining documents to complete your property file.';
  }
  return 'All documents uploaded! Consider a document assessment service for verification.';
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
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          Assessment
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
              {statusLabel(status)}
            </span>
          </div>

          {/* Recommendation */}
          <div className="space-y-3 pt-1">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {recommendation(pct)}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/workspace/services">
                View Services
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-3 border-t pt-4">
          <h3 className="text-sm font-semibold text-wisebox-text-primary">Assessment History</h3>
          {assessmentHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved assessments yet.</p>
          ) : (
            <div className="space-y-2">
              {assessmentHistory.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-wisebox-text-primary">{assessment.overall_score}/100</p>
                    <p className="text-xs text-muted-foreground">{assessment.summary || 'No summary provided.'}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-xs font-medium uppercase', scoreColor(assessment.score_status))}>
                      {statusLabel(assessment.score_status)}
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
