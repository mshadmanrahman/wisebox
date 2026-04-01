'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Home, Check, AlertTriangle, X as XIcon, Bell, Clock, FileText, Scale, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── useInView ── */
function useInView(options: { threshold?: number; rootMargin?: string; once?: boolean } = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px', once = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsInView(true); if (once) obs.unobserve(el); } else if (!once) setIsInView(false); }, { threshold, rootMargin });
    obs.observe(el);
    return () => obs.unobserve(el);
  }, [threshold, rootMargin, once]);
  return { ref, isInView };
}

/* ── GrainyGradientBg ── */
export function GrainyGradientBg({ name, className }: { name: string; className?: string }) {
  const base = 'absolute inset-0 w-full h-full object-cover pointer-events-none select-none';
  return (
    <>
      <img src={`/images/gradients/${name}-light.png`} alt="" aria-hidden className={cn(base, 'dark:hidden', className)} />
      <img src={`/images/gradients/${name}-dark.png`}  alt="" aria-hidden className={cn(base, 'hidden dark:block', className)} />
    </>
  );
}

/* ── RevealSection ── */
export function RevealSection({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, isInView } = useInView();
  return (
    <div ref={ref} className={cn('transition-all duration-700 ease-out', isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6', className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── StaggerGrid ── */
export function StaggerGrid({ children, className }: { children: ReactNode; className?: string }) {
  const { ref, isInView } = useInView();
  return (
    <div ref={ref} className={cn(className, '[&>*]:transition-all [&>*]:duration-700 [&>*]:ease-out', isInView ? '' : '[&>*]:opacity-0 [&>*]:translate-y-6')}>
      <style>{isInView ? Array.from({ length: 12 }, (_, i) => `& > *:nth-child(${i + 1}) { transition-delay: ${i * 100}ms; }`).join('\n') : ''}</style>
      {children}
    </div>
  );
}

/* ── LandingHero — Product-forward ── */
export function LandingHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);

  return (
    <section className="relative overflow-hidden pt-16 pb-16 sm:pt-24 sm:pb-24">
      <GrainyGradientBg name="gradient-09" className="opacity-55 dark:opacity-25" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8">
        {/* Centered text */}
        <div className="text-center max-w-4xl mx-auto">
          <h1
            className={cn('font-[family-name:var(--font-geist-sans)] text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.15] text-foreground transition-all duration-700', loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')}
            style={{ transitionDelay: '200ms' }}
          >
            Building clarity for families who own property across borders
          </h1>

          <div className={cn('mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700', loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')} style={{ transitionDelay: '400ms' }}>
            <Link href="/assessment/start" className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]">
              Get started — it&rsquo;s free <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <button type="button" onClick={() => document.querySelector('#features-section')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 text-base font-medium text-muted-foreground hover:text-foreground transition-all duration-300">
              Explore more <ChevronDown className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className={cn('mt-6 transition-all duration-700', loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4')} style={{ transitionDelay: '500ms' }}>
            <span className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm text-muted-foreground">
              +500 Families trust Wisebox
            </span>
          </div>
        </div>

        {/* Hero visual: floating composition */}
        <div className={cn('mt-16 relative transition-all duration-1000', loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')} style={{ transitionDelay: '600ms' }}>
          <div className="max-w-3xl mx-auto relative">
            {/* Central product mock */}
            <div className="bg-card rounded-3xl shadow-2xl dark:shadow-none border border-border overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[160px_1fr] min-h-[320px]">
                {/* Sidebar */}
                <div className="hidden lg:block border-r border-border bg-muted/50 p-4 space-y-3">
                  <div className="h-5 w-20 rounded-lg bg-primary/10" />
                  <div className="space-y-1.5 mt-5">
                    {['Dashboard', 'Properties', 'Documents', 'Tickets'].map((label) => (
                      <div key={label} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-muted-foreground">
                        <div className="w-3.5 h-3.5 rounded bg-border" />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Main content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium text-foreground">My Properties</p><p className="text-[10px] text-muted-foreground mt-0.5">2 properties tracked</p></div>
                    <div className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">+ Add</div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3.5 border border-border">
                    <div className="flex items-center gap-2.5 mb-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Home className="w-4 h-4 text-primary" strokeWidth={1.5} /></div>
                      <div><p className="text-xs font-medium">Family Home, Sylhet</p><p className="text-[9px] text-muted-foreground">Added 3 days ago</p></div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px]"><span className="text-muted-foreground">Readiness</span><span className="font-medium text-primary">72%</span></div>
                      <div className="h-1 rounded-full bg-muted"><div className="h-full w-[72%] rounded-full bg-primary" /></div>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3.5 border border-border">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><Home className="w-4 h-4 text-secondary" strokeWidth={1.5} /></div>
                      <div><p className="text-xs font-medium">Agricultural Land, Comilla</p><p className="text-[9px] text-muted-foreground">Added 2 weeks ago</p></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating: Grandfather photo — bottom-left */}
            <div className="absolute -bottom-8 -left-4 sm:left-4 lg:-left-12 z-20">
              <div className="w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-2xl overflow-hidden shadow-xl border-4 border-background">
                <img src="/images/landing/hero-family.jpg" alt="Family" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Floating: Readiness score — top-right */}
            <div className="absolute -top-4 -right-4 sm:right-2 lg:-right-16 z-20">
              <div className="bg-card rounded-2xl shadow-lg dark:shadow-none border border-border p-4 w-40">
                <p className="text-[10px] text-muted-foreground">Overall Score</p>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-3xl font-semibold text-primary">72</span>
                  <span className="text-xs text-muted-foreground">/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted mt-2"><div className="h-full w-[72%] rounded-full bg-primary" /></div>
              </div>
            </div>

            {/* Floating: Notification — mid-right (desktop) */}
            <div className="hidden lg:block absolute top-1/3 -right-20 z-20">
              <div className="bg-card rounded-xl shadow-lg dark:shadow-none border border-border p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="text-[11px] font-medium">Document uploaded</p>
                  <p className="text-[9px] text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
            </div>

            {/* Floating: Document status — left (desktop) */}
            <div className="hidden lg:block absolute top-1/4 -left-20 z-20">
              <div className="bg-card rounded-xl shadow-lg dark:shadow-none border border-border p-3 w-44">
                <p className="text-[10px] font-medium text-muted-foreground mb-2">Documents</p>
                <div className="space-y-1.5">
                  {[
                    { color: 'bg-green-100 dark:bg-green-900/30', icon: 'text-green-600 dark:text-green-400', label: 'Property Deed' },
                    { color: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-600 dark:text-amber-400', label: 'Mutation Certificate' },
                    { color: 'bg-red-100 dark:bg-red-900/30', icon: 'text-red-500 dark:text-red-400', label: 'Tax Clearance' },
                  ].map((d) => (
                    <div key={d.label} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded flex items-center justify-center ${d.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${d.icon.replace('text-', 'bg-')}`} />
                      </div>
                      <span className="text-[11px]">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating: Family count — bottom-right */}
            <div className="hidden sm:block absolute -bottom-6 right-4 lg:-right-8 z-20">
              <div className="bg-card rounded-full shadow-lg dark:shadow-none border border-border px-4 py-2 flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 border-2 border-card" />
                  <div className="w-5 h-5 rounded-full bg-secondary/20 border-2 border-card" />
                  <div className="w-5 h-5 rounded-full bg-primary/30 border-2 border-card" />
                </div>
                <p className="text-[11px] font-medium text-muted-foreground">+500 families</p>
              </div>
            </div>
          </div>
          {/* Bottom spacer for overflow */}
          <div className="h-12" />
        </div>
      </div>
    </section>
  );
}

/* ── TestimonialScroller ── */
interface Testimonial { quote: string; name: string; location: string; }

export function TestimonialScroller({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="mt-10 relative">
      <div className="-mx-6 px-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
        <div className="flex gap-5 sm:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
          {testimonials.map((t) => (
            <div key={t.name} className="min-w-[360px] sm:min-w-[400px] shrink-0 snap-start rounded-2xl border border-border bg-card p-8 shadow-md dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:border-white/15">
              <p className="text-base text-foreground leading-relaxed">{t.quote}</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">{t.name.charAt(0)}</div>
                <div><p className="text-sm font-medium text-foreground">{t.name}</p><p className="text-xs text-muted-foreground">{t.location}</p></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Right edge fade */}
      <div className="absolute right-0 top-0 bottom-6 w-20 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}

/* ── FeatureCard with inline UI mock ── */
export function FeatureCard({ kicker, heading, body, children, reverse = false }: { kicker: string; heading: string; body: string; children: ReactNode; reverse?: boolean }) {
  return (
    <RevealSection>
      <div className={`rounded-3xl bg-card border border-border shadow-lg dark:shadow-none overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[400px] ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
        <div className="p-10 sm:p-12 flex flex-col justify-center">
          <p className="text-xs font-medium uppercase text-primary" style={{ letterSpacing: '0.15em' }}>{kicker}</p>
          <h3 className="mt-3 text-2xl font-semibold text-foreground tracking-tight leading-[1.2]">{heading}</h3>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">{body}</p>
          <Link href="/assessment/start" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            Get started <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
        <div className="bg-muted/30 p-8 flex items-center justify-center">
          {children}
        </div>
      </div>
    </RevealSection>
  );
}

/* ── Mini UI Mocks for feature cards ── */
export function PropertyMock() {
  return (
    <div className="w-full max-w-[280px] space-y-3">
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Home className="w-4 h-4 text-primary" strokeWidth={1.5} /></div>
          <div><p className="text-xs font-medium">Family Home, Sylhet</p><p className="text-[10px] text-muted-foreground">Added 3 days ago</p></div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]"><span className="text-muted-foreground">Readiness</span><span className="font-medium text-primary">72%</span></div>
          <div className="h-1.5 rounded-full bg-muted"><div className="h-full w-[72%] rounded-full bg-primary" /></div>
        </div>
      </div>
      <div className="bg-card rounded-xl p-3 shadow-sm border border-border">
        <p className="text-[10px] font-medium mb-2">Documents</p>
        <div className="space-y-1.5">
          {[{ icon: Check, label: 'Property Deed (Dolil)', bg: 'bg-green-100 dark:bg-green-900/30', fg: 'text-green-600 dark:text-green-400' }, { icon: AlertTriangle, label: 'Mutation Certificate', bg: 'bg-amber-100 dark:bg-amber-900/30', fg: 'text-amber-600 dark:text-amber-400' }, { icon: XIcon, label: 'Tax Clearance', bg: 'bg-red-100 dark:bg-red-900/30', fg: 'text-red-600 dark:text-red-400' }].map(({ icon: Icon, label, bg, fg }) => (
            <div key={label} className="flex items-center gap-2 text-[10px]">
              <div className={`w-4 h-4 rounded flex items-center justify-center ${bg}`}><Icon className={`w-2.5 h-2.5 ${fg}`} strokeWidth={2} /></div>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotificationMock() {
  return (
    <div className="w-full max-w-[280px] space-y-2">
      {[
        { icon: FileText, label: 'Document verified', desc: 'Property Deed has been verified by consultant', time: '2 min ago', color: 'text-primary' },
        { icon: Bell, label: 'Assessment reminder', desc: 'Complete your readiness assessment', time: '1 hour ago', color: 'text-secondary' },
        { icon: MessageSquare, label: 'Consultant reply', desc: 'Adv. Rahman replied to your ticket', time: '3 hours ago', color: 'text-primary' },
        { icon: Clock, label: 'Deadline approaching', desc: 'Tax clearance due in 14 days', time: 'Yesterday', color: 'text-wisebox-status-warning' },
      ].map((n) => {
        const Icon = n.icon;
        return (
          <div key={n.label} className="bg-card rounded-xl p-3 shadow-sm border border-border flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0"><Icon className={`w-3.5 h-3.5 ${n.color}`} strokeWidth={1.5} /></div>
            <div className="min-w-0"><p className="text-[10px] font-medium truncate">{n.label}</p><p className="text-[9px] text-muted-foreground truncate">{n.desc}</p><p className="text-[9px] text-muted-foreground/60 mt-0.5">{n.time}</p></div>
          </div>
        );
      })}
    </div>
  );
}

export function TicketMock() {
  return (
    <div className="w-full max-w-[280px]">
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium">Land Verification</p>
          <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[9px] font-medium">In Progress</span>
        </div>
        <div className="space-y-3 border-l-2 border-border pl-3 ml-1">
          {[
            { label: 'Ticket created', time: 'Mar 10', done: true },
            { label: 'Consultant assigned', time: 'Mar 11', done: true },
            { label: 'Site visit scheduled', time: 'Mar 15', done: false },
          ].map((step) => (
            <div key={step.label} className="relative">
              <div className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 ${step.done ? 'bg-primary border-primary' : 'bg-card border-border'}`} />
              <p className={`text-[10px] font-medium ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
              <p className="text-[9px] text-muted-foreground">{step.time}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2"><Scale className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} /><p className="text-[9px] text-muted-foreground">Consultant: Adv. M. Rahman</p></div>
        </div>
      </div>
    </div>
  );
}
