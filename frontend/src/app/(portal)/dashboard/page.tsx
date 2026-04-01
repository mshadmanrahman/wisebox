'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  FileCheck,
  Home,
  Lightbulb,
  MessageCircle,
  Plus,
  Scale,
  Search,
  Ticket,
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { getPropertyTypeStyles, getPropertyCardStyles } from '@/lib/property-type-styles';
import type { ApiResponse, DashboardSummary, Notification, Property } from '@/types';

/* ─── Helpers ───────────────────────────────────────────────────────── */

function getPropertyLocation(property: Property): string {
  const parts: string[] = [];
  if (property.district?.name) parts.push(property.district.name);
  else if (property.division?.name) parts.push(property.division.name);
  if (property.country_code)
    parts.push(property.country_code === 'BD' ? 'Bangladesh' : property.country_code);
  return parts.join(', ');
}

function scoreClasses(score: number): { badge: string; bar: string } {
  if (score >= 70)
    return {
      badge: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
      bar: 'bg-green-500',
    };
  if (score >= 40)
    return {
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
      bar: 'bg-amber-500',
    };
  return {
    badge: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
    bar: 'bg-red-500',
  };
}

function statusLabel(status: 'red' | 'yellow' | 'green'): string {
  if (status === 'green') return 'Good';
  if (status === 'yellow') return 'Partial';
  return 'Needs attention';
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getServiceRecommendation(property: Property | null): {
  name: string;
  longDesc: string;
} {
  if (!property) {
    return { name: 'Free Property Consultation', longDesc: 'Talk to an expert about your property needs. Free, no commitment.' };
  }
  const typeName = (property.property_type?.name ?? '').toLowerCase();
  if (typeName.includes('apartment') || typeName.includes('flat')) {
    return {
      name: 'Apartment Purchase Verification',
      longDesc: 'Our consultants verify ownership documents and ensure your apartment purchase is legally sound.',
    };
  }
  if (typeName.includes('land')) {
    return {
      name: 'Land Purchase Verification',
      longDesc: 'Our consultants can help track down missing documents including Mutation Khatian, tax receipts, and land records.',
    };
  }
  return { name: 'Free Property Consultation', longDesc: 'Talk to an expert about your property needs. Free, no commitment.' };
}

function notificationDotColor(type: string): string {
  if (type.includes('paid') || type.includes('completed')) return 'bg-green-500';
  if (type.includes('failed') || type.includes('cancelled')) return 'bg-destructive';
  if (type.includes('comment') || type.includes('assigned')) return 'bg-primary';
  return 'bg-amber-500';
}

/* ─── ScoreRing ─────────────────────────────────────────────────────── */

function ScoreRing({ score, status }: { score: number; status: 'red' | 'yellow' | 'green' }) {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const strokeClass =
    status === 'green'
      ? 'text-green-500'
      : status === 'yellow'
      ? 'text-amber-500'
      : 'text-red-500';

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8" className="stroke-muted" />
        <circle
          cx="50" cy="50" r={r} fill="none" strokeWidth="8"
          className={`stroke-current ${strokeClass}`}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-foreground">{score}</span>
        <span className="text-[10px] text-muted-foreground">/100</span>
      </div>
    </div>
  );
}

/* ─── PropertyHealthOverview ────────────────────────────────────────── */

function PropertyHealthOverview({
  properties,
  totalProperties,
}: {
  properties: Property[];
  totalProperties: number;
}) {
  const [showAll, setShowAll] = useState(false);

  /* 0 properties */
  if (totalProperties === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl shadow-md p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Home className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">Add your first property</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Start by adding a property profile. It takes about 5 minutes and gives you a baseline
          readiness score.
        </p>
        <Link
          href="/properties/new"
          className="mt-6 inline-flex bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-medium hover:opacity-90 transition-all"
        >
          Add Property
        </Link>
      </div>
    );
  }

  /* 1 property */
  if (totalProperties === 1 && properties.length >= 1) {
    const p = properties[0];
    const hasScore = p.completion_percentage > 0;
    const location = getPropertyLocation(p);
    const { bar, badge } = scoreClasses(p.completion_percentage);
    const service = getServiceRecommendation(p);
    const showRec = p.completion_percentage < 70;
    const typeStyles = getPropertyTypeStyles(p.property_type?.name);

    return (
      <div className={`relative overflow-hidden bg-gradient-to-br border-border rounded-2xl shadow-md p-6 ${typeStyles.gradient} ${typeStyles.border}`}>
        {/* Grain texture */}
        <div className="property-grain absolute top-0 left-0 w-3/5 h-3/5 opacity-[0.025] pointer-events-none" />

        <div className="relative flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-foreground">Property Readiness</h3>
          <Link href={`/properties/${p.id}`} className="text-xs text-primary font-medium hover:underline">
            View details →
          </Link>
        </div>

        <div className="relative flex items-center gap-8">
          {hasScore ? (
            <ScoreRing score={p.completion_percentage} status={p.completion_status} />
          ) : (
            <div className="w-24 h-24 shrink-0 flex items-center justify-center bg-muted rounded-full">
              <span className="text-xs text-muted-foreground text-center leading-tight">
                Not yet
                <br />
                assessed
              </span>
            </div>
          )}

          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Readiness score</span>
                <span className="font-medium">{p.completion_percentage}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${p.completion_percentage}%` }} />
              </div>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-medium px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${badge}`}>
                {statusLabel(p.completion_status)}
              </span>
            </div>
            {!hasScore && (
              <Link
                href="/assessment/start"
                className="inline-flex bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-xs font-medium hover:opacity-90 transition-all"
              >
                Reassess
              </Link>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 min-w-0">
          <Home className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} />
          <span className="text-sm font-medium text-foreground truncate">{p.property_name}</span>
          {location && (
            <span className="text-xs text-muted-foreground shrink-0">· {location}</span>
          )}
        </div>

        {showRec && (
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-start gap-3 p-4 bg-primary/[0.04] rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary uppercase tracking-wider">Recommended</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{service.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{service.longDesc}</p>
                <div className="mt-3">
                  <a href="/workspace/services" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* 2+ properties */
  const sorted = [...properties].sort((a, b) => a.completion_percentage - b.completion_percentage);
  const avgScore =
    sorted.length > 0
      ? Math.round(sorted.reduce((s, p) => s + p.completion_percentage, 0) / sorted.length)
      : 0;
  const needAttention = sorted.filter((p) => p.completion_percentage < 40).length;
  const allHealthy = sorted.every((p) => p.completion_percentage >= 80);
  const visible = showAll ? sorted : sorted.slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">Property Health Overview</h3>
        <Link href="/properties" className="text-xs text-primary font-medium hover:underline">
          View all →
        </Link>
      </div>

      {/* Aggregate stats */}
      <div className="flex items-center gap-6 py-3 mb-4 border-b border-border flex-wrap">
        <div>
          <p className="text-2xl font-semibold text-foreground">{totalProperties}</p>
          <p className="text-xs text-muted-foreground">properties</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground">{avgScore}%</p>
          <p className="text-xs text-muted-foreground">avg readiness</p>
        </div>
        <div>
          <p className={`text-2xl font-semibold ${needAttention > 0 ? 'text-destructive' : 'text-foreground'}`}>
            {needAttention}
          </p>
          <p className="text-xs text-muted-foreground">need attention</p>
        </div>
      </div>

      {/* Per-property rows */}
      <div className="space-y-1">
        {visible.map((p, i) => {
          const { badge, bar } = scoreClasses(p.completion_percentage);
          const location = getPropertyLocation(p);
          const typeName = p.property_type?.name ?? '';
          const subtitle = [location, typeName].filter(Boolean).join(' · ');
          const cardStyles = getPropertyCardStyles(p.property_type?.name, i);

          return (
            <Link
              key={p.id}
              href={`/properties/${p.id}`}
              className={`relative overflow-hidden flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group hover:shadow-sm ${cardStyles.gradientDirection} ${cardStyles.gradient} ${cardStyles.border}`}
            >
              <div className="property-grain absolute top-0 left-0 w-1/2 h-full opacity-[0.02] pointer-events-none" />
              <div
                className="absolute w-24 h-24 rounded-full opacity-[0.04] pointer-events-none text-current"
                style={{
                  background: 'currentColor',
                  top: `${(i * 37) % 60 - 20}%`,
                  right: `${(i * 23) % 40 - 10}%`,
                  filter: 'blur(32px)',
                }}
              />
              <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-semibold ${badge}`}>
                {p.completion_percentage}
              </div>

              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{p.property_name}</p>
                  {p.completion_percentage < 50 && (
                    <span className="text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded-full shrink-0">
                      Needs attention
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                )}
              </div>

              <div className="w-20 shrink-0 hidden sm:block">
                <div className="h-1.5 rounded-full bg-muted">
                  <div className={`h-full rounded-full ${bar}`} style={{ width: `${p.completion_percentage}%` }} />
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" strokeWidth={1.5} />
            </Link>
          );
        })}
      </div>

      {totalProperties > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-3 pt-3 border-t border-border text-xs text-primary font-medium text-center hover:underline"
        >
          Show all {totalProperties} properties
        </button>
      )}

      {allHealthy && (
        <div className="mt-4 pt-3 border-t border-border flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <Check className="w-4 h-4" strokeWidth={2} />
          <span>All properties in good standing</span>
        </div>
      )}

      {!allHealthy && sorted[0] && sorted[0].completion_percentage < 70 && (() => {
        const worst = sorted[0];
        const service = getServiceRecommendation(worst);
        return (
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-start gap-3 p-4 bg-primary/[0.04] rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <Lightbulb className="w-4 h-4 text-primary" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary uppercase tracking-wider">Recommended</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{service.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{service.longDesc}</p>
                <div className="mt-3">
                  <a href="/workspace/services" className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                    Learn more <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ─── RecommendedForYou ─────────────────────────────────────────────── */

function RecommendedForYou({ worstProperty }: { worstProperty: Property | null }) {
  const contextService = getServiceRecommendation(worstProperty);
  const typeName = (worstProperty?.property_type?.name ?? '').toLowerCase();
  const isApartment = typeName.includes('apartment') || typeName.includes('flat');

  const card2 = {
    name: contextService.name !== 'Free Property Consultation' ? contextService.name : 'Land Purchase Verification',
    desc: contextService.name !== 'Free Property Consultation'
      ? (isApartment ? 'Document verification and ownership validation' : 'Full due diligence and ownership validation')
      : 'Full due diligence and ownership validation',
    Icon: Search,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recommended for you</h3>
        <a href="/workspace/services" className="text-xs text-primary font-medium hover:underline">
          All services →
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1 — always free consultation */}
        <a
          href="/workspace/services"
          className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:-translate-y-px transition-all duration-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-2 py-0.5 rounded-full">
              Free
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">Free Consultation</p>
          <p className="text-xs text-muted-foreground mt-1">30 min session with a property expert</p>
        </a>

        {/* Card 2 — based on property type */}
        <a
          href="/workspace/services"
          className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:-translate-y-px transition-all duration-200"
        >
          <div className="mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <card2.Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">{card2.name}</p>
          <p className="text-xs text-muted-foreground mt-1">{card2.desc}</p>
          <p className="mt-3 text-xs font-medium text-primary inline-flex items-center gap-1">
            Learn more <ArrowRight className="w-3 h-3" />
          </p>
        </a>

        {/* Card 3 — Land Ownership Papers */}
        <a
          href="/workspace/services"
          className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:-translate-y-px transition-all duration-200"
        >
          <div className="mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileCheck className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-sm font-medium text-foreground">Land Ownership Papers</p>
          <p className="text-xs text-muted-foreground mt-1">Mutation, tax receipts, and land records</p>
          <p className="mt-3 text-xs font-medium text-primary inline-flex items-center gap-1">
            Learn more <ArrowRight className="w-3 h-3" />
          </p>
        </a>
      </div>
    </div>
  );
}

/* ─── QuickActions ──────────────────────────────────────────────────── */

function QuickActions({
  openTickets,
  propertiesNeedingReview,
}: {
  openTickets: number;
  propertiesNeedingReview: number;
}) {
  const actions = [
    {
      href: '/assessment/start',
      Icon: BarChart3,
      label: 'Reassess',
      sub: propertiesNeedingReview > 0 ? `${propertiesNeedingReview} need review` : '3 min check',
    },
    {
      href: '/workspace/services',
      Icon: Scale,
      label: 'Services',
      sub: 'Browse catalog',
    },
    {
      href: '/tickets',
      Icon: Ticket,
      label: 'Tickets',
      sub: openTickets > 0 ? `${openTickets} open` : 'Track requests',
    },
    {
      href: '/learning',
      Icon: BookOpen,
      label: 'Learn',
      sub: 'Guides & FAQs',
    },
  ] as const;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map(({ href, Icon, label, sub }) => (
          <Link
            key={href}
            href={href}
            className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:-translate-y-px transition-all duration-200 shadow-sm"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── RecentActivity ────────────────────────────────────────────────── */

function RecentActivity({ notifications }: { notifications: Notification[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <Link href="/notifications" className="text-xs text-primary font-medium hover:underline">
          View all
        </Link>
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {notifications.slice(0, 5).map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notificationDotColor(item.type)}`} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug">{item.title}</p>
                {item.body && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.body}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(item.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── NeedHelp ──────────────────────────────────────────────────────── */

function NeedHelp() {
  return (
    <div className="bg-card border border-primary/20 rounded-2xl p-5 space-y-4">
      {/* Free consultation CTA */}
      <div>
        <p className="text-xs font-medium text-primary uppercase tracking-wider">Need help?</p>
        <p className="mt-2 text-sm font-semibold text-foreground">Talk to a property expert</p>
        <p className="mt-1 text-xs text-muted-foreground">Free 30-minute consultation. No commitment.</p>
        <Link
          href="/workspace/services"
          className="mt-3 inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:gap-2.5 transition-all duration-200"
        >
          Book consultation <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>
      </div>

      <div className="border-t border-border" />

      {/* Popular service */}
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Popular service</p>
        <a href="/workspace/services" className="mt-2 block group">
          <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            Land Purchase Verification
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Document verification, field inspection, ownership validation
          </p>
          <p className="mt-2 text-xs font-medium text-primary inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            View details <ArrowRight className="w-3 h-3" />
          </p>
        </a>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user } = useAuthStore();

  const {
    data: summary,
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
      return res.data.data;
    },
    retry: 2,
  });

  const hasSummary = Boolean(summary);
  const properties = summary?.properties_preview ?? [];
  const totalProperties = summary?.counts.properties_total ?? 0;
  const openTickets = summary?.counts.tickets_open ?? 0;
  const notifications = summary?.notifications_preview ?? [];
  const propertiesNeedingReview = properties.filter((p) => p.completion_percentage < 50).length;

  const errorMessage =
    (error as { response?: { data?: { message?: string } } } | null)?.response?.data?.message ??
    (error as { message?: string } | null)?.message ??
    'Something went wrong.';

  /* Loading skeleton */
  if (isLoading && !hasSummary) {
    return (
      <div className="px-6 py-8 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-52 rounded-lg bg-muted" />
              <div className="h-4 w-36 rounded-lg bg-muted" />
            </div>
            <div className="h-10 w-32 rounded-full bg-muted" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            <div className="h-64 rounded-2xl bg-muted" />
            <div className="space-y-4">
              <div className="h-44 rounded-2xl bg-muted" />
              <div className="h-44 rounded-2xl bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* Full error (no cached data) */
  if (isError && !hasSummary) {
    return (
      <div className="px-6 py-8">
        <div className="bg-card border border-destructive/20 rounded-2xl p-6 space-y-3">
          <p className="text-sm font-medium text-destructive">Could not load dashboard</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="border border-border text-foreground rounded-full px-5 py-2 text-sm font-medium hover:bg-muted transition-all"
          >
            {isFetching ? 'Retrying…' : 'Try again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 space-y-6">

      {/* 1. Welcome header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalProperties === 0
              ? 'Add your first property to get started'
              : `You have ${totalProperties} ${totalProperties === 1 ? 'property' : 'properties'}`}
          </p>
        </div>
        <Link
          href="/properties/new"
          className="inline-flex items-center gap-2 border border-border rounded-full px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-all shrink-0"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          Add Property
        </Link>
      </div>

      {/* Stale data warning */}
      {isError && hasSummary && (
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="border border-border text-foreground rounded-full px-5 py-2 text-sm font-medium hover:bg-muted transition-all"
          >
            {isFetching ? 'Retrying…' : 'Refresh'}
          </button>
        </div>
      )}

      {/* 2. Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">

        {/* Left: property health + recommendations */}
        <div className="space-y-6">
          <PropertyHealthOverview properties={properties} totalProperties={totalProperties} />
          {totalProperties > 0 && (
            <RecommendedForYou
              worstProperty={
                [...properties].sort((a, b) => a.completion_percentage - b.completion_percentage)[0] ?? null
              }
            />
          )}
        </div>

        {/* Right: sidebar stack */}
        <div className="space-y-4">
          <QuickActions openTickets={openTickets} propertiesNeedingReview={propertiesNeedingReview} />
          <RecentActivity notifications={notifications} />
          <NeedHelp />
        </div>

      </div>
    </div>
  );
}
