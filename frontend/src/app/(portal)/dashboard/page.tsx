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
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none">
          <p className="text-sm text-muted-foreground">
            {t('dashboard:loadingSummary')}
          </p>
        </div>
      </div>
    );
  }

  if (isError && !hasSummary) {
    return (
      <div className="px-6 py-8 space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('dashboard:title')}</h1>
        <div className="bg-card border border-destructive/20 rounded-xl p-6 shadow-sm dark:shadow-none space-y-3">
          <p className="text-sm font-medium text-destructive">
            {t('dashboard:couldNotLoad')}
          </p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-transparent border border-border text-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-all duration-200 h-10"
          >
            {isFetching ? t('common:retrying') : t('common:retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {user?.name
              ? t('dashboard:greeting', { name: user.name })
              : t('dashboard:greetingFallback')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {topProperties.length === 0
              ? t('dashboard:noPropertiesSubtitle')
              : t('dashboard:propertiesCount', { count: topProperties.length })}
          </p>
          {topProperties.length === 0 && (
            <div className="flex items-center gap-3 pt-2">
              <Button asChild className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-all duration-200 h-10">
                <Link href="/properties/new">{t('dashboard:addNewProperty')}</Link>
              </Button>
              <Button asChild variant="outline" className="bg-transparent border border-border text-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-all duration-200 h-10">
                <Link href="/assessment/start">{t('dashboard:getFreeAssessment')}</Link>
              </Button>
            </div>
          )}
        </div>
        {topProperties.length > 0 && (
          <Link href="/properties/new">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm dark:shadow-none hover:border-border/80 dark:hover:border-white/12 transition-all duration-200 cursor-pointer group min-w-[320px]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-base font-medium text-foreground">{t('dashboard:addNewProperty')}</p>
                  <p className="text-sm text-muted-foreground mt-1.5">{t('dashboard:completionTime')}</p>
                </div>
                <div className="bg-muted group-hover:bg-muted/80 rounded-lg p-3 transition-colors">
                  <Plus className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {isError && hasSummary && (
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm dark:shadow-none flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {t('common:showingStaleData')} {errorMessage}
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="bg-transparent border border-border text-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-all duration-200 h-10"
          >
            {isFetching ? t('common:retrying') : t('common:retry')}
          </button>
        </div>
      )}

      {/* Hero Banner */}
      <DashboardHeroBanner
        slides={heroSlides}
        rotationInterval={5000}
      />

      {/* Guide Section */}
      <section className="space-y-4">
        <h2 className="text-base font-medium text-foreground">{t('common:letsGetStarted')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/workspace/services', icon: Compass, title: t('dashboard:exploreServices'), desc: t('dashboard:exploreServicesDesc') },
            { href: '/workspace/services', icon: Sparkles, title: t('dashboard:talkToExpert'), desc: t('dashboard:talkToExpertDesc') },
            { href: '/learning', icon: BookOpen, title: t('dashboard:learningCenter'), desc: t('dashboard:learningCenterDesc') },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.title} href={card.href} className="block group">
                <div className="h-full bg-card border border-border rounded-2xl p-6 shadow-md dark:shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:hover:border-white/12">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-medium text-foreground">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{card.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Property Grid (only when properties exist) */}
      {topProperties.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground">{t('dashboard:myProperties')}</h2>
            <Button asChild variant="ghost" className="text-primary hover:bg-muted">
              <Link href="/properties">
                {t('common:viewAll')}
                <ArrowRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
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
