'use client';

import Link from 'next/link';
import { type ReactNode, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Bell, CalendarCheck, Plus, ShieldCheck } from 'lucide-react';
import api from '@/lib/api';
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

  const { data: summary } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
      return response.data.data;
    },
  });
  const sliders = summary?.hero_slides ?? [];
  const topProperties = summary?.properties_preview ?? [];
  const notifications = summary?.notifications_preview ?? [];
  const recentTickets = summary?.tickets_preview ?? [];
  const unreadCount = summary?.unread_notifications_count ?? 0;
  const counts = summary?.counts;

  useEffect(() => {
    if (sliders.length < 2) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % sliders.length);
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [sliders.length]);

  useEffect(() => {
    if (activeSlide > Math.max(0, sliders.length - 1)) {
      setActiveSlide(0);
    }
  }, [activeSlide, sliders.length]);

  const currentSlide = sliders[activeSlide] ?? null;

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

  return (
    <div className="px-6 py-8 space-y-6">
      <Card className="border-wisebox-primary-100 overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-r from-wisebox-primary-700 via-wisebox-primary-600 to-wisebox-primary-500 text-white p-8 sm:p-10 min-h-[220px] flex flex-col justify-between">
            <div className="space-y-3 max-w-2xl">
              <p className="text-white/80 text-sm uppercase tracking-[0.08em]">Wisebox Dashboard</p>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                {currentSlide?.title ?? 'Protect your property portfolio from anywhere'}
              </h1>
              {currentSlide?.subtitle && (
                <p className="text-white/90 text-sm sm:text-base">{currentSlide.subtitle}</p>
              )}
            </div>
            <div className="pt-5 flex flex-wrap items-center gap-3">
              <Button asChild className="bg-white text-wisebox-primary-700 hover:bg-white/90">
                <Link href={currentSlide?.cta_url || '/properties/new'}>
                  {currentSlide?.cta_text || 'Add New Property'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-white/50 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <Link href="/assessment">Get Free Assessment</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          href="/properties/new"
          icon={<Plus className="h-5 w-5" />}
          title="Add New Property"
          description={`Start a new property file in 2 steps. ${counts ? `${counts.properties_total} tracked.` : ''}`}
        />
        <QuickActionCard
          href="/tickets"
          icon={<CalendarCheck className="h-5 w-5" />}
          title="Talk to an Expert"
          description={`Open tickets and schedule with consultants. ${counts ? `${counts.tickets_open} open.` : ''}`}
        />
        <QuickActionCard
          href="/assessment"
          icon={<ShieldCheck className="h-5 w-5" />}
          title="Get Free Assessment"
          description="Answer 15 questions and get instant risk insights."
        />
      </div>

      {topProperties.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Feeling lost? Let us guide you.</CardTitle>
            <CardDescription>
              Add your first property and Wisebox will generate a personalized checklist for documents and next steps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="bg-wisebox-primary hover:bg-wisebox-primary-hover">
              <Link href="/properties/new">Start with your first property</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-wisebox-text-primary">My Properties</h2>
            <Button asChild variant="ghost" className="text-wisebox-primary-700">
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform updates relevant to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <p className="text-sm text-wisebox-text-secondary">No recent activity yet.</p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/60">
                    <p className="font-medium text-sm text-wisebox-text-primary">{activity.title}</p>
                    {activity.body && <p className="text-sm text-wisebox-text-secondary mt-1">{activity.body}</p>}
                    <p className="text-xs text-wisebox-text-secondary mt-2">{relativeTime(activity.at)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Unread updates and system alerts.</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-wisebox-primary-50 text-wisebox-primary-700">
                {unreadCount} unread
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-wisebox-text-secondary">No notifications yet.</p>
            ) : (
              notifications.slice(0, 4).map((notification: Notification) => (
                <div key={notification.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-wisebox-text-primary">{notification.title}</p>
                      {notification.body && <p className="text-xs text-wisebox-text-secondary mt-1">{notification.body}</p>}
                    </div>
                    {!notification.read_at && <Bell className="h-4 w-4 text-wisebox-primary-600" />}
                  </div>
                </div>
              ))
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href="/notifications">Open notification center</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {recentTickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tickets at a Glance</CardTitle>
            <CardDescription>Recent support and consultant engagement tickets.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {recentTickets.slice(0, 3).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium text-sm text-wisebox-text-primary">{ticket.ticket_number}</p>
                  <p className="text-sm text-wisebox-text-secondary">{ticket.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Button asChild size="sm" variant="ghost">
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

function QuickActionCard({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition hover:shadow-md hover:border-wisebox-primary-200">
        <CardContent className="pt-6">
          <div className="h-10 w-10 rounded-lg bg-wisebox-primary-50 text-wisebox-primary-700 flex items-center justify-center mb-3">
            {icon}
          </div>
          <h3 className="font-semibold text-wisebox-text-primary">{title}</h3>
          <p className="text-sm text-wisebox-text-secondary mt-1">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
