'use client';

import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, ClipboardList, User, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Recommendation {
  category: string;
  recommendation: string;
  consultant_name: string;
  date: string;
}

export default function PropertyRecommendationsPage() {
  const params = useParams();
  const { t, i18n } = useTranslation('properties');
  const propertyId = Number(params.id);

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['property-recommendations', propertyId],
    queryFn: async () => {
      const res = await api.get<{ data: Recommendation[] }>(`/properties/${propertyId}/recommendations`);
      return res.data.data;
    },
    enabled: Number.isFinite(propertyId),
  });

  if (isLoading || !recommendations) {
    return (
      <div className="px-6 py-8">
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-6 text-sm text-muted-foreground">
            {t('recommendations.loading')}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group recommendations by category
  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.category]) {
      acc[rec.category] = [];
    }
    acc[rec.category].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  const categoryColors: Record<string, { bg: string; text: string; icon: string }> = {
    'Property Legal Assessment': {
      bg: 'bg-wisebox-status-info/10',
      text: 'text-wisebox-status-info',
      icon: 'border-wisebox-status-info/30',
    },
    'Property Physical Inspection': {
      bg: 'bg-wisebox-status-warning/10',
      text: 'text-wisebox-status-warning',
      icon: 'border-wisebox-status-warning/30',
    },
    'Property Valuation Review': {
      bg: 'bg-wisebox-status-success/10',
      text: 'text-wisebox-status-success',
      icon: 'border-wisebox-status-success/30',
    },
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || {
      bg: 'bg-card',
      text: 'text-muted-foreground',
      icon: 'border-border',
    };
  };

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('recommendations.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('recommendations.subtitle')}
        </p>
      </div>

      {/* Summary Card */}
      <Card className="bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none">
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-foreground">{recommendations.length}</p>
                <p className="text-sm text-muted-foreground">{t('recommendations.totalRecommendations')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-wisebox-status-info/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-wisebox-status-info" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-wisebox-status-info">
                  {Object.keys(groupedRecommendations).length}
                </p>
                <p className="text-sm text-muted-foreground">{t('recommendations.categories')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-wisebox-status-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-wisebox-status-success" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-2xl font-semibold text-wisebox-status-success">
                  {new Set(recommendations.map((r) => r.consultant_name)).size}
                </p>
                <p className="text-sm text-muted-foreground">{t('recommendations.consultants')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {recommendations.length === 0 ? (
        <Card className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" strokeWidth={1.5} />
            <p className="text-muted-foreground">
              {t('recommendations.noRecommendations')}
            </p>
          </CardContent>
        </Card>
      ) : (
        /* Recommendations by Category */
        <div className="space-y-6">
          {Object.entries(groupedRecommendations).map(([category, categoryRecs]) => {
            const colors = getCategoryColor(category);

            return (
              <Card key={category} className="bg-card border border-border rounded-xl shadow-sm dark:shadow-none">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.icon} border-2 flex items-center justify-center`}
                    >
                      <ClipboardList className={`h-5 w-5 ${colors.text}`} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base font-medium text-foreground">{category}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {categoryRecs.length !== 1
                          ? t('recommendations.recommendationCountPlural', { count: categoryRecs.length })
                          : t('recommendations.recommendationCount', { count: categoryRecs.length })}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryRecs.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-muted rounded-lg p-4 space-y-3 border-l-4 border-primary"
                    >
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {rec.recommendation}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" strokeWidth={1.5} />
                          <span>{rec.consultant_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" strokeWidth={1.5} />
                          <span>
                            {new Date(rec.date).toLocaleDateString(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Action Items Note */}
      {recommendations.length > 0 && (
        <Card className="bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none">
          <CardContent className="p-0">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-medium text-foreground mb-1">{t('recommendations.important')}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('recommendations.importantDescription')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
