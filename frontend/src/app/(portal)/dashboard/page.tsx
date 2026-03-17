'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, Compass, Plus, Sparkles } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { PropertyCard } from '@/components/property/property-card';
import { DashboardHeroBanner } from '@/components/dashboard/hero-banner';
import type { HeroSlide } from '@/components/dashboard/hero-banner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { ApiResponse, DashboardSummary } from '@/types';


export default function DashboardPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation(['dashboard', 'common']);

  const {
    data: summary,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
      return response.data.data;
    },
    retry: 2,
  });
  const hasSummary = Boolean(summary);
  const errorMessage =
    (error as { response?: { data?: { message?: string } }; message?: string } | null)?.response?.data?.message ||
    (error as { message?: string } | null)?.message ||
    t('common:tryAgain');

  const topProperties = summary?.properties_preview ?? [];

  // Map API Slider objects to HeroSlide interface for the banner component
  const heroSlides: HeroSlide[] = (summary?.hero_slides ?? []).map((s) => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    cta_text: s.cta_text,
    cta_url: s.cta_url,
    background_color: s.background_color,
    image_path: s.image_path || null,
    image_alt: s.image_alt,
    display_order: s.sort_order,
  }));

  if (isLoading && !hasSummary) {
    return (
      <div className="px-6 py-8">
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardContent className="p-6 text-sm text-wisebox-text-secondary">
            {t('dashboard:loadingSummary')}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError && !hasSummary) {
    return (
      <div className="px-6 py-8 space-y-4">
        <h1 className="text-2xl font-bold text-wisebox-text-primary">{t('dashboard:title')}</h1>
        <Card className="border-wisebox-status-danger/20 bg-wisebox-status-danger/10">
          <CardContent className="p-6 space-y-3">
            <p className="text-wisebox-status-danger font-medium">
              {t('dashboard:couldNotLoad')}
            </p>
            <p className="text-sm text-wisebox-status-danger/90">{errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="border-wisebox-border text-wisebox-text-primary hover:bg-wisebox-background-lighter">
              {isFetching ? t('common:retrying') : t('common:retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-wisebox-text-primary">
            {user?.name
              ? t('dashboard:greeting', { name: user.name })
              : t('dashboard:greetingFallback')}
          </h1>
          <p className="text-base text-wisebox-text-secondary">
            {topProperties.length === 0
              ? t('dashboard:noPropertiesSubtitle')
              : t('dashboard:propertiesCount', { count: topProperties.length })}
          </p>
          {topProperties.length === 0 && (
            <div className="flex items-center gap-3 pt-2">
              <Button asChild className="bg-white hover:bg-white/90 text-wisebox-background font-semibold">
                <Link href="/properties/new">{t('dashboard:addNewProperty')}</Link>
              </Button>
              <Button asChild variant="outline" className="border-wisebox-border text-wisebox-text-primary hover:bg-wisebox-background-lighter">
                <Link href="/assessment/start">{t('dashboard:getFreeAssessment')}</Link>
              </Button>
            </div>
          )}
        </div>
        {topProperties.length > 0 && (
          <Link href="/properties/new">
            <div className="bg-wisebox-background-lighter hover:bg-wisebox-background-lighter/80 rounded-xl border border-wisebox-border-light p-5 transition-all cursor-pointer group min-w-[320px] shadow-md hover:shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-wisebox-text-primary font-semibold text-base">{t('dashboard:addNewProperty')}</p>
                  <p className="text-wisebox-text-secondary text-xs mt-1.5">{t('dashboard:completionTime')}</p>
                </div>
                <div className="bg-wisebox-border-light/50 group-hover:bg-wisebox-border-light/70 rounded-lg p-3 transition-colors">
                  <Plus className="h-5 w-5 text-wisebox-text-primary" />
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {isError && hasSummary && (
        <Card className="border-wisebox-status-warning/20 bg-wisebox-status-warning/10 rounded-xl">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-wisebox-status-warning">
              {t('common:showingStaleData')} {errorMessage}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} className="border-wisebox-border text-wisebox-text-primary hover:bg-wisebox-background-lighter">
              {isFetching ? t('common:retrying') : t('common:retry')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Hero Banner */}
      <DashboardHeroBanner
        slides={heroSlides}
        rotationInterval={5000}
        className="rounded-2xl shadow-xl"
      />

      {/* Guide Section */}
      <div className="space-y-5">
        <p className="text-wisebox-text-secondary text-base">
          {t('common:letsGetStarted')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/workspace/services" className="block group">
            <div className="bg-wisebox-background-card border border-wisebox-border rounded-xl p-6 hover:border-wisebox-border-light transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-wisebox-background-lighter rounded-lg p-3 group-hover:bg-wisebox-primary/20 transition-colors">
                  <Compass className="h-6 w-6 text-wisebox-text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-wisebox-text-primary mb-2 text-base">{t('dashboard:exploreServices')}</h3>
                  <p className="text-sm text-wisebox-text-secondary leading-relaxed">
                    {t('dashboard:exploreServicesDesc')}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/workspace/services" className="block group">
            <div className="bg-wisebox-background-card border border-wisebox-border rounded-xl p-6 hover:border-wisebox-border-light transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-wisebox-background-lighter rounded-lg p-3 group-hover:bg-wisebox-primary/20 transition-colors">
                  <Sparkles className="h-6 w-6 text-wisebox-text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-wisebox-text-primary mb-2 text-base">{t('dashboard:talkToExpert')}</h3>
                  <p className="text-sm text-wisebox-text-secondary leading-relaxed">
                    {t('dashboard:talkToExpertDesc')}
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/learning" className="block group">
            <div className="bg-wisebox-background-card border border-wisebox-border rounded-xl p-6 hover:border-wisebox-border-light transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-wisebox-background-lighter rounded-lg p-3 group-hover:bg-wisebox-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-wisebox-text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-wisebox-text-primary mb-2 text-base">{t('dashboard:learningCenter')}</h3>
                  <p className="text-sm text-wisebox-text-secondary leading-relaxed">
                    {t('dashboard:learningCenterDesc')}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Property Grid (only when properties exist) */}
      {topProperties.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-wisebox-text-primary">{t('dashboard:myProperties')}</h2>
            <Button asChild variant="ghost" className="text-wisebox-primary hover:bg-wisebox-background-lighter">
              <Link href="/properties">
                {t('common:viewAll')}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topProperties.map((property, idx) => (
              <PropertyCard key={property.id} property={property} index={idx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
