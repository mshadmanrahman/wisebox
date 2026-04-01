'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
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
import { getPropertyGradient, getPropertyTypeBadge } from '@/lib/property-type-styles';
import type { ApiResponse, DashboardSummary, Notification, Property } from '@/types';

/* ─── Constants ─────────────────────────────────────────────────────── */

const GRAIN_SVG = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")";

/* ─── Helpers ───────────────────────────────────────────────────────── */

function getPropertyLocation(property: Property): string {
  const parts: string[] = [];
  if (property.district?.name) parts.push(property.district.name);
  else if (property.division?.name) parts.push(property.division.name);
  if (property.country_code)
    parts.push(property.country_code === 'BD' ? 'Bangladesh' : property.country_code);
  return parts.join(', ');
}

function scoreBar(score: number): string {
  if (score >= 70) return 'bg-green-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function scoreStroke(score: number): string {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#eab308';
  return '#ef4444';
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

function getServiceRecommendation(property: Property | null): { name: string; longDesc: string } {
  if (!property) return { name: 'Free Property Consultation', longDesc: 'Talk to an expert about your property needs. Free, no commitment.' };
  const t = (property.property_type?.name ?? '').toLowerCase();
  if (t.includes('apartment') || t.includes('flat'))
    return { name: 'Apartment Purchase Verification', longDesc: 'Our consultants verify ownership documents and ensure your apartment purchase is legally sound.' };
  if (t.includes('land'))
    return { name: 'Land Purchase Verification', longDesc: 'Our consultants can help track down missing documents including Mutation Khatian, tax receipts, and land records.' };
  return { name: 'Free Property Consultation', longDesc: 'Talk to an expert about your property needs. Free, no commitment.' };
}

function notificationDotColor(type: string): string {
  if (type.includes('paid') || type.includes('completed')) return 'bg-green-500';
  if (type.includes('failed') || type.includes('cancelled')) return 'bg-destructive';
  if (type.includes('comment') || type.includes('assigned')) return 'bg-primary';
  return 'bg-amber-500';
}

/* ─── PropertyDashboardCard ─────────────────────────────────────────── */

function PropertyDashboardCard({ property, index }: { property: Property; index: number }) {
  const score = property.completion_percentage;
  const location = getPropertyLocation(property);
  const circ = 2 * Math.PI * 42;
  const dash = (score / 100) * circ;

  return (
    <Link
      href={`/properties/${property.id}`}
      className="block rounded-2xl shadow-lg overflow-hidden relative hover:shadow-xl hover:-translate-y-[2px] transition-all duration-300 cursor-pointer border border-white/50 dark:border-white/10"
    >
      {/* Gradient */}
      <div
        className="absolute inset-0 pointer-events-none dark:opacity-60"
        style={{ background: getPropertyGradient(index) }}
      />
      {/* Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '256px' }}
      />
      {/* Glass overlay for text readability */}
      <div className="absolute inset-0 bg-white/40 dark:bg-black/30 pointer-events-none" />

      <div className="relative z-10 p-6">
        {/* Top: name + type badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">{property.property_name}</h3>
            {location && <p className="text-sm text-muted-foreground mt-0.5 truncate">{location}</p>}
          </div>
          {property.property_type && (
            <span className="text-xs font-medium bg-white/60 dark:bg-white/10 backdrop-blur-sm text-foreground px-3 py-1 rounded-full border border-white/30 shrink-0">
              {property.property_type.name}
            </span>
          )}
        </div>

        {/* Score ring + stats */}
        <div className="mt-5 flex items-center gap-6">
          {score > 0 ? (
            <>
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={scoreStroke(score)} strokeWidth="10"
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-bold text-foreground">{score}</span>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Readiness</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">{score}%</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Status</p>
                  <p className="text-sm font-semibold text-foreground mt-1.5">{statusLabel(property.completion_status)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 space-y-2">
              <p className="text-sm text-muted-foreground">Upload documents to get your readiness score.</p>
              <span className="text-xs font-medium text-primary">Upload documents →</span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {score > 0 && (
          <div className="mt-4">
            <div className="h-1.5 rounded-full bg-white/30 dark:bg-white/10">
              <div className={`h-full rounded-full ${scoreBar(score)}`} style={{ width: `${score}%` }} />
            </div>
          </div>
        )}

        {/* Needs attention badge */}
        {score > 0 && score < 50 && (
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-100/80 dark:bg-red-500/20 text-red-700 dark:text-red-400 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              Needs attention
            </span>
          </div>
        )}
      </div>
    </Link>
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
          Start by adding a property profile. It takes about 5 minutes and gives you a baseline readiness score.
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
    const service = getServiceRecommendation(p);
    const showRec = p.completion_percentage < 70;

    return (
      <div className="space-y-4">
        <PropertyDashboardCard property={p} index={0} />
        {showRec && (
          <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-2xl shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-primary uppercase tracking-wider">Recommended</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{service.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{service.longDesc}</p>
              <a href="/workspace/services" className="mt-3 text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
                Learn more <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* 2+ properties */
  const sorted = [...properties].sort((a, b) => a.completion_percentage - b.completion_percentage);
  const avgScore = sorted.length > 0
    ? Math.round(sorted.reduce((s, p) => s + p.completion_percentage, 0) / sorted.length)
    : 0;
  const needAttention = sorted.filter((p) => p.completion_percentage < 40).length;
  const allHealthy = sorted.every((p) => p.completion_percentage >= 80);
  const visible = showAll ? sorted : sorted.slice(0, 3);
  const worst = sorted[0];
  const worstService = getServiceRecommendation(worst ?? null);

  return (
    <div className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Your Properties</h2>
        <Link href="/properties" className="text-xs text-primary font-medium hover:underline">
          View all →
        </Link>
      </div>

      {/* Aggregate stats — naked numbers */}
      <div className="flex items-center gap-8">
        <div>
          <p className="text-3xl font-bold text-foreground">{totalProperties}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Properties</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className="text-3xl font-bold text-foreground">{avgScore}%</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Avg Readiness</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div>
          <p className={`text-3xl font-bold ${needAttention > 0 ? 'text-destructive' : 'text-foreground'}`}>
            {needAttention}
          </p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mt-0.5">Need Attention</p>
        </div>
      </div>

      {/* Property cards */}
      <div className="space-y-4">
        {visible.map((p, i) => (
          <PropertyDashboardCard key={p.id} property={p} index={i} />
        ))}
      </div>

      {totalProperties > 3 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-xs text-primary font-medium text-center hover:underline py-1"
        >
          Show all {totalProperties} properties
        </button>
      )}

      {allHealthy && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <Check className="w-4 h-4" strokeWidth={2} />
          <span>All properties in good standing</span>
        </div>
      )}

      {!allHealthy && worst && worst.completion_percentage < 70 && (
        <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary uppercase tracking-wider">Recommended</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{worstService.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{worstService.longDesc}</p>
            <a href="/workspace/services" className="mt-3 text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
              Learn more <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Recommended for you</h3>
        <a href="/workspace/services" className="text-xs text-primary font-medium hover:underline">All services →</a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a href="/workspace/services" className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MessageCircle className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 px-2 py-0.5 rounded-full">Free</span>
          </div>
          <p className="text-xs font-medium text-foreground">Free Consultation</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">30 min with a property expert</p>
        </a>
        <a href="/workspace/services" className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-all duration-200">
          <div className="mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <card2.Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-xs font-medium text-foreground">{card2.name}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{card2.desc}</p>
          <p className="mt-2 text-[11px] font-medium text-primary inline-flex items-center gap-1">
            Learn more <ArrowRight className="w-2.5 h-2.5" />
          </p>
        </a>
        <a href="/workspace/services" className="bg-card border border-border rounded-xl p-3 hover:border-primary/30 transition-all duration-200">
          <div className="mb-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <p className="text-xs font-medium text-foreground">Land Ownership Papers</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Mutation, tax receipts, and land records</p>
          <p className="mt-2 text-[11px] font-medium text-primary inline-flex items-center gap-1">
            Learn more <ArrowRight className="w-2.5 h-2.5" />
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
  worstPropertyId,
}: {
  openTickets: number;
  propertiesNeedingReview: number;
  worstPropertyId: number | null;
}) {
  const docsHref = worstPropertyId ? `/properties/${worstPropertyId}` : '/properties';
  const docsLabel = propertiesNeedingReview > 0 ? `${propertiesNeedingReview} need docs` : 'Upload & track';

  const actions = [
    { href: docsHref,             Icon: BarChart3,   label: 'Documents', sub: docsLabel },
    { href: '/workspace/services', Icon: Scale,       label: 'Services',  sub: 'Browse catalog' },
    { href: '/tickets',            Icon: Ticket,      label: 'Tickets',   sub: openTickets > 0 ? `${openTickets} open` : 'Track requests' },
    { href: '/learning',           Icon: BookOpen,    label: 'Learn',     sub: 'Guides & FAQs' },
  ];

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
            <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mb-3">
              <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
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
    <div className="bg-card border-l-2 border-primary/30 border border-border rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
        <Link href="/notifications" className="text-xs text-primary font-medium hover:underline">View all</Link>
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
                {item.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.body}</p>}
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
    <div className="rounded-2xl bg-foreground dark:bg-card p-5 space-y-4">
      <div>
        <p className="text-xs font-medium text-primary uppercase tracking-wider">Need help?</p>
        <p className="mt-2 text-sm font-semibold text-background dark:text-foreground">Talk to a property expert</p>
        <p className="mt-1 text-xs text-background/70 dark:text-muted-foreground">Free 30-minute consultation. No commitment.</p>
        <Link
          href="/workspace/services"
          className="mt-3 inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:gap-2.5 transition-all duration-200"
        >
          Book consultation <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
        </Link>
      </div>
      <div className="border-t border-white/10 dark:border-border" />
      <div>
        <p className="text-[10px] font-medium text-background/50 dark:text-muted-foreground uppercase tracking-wider">Popular service</p>
        <a href="/workspace/services" className="mt-2 block group">
          <p className="text-sm font-medium text-background dark:text-foreground group-hover:text-primary transition-colors">
            Land Purchase Verification
          </p>
          <p className="mt-0.5 text-xs text-background/60 dark:text-muted-foreground">
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
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

  const worstProperty = properties.length > 0
    ? ([...properties].sort((a, b) => a.completion_percentage - b.completion_percentage)[0] ?? null)
    : null;

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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

        {/* Left: property health + recommendations */}
        <div className="space-y-6">
          <PropertyHealthOverview properties={properties} totalProperties={totalProperties} />
          {totalProperties > 0 && <RecommendedForYou worstProperty={worstProperty} />}
        </div>

        {/* Right: sidebar stack */}
        <div className="space-y-4">
          <QuickActions
            openTickets={openTickets}
            propertiesNeedingReview={propertiesNeedingReview}
            worstPropertyId={worstProperty?.id ?? null}
          />
          <RecentActivity notifications={notifications} />
          <NeedHelp />
        </div>

      </div>
    </div>
  );
}
