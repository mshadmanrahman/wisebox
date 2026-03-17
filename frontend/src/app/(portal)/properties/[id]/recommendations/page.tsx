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
        <Card>
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">
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
      bg: 'bg-wisebox-background-card',
      text: 'text-wisebox-text-secondary',
      icon: 'border-wisebox-border',
    };
  };

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-wisebox-text-primary">{t('recommendations.title')}</h1>
        <p className="text-wisebox-text-secondary mt-2">
          {t('recommendations.subtitle')}
        </p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-wisebox-primary-50 to-wisebox-primary-100 border-wisebox-primary-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-wisebox-primary-200 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-wisebox-primary-700" />
              </div>
              <div>
                <p className="text-2xl font-bold text-wisebox-primary-700">{recommendations.length}</p>
                <p className="text-sm text-wisebox-text-secondary">{t('recommendations.totalRecommendations')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-wisebox-status-info/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-wisebox-status-info" />
              </div>
              <div>
                <p className="text-2xl font-bold text-wisebox-status-info">
                  {Object.keys(groupedRecommendations).length}
                </p>
                <p className="text-sm text-wisebox-text-secondary">{t('recommendations.categories')}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-wisebox-status-success/20 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-wisebox-status-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-wisebox-status-success">
                  {new Set(recommendations.map((r) => r.consultant_name)).size}
                </p>
                <p className="text-sm text-wisebox-text-secondary">{t('recommendations.consultants')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {recommendations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ClipboardList className="h-16 w-16 text-wisebox-text-muted mx-auto mb-4" />
            <p className="text-wisebox-text-secondary">
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
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${colors.bg} ${colors.icon} border-2 flex items-center justify-center`}
                    >
                      <ClipboardList className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{category}</CardTitle>
                      <p className="text-sm text-wisebox-text-secondary">
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
                      className="bg-wisebox-background-lighter rounded-lg p-4 space-y-3 border-l-4 border-wisebox-primary-500"
                    >
                      <p className="text-sm text-wisebox-text-primary whitespace-pre-wrap">
                        {rec.recommendation}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-wisebox-text-secondary">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{rec.consultant_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
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
        <Card className="bg-wisebox-primary-50 border-wisebox-primary-200">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-wisebox-primary-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-wisebox-primary-700 mb-1">{t('recommendations.important')}</p>
                <p className="text-sm text-wisebox-text-secondary">
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
