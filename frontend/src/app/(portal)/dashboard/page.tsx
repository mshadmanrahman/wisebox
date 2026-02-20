'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
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
    'Please try again in a moment.';

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
            Loading dashboard summary...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError && !hasSummary) {
    return (
      <div className="px-6 py-8 space-y-4">
        <h1 className="text-2xl font-bold text-white">Wisebox Dashboard</h1>
        <Card className="border-red-500/20 bg-red-500/10">
          <CardContent className="p-6 space-y-3">
            <p className="text-red-400 font-medium">
              Could not load dashboard summary.
            </p>
            <p className="text-sm text-red-400/90">{errorMessage}</p>
            <Button variant="outline" onClick={() => refetch()} disabled={isFetching} className="border-wisebox-border text-white hover:bg-wisebox-background-lighter">
              {isFetching ? 'Retrying...' : 'Retry'}
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
          <h1 className="text-4xl font-bold text-white">
            Hi {user?.name || 'there'}!
          </h1>
          <p className="text-base text-wisebox-text-secondary">
            {topProperties.length === 0
              ? "Let's kick things off by adding your first property!"
              : `You have ${topProperties.length} added Properties`}
          </p>
          {topProperties.length === 0 && (
            <div className="flex items-center gap-3 pt-2">
              <Button asChild className="bg-white hover:bg-gray-100 text-wisebox-background font-semibold">
                <Link href="/properties/new">Add New Property</Link>
              </Button>
              <Button asChild variant="outline" className="border-wisebox-border text-white hover:bg-wisebox-background-lighter">
                <Link href="/assessment/start">Get a Free Assessment</Link>
              </Button>
            </div>
          )}
        </div>
        {topProperties.length > 0 && (
          <Link href="/properties/new">
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl border border-slate-600/50 p-5 transition-all cursor-pointer group min-w-[320px] shadow-md hover:shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white font-semibold text-base">Add New Property</p>
                  <p className="text-slate-400 text-xs mt-1.5">Completion time ~15 min</p>
                </div>
                <div className="bg-slate-600/50 group-hover:bg-slate-500/50 rounded-lg p-3 transition-colors">
                  <Plus className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {isError && hasSummary && (
        <Card className="border-amber-500/20 bg-amber-500/10 rounded-xl">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-amber-400">
              Showing previously loaded dashboard data. {errorMessage}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching} className="border-wisebox-border text-white hover:bg-wisebox-background-lighter">
              {isFetching ? 'Retrying...' : 'Retry'}
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
          Let&apos;s Get Started
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/workspace/services" className="block group">
            <div className="bg-wisebox-background-card border border-wisebox-border rounded-xl p-6 hover:border-wisebox-border-light transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-wisebox-background-lighter rounded-lg p-3 group-hover:bg-wisebox-primary/20 transition-colors">
                  <Compass className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2 text-base">Explore services</h3>
                  <p className="text-sm text-wisebox-text-secondary leading-relaxed">
                    Discover 11 services to kickstart your journey
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/tickets" className="block group">
            <div className="bg-wisebox-background-card border border-wisebox-border rounded-xl p-6 hover:border-wisebox-border-light transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-wisebox-background-lighter rounded-lg p-3 group-hover:bg-wisebox-primary/20 transition-colors">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2 text-base">Talk to an Expert</h3>
                  <p className="text-sm text-wisebox-text-secondary leading-relaxed">
                    Available today in 5 hours
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/assessment/start" className="block group">
            <div className="bg-wisebox-background-card border border-wisebox-border rounded-xl p-6 hover:border-wisebox-border-light transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-wisebox-background-lighter rounded-lg p-3 group-hover:bg-wisebox-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-2 text-base">Access knowledge resources</h3>
                  <p className="text-sm text-wisebox-text-secondary leading-relaxed">
                    Enjoy 90 minutes of free content
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
            <h2 className="text-lg font-semibold text-white">My Properties</h2>
            <Button asChild variant="ghost" className="text-wisebox-primary hover:bg-wisebox-background-lighter">
              <Link href="/properties">
                View all
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

