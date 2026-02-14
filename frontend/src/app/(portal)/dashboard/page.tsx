'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Bell, Plus } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { PropertyCard } from '@/components/property/property-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiResponse, DashboardSummary, Notification } from '@/types';

function relativeTime(value: string): string {
  const now = Date.now();
  const then = new Date(value).getTime();
  const minutes = Math.round((now - then) / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  return `${days}d ago`;
}


export default function DashboardPage() {
  const [activeSlide, setActiveSlide] = useState(0);
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
  const notifications = summary?.notifications_preview ?? [];
  const recentTickets = summary?.tickets_preview ?? [];
  const unreadCount = summary?.unread_notifications_count ?? 0;

  // Hero slides matching the screenshots exactly
  const heroSlides = [
    {
      title: 'Get Land Related Service Online',
      subtitle: 'Learn more about our services',
      buttonText: 'Learn More',
      buttonLink: '/workspace/services',
    },
    {
      title: "Don't have all your papers in place?",
      subtitle: 'Learn how to get the right documents instantly.',
      buttonText: 'See How',
      buttonLink: '/workspace/services',
    },
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 5000); // Auto-rotate every 5 seconds

    return () => window.clearInterval(interval);
  }, [heroSlides.length]);

  const currentSlide = heroSlides[activeSlide];

  const activities =
    notifications.length > 0
      ? notifications.slice(0, 5).map((item) => ({
          id: item.id,
          title: item.title,
          body: item.body,
          at: item.created_at,
        }))
      : recentTickets.slice(0, 5).map((ticket) => ({
          id: `ticket-${ticket.id}`,
          title: `${ticket.ticket_number} updated`,
          body: ticket.title,
          at: ticket.updated_at,
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
            <div className="flex items-center gap-2 text-red-400 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Could not load dashboard summary.
            </div>
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
      {/* Greeting and Add Property Button */}
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            Hi {user?.name || 'there'}!
          </h1>
          <p className="text-base text-wisebox-text-secondary">
            {topProperties.length === 0
              ? "Let's kick things off by adding your first property!"
              : "Welcome back to your dashboard"}
          </p>
        </div>
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

      {/* Hero Banner with Rounded Corners */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 text-white p-10 min-h-[260px] flex flex-col justify-between rounded-2xl relative overflow-hidden shadow-xl">
        <div className="space-y-4 max-w-2xl relative z-10">
          <h2 className="text-3xl font-bold leading-tight text-cyan-100">
            {currentSlide.title}
          </h2>
          <p className="text-white/90 text-base leading-relaxed">
            {currentSlide.subtitle}
          </p>
        </div>
        <div className="pt-6 flex items-center justify-between relative z-10">
          <Button asChild className="bg-white text-slate-800 hover:bg-gray-100 font-semibold px-6 h-12 rounded-lg shadow-md hover:shadow-lg transition-all">
            <Link href={currentSlide.buttonLink}>
              {currentSlide.buttonText}
            </Link>
          </Button>

          {/* Carousel Dots */}
          <div className="flex gap-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeSlide
                    ? 'w-8 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Guide Section */}
      <div className="space-y-5">
        <p className="text-wisebox-text-secondary text-base">
          Feeling lost on how to kick things off? Let us guide you!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/workspace/services" className="block group">
            <div className="bg-wisebox-background-card border border-wisebox-border rounded-xl p-6 hover:border-wisebox-border-light transition-all hover:shadow-lg">
              <div className="flex items-start gap-4">
                <div className="bg-wisebox-background-lighter rounded-lg p-3 group-hover:bg-wisebox-primary/20 transition-colors">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
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
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
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
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
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

      {topProperties.length === 0 ? (
        <Card className="bg-wisebox-background-card border-wisebox-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-white">Feeling lost? Let us guide you.</CardTitle>
            <CardDescription className="text-wisebox-text-secondary">
              Add your first property and Wisebox will generate a personalized checklist for documents and next steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-white hover:bg-gray-100 text-wisebox-background font-semibold">
              <Link href="/properties/new">Start with your first property</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-wisebox-background-card border-wisebox-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-wisebox-text-secondary">Latest platform updates relevant to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-wisebox-text-secondary">No recent activity yet.</p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="border border-wisebox-border rounded-lg p-3 bg-wisebox-background-lighter">
                    <p className="font-medium text-sm text-white">{activity.title}</p>
                    {activity.body && <p className="text-sm text-wisebox-text-secondary mt-1">{activity.body}</p>}
                    <p className="text-xs text-wisebox-text-muted mt-2">{relativeTime(activity.at)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-wisebox-background-card border-wisebox-border rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Notifications</CardTitle>
                <CardDescription className="text-wisebox-text-secondary">Unread updates and system alerts.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-wisebox-primary/20 text-wisebox-primary border-wisebox-primary/30">
                {unreadCount} unread
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-wisebox-text-secondary">No notifications yet.</p>
            ) : (
              notifications.slice(0, 4).map((notification: Notification) => (
                <div key={notification.id} className="rounded-lg border border-wisebox-border p-3 bg-wisebox-background-lighter">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">{notification.title}</p>
                      {notification.body && <p className="text-xs text-wisebox-text-secondary mt-1">{notification.body}</p>}
                    </div>
                    {!notification.read_at && <Bell className="h-4 w-4 text-wisebox-primary" />}
                  </div>
                </div>
              ))
            )}
            <Button asChild variant="outline" className="w-full border-wisebox-border text-white hover:bg-wisebox-background-lighter">
              <Link href="/notifications">Open notification center</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {recentTickets.length > 0 && (
        <Card className="bg-wisebox-background-card border-wisebox-border rounded-xl">
          <CardHeader>
            <CardTitle className="text-white">Tickets at a Glance</CardTitle>
            <CardDescription className="text-wisebox-text-secondary">Recent support and consultant engagement tickets.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {recentTickets.slice(0, 3).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-lg border border-wisebox-border p-3 bg-wisebox-background-lighter">
                <div>
                  <p className="font-medium text-sm text-white">{ticket.ticket_number}</p>
                  <p className="text-sm text-wisebox-text-secondary">{ticket.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize border-wisebox-border text-wisebox-text-secondary">
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Button asChild size="sm" variant="ghost" className="text-white hover:bg-wisebox-background">
                    <Link href={`/tickets/${ticket.id}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

