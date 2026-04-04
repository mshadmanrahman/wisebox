'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Home, Check, AlertTriangle, X as XIcon, Bell, Clock, FileText, Scale, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPropertyGradient } from '@/lib/property-type-styles';

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

/* ── LandingHero — Split layout with floating widgets ── */
export function LandingHero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => setLoaded(true), []);

  return (
    <section className="bg-grain-cool relative overflow-hidden pt-16 sm:pt-20 lg:pt-28 pb-8 lg:pb-16">
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-background z-[1]" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 pt-4 sm:pt-8 lg:pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* LEFT: Text content */}
          <div className="text-center lg:text-left">
            <h1
              className={cn('heading-display text-[2rem] sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gradient-brand transition-all duration-700', loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')}
              style={{ transitionDelay: '200ms' }}
            >
              Your property back home deserves better than a WhatsApp group.
            </h1>
            <p
              className={cn('mt-4 lg:mt-6 text-base lg:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0 transition-all duration-700', loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')}
              style={{ transitionDelay: '300ms' }}
            >
              One secure place to track documents, monitor readiness, and coordinate expert help for your property in Bangladesh.
            </p>

            <div
              className={cn('mt-6 lg:mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-3 transition-all duration-700', loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6')}
              style={{ transitionDelay: '400ms' }}
            >
              <Link href="/register" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 sm:px-8 py-3.5 text-sm sm:text-base font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] w-full sm:w-auto">
                Sign up for free <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link href="/assessment/start" className="inline-flex items-center justify-center gap-2 rounded-full border border-border text-foreground px-6 sm:px-8 py-3.5 text-sm sm:text-base font-semibold hover:bg-muted transition-all duration-300 w-full sm:w-auto">
                Assess your property <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>

            {/* Mobile product preview — strategic widget composition */}
            <div className={cn('mt-8 lg:hidden transition-all duration-1000', loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')} style={{ transitionDelay: '600ms', perspective: '800px' }}>
              <div className="relative max-w-sm mx-auto" style={{ transform: 'rotateY(-8deg) rotateX(3deg) rotateZ(1deg)', transformStyle: 'preserve-3d' }}>

                {/* Score badge — floats top-right, overlaps the card */}
                <div className="absolute -top-3 right-2 z-20 rounded-xl shadow-lg border border-border dark:border-white/10 bg-card px-4 py-2.5 text-center">
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-medium">Readiness</p>
                  <p className="text-xl font-bold text-primary mt-0.5">42<span className="text-[10px] text-muted-foreground font-normal">/100</span></p>
                </div>

                {/* Property card — main widget */}
                <div className="rounded-2xl shadow-lg border border-border bg-card overflow-hidden relative">
                  <div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: getPropertyGradient(0) }} />
                  <div className="absolute inset-0 bg-card/50 dark:bg-card/40 pointer-events-none rounded-2xl" />
                  <div className="relative z-10 p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-bold text-foreground">Uttara Family Property</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Dhaka · Apartment</p>
                      </div>
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">APT</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative w-14 h-14 shrink-0">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" className="stroke-muted" strokeWidth="8" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="8" strokeDasharray="105 252" strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">42</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Readiness</span>
                          <span className="font-semibold text-foreground">42%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: '42%' }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                          <span>Docs: 5/12</span>
                          <span>1 open ticket</span>
                        </div>
                      </div>
                    </div>
                    {/* Document status row */}
                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-3.5 h-3.5 rounded bg-green-100 dark:bg-green-500/10 flex items-center justify-center"><Check className="w-2 h-2 text-green-600 dark:text-green-400" strokeWidth={2.5} /></div>
                        <div className="w-3.5 h-3.5 rounded bg-green-100 dark:bg-green-500/10 flex items-center justify-center"><Check className="w-2 h-2 text-green-600 dark:text-green-400" strokeWidth={2.5} /></div>
                        <div className="w-3.5 h-3.5 rounded bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center"><AlertTriangle className="w-2 h-2 text-amber-600 dark:text-amber-400" strokeWidth={2.5} /></div>
                        <div className="w-3.5 h-3.5 rounded bg-red-100 dark:bg-red-500/10 flex items-center justify-center"><XIcon className="w-2 h-2 text-red-500 dark:text-red-400" strokeWidth={2.5} /></div>
                        <div className="w-3.5 h-3.5 rounded bg-muted" />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">3 need attention</span>
                    </div>
                  </div>
                </div>

                {/* Notification — floats bottom-left, overlaps the card */}
                <div className="absolute -bottom-3 left-2 z-20 rounded-xl shadow-lg border border-border dark:border-white/10 bg-card px-3.5 py-2.5 flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-foreground">Document uploaded</p>
                    <p className="text-[8px] text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT: 3D isometric product composition */}
          <div className={cn('relative h-[500px] hidden lg:flex items-center justify-center -translate-x-[10%] transition-all duration-1000', loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10')} style={{ transitionDelay: '600ms', perspective: '1200px', transformStyle: 'preserve-3d' }}>

            {/* ===== FROSTED GLASS PANELS — light/dark mode pairs ===== */}
            {/* Panel A — largest, behind property card */}
            <div className="absolute top-[80px] left-1/2 -translate-x-[15%] w-[370px] h-[300px] rounded-3xl border border-black/[0.06] z-0 pointer-events-none dark:hidden" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)', background: 'linear-gradient(145deg, rgba(59,143,122,0.12) 0%, rgba(255,255,255,0.30) 40%, rgba(212,148,58,0.08) 100%)' }} />
            <div className="absolute top-[80px] left-1/2 -translate-x-[15%] w-[370px] h-[300px] rounded-3xl border border-white/[0.12] z-0 pointer-events-none hidden dark:block" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)', background: 'linear-gradient(145deg, rgba(59,143,122,0.18) 0%, rgba(255,255,255,0.06) 40%, rgba(212,148,58,0.10) 100%)' }} />
            {/* Panel B — behind document checklist */}
            <div className="absolute top-[220px] left-1/2 -translate-x-[70%] w-[270px] h-[280px] rounded-3xl border border-black/[0.06] z-0 pointer-events-none dark:hidden" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)', background: 'linear-gradient(145deg, rgba(212,148,58,0.10) 0%, rgba(255,255,255,0.28) 50%, rgba(59,143,122,0.07) 100%)' }} />
            <div className="absolute top-[220px] left-1/2 -translate-x-[70%] w-[270px] h-[280px] rounded-3xl border border-white/[0.12] z-0 pointer-events-none hidden dark:block" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)', background: 'linear-gradient(145deg, rgba(212,148,58,0.14) 0%, rgba(255,255,255,0.05) 50%, rgba(59,143,122,0.10) 100%)' }} />
            {/* Panel C — small, pushed right, peeks from edge */}
            <div className="absolute top-[10px] left-1/2 translate-x-[65%] w-[180px] h-[160px] rounded-2xl border border-black/[0.06] z-0 pointer-events-none dark:hidden" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)', background: 'linear-gradient(145deg, rgba(59,143,122,0.08) 0%, rgba(255,255,255,0.25) 100%)' }} />
            <div className="absolute top-[10px] left-1/2 translate-x-[65%] w-[180px] h-[160px] rounded-2xl border border-white/[0.12] z-0 pointer-events-none hidden dark:block" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)', background: 'linear-gradient(145deg, rgba(59,143,122,0.15) 0%, rgba(255,255,255,0.04) 100%)' }} />

            {/* Shadow glow behind property card */}
            <div className="absolute top-[50px] left-1/2 -translate-x-[30%] w-[280px] h-[200px] bg-primary/[0.06] dark:bg-primary/[0.04] rounded-3xl blur-2xl z-[5]" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)' }} />

            {/* Card 1: Property card — main */}
            <div className="absolute top-[40px] left-1/2 -translate-x-[30%] w-[310px] z-20 transition-all duration-500 hover:[transform:rotateY(-8deg)_rotateX(2deg)_rotateZ(1deg)_scale(1.05)]" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)' }}>
              <div className="rounded-2xl shadow-xl border border-border dark:border-white/10 overflow-hidden bg-card relative">
                <div className="absolute inset-0 pointer-events-none" style={{ background: getPropertyGradient(0) }} />
                <div className="absolute inset-0 bg-card/50 dark:bg-card/40 pointer-events-none" />
                <div className="relative z-10 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Uttara Family Property</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Dhaka · Apartment</p>
                    </div>
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">APT</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 shrink-0">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" className="stroke-muted" strokeWidth="8" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#eab308" strokeWidth="8" strokeDasharray="105 252" strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">42</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: '42%' }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
                        <span>Docs: 5/12</span>
                        <span>1 open ticket</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Document checklist — front layer, shifted down-left */}
            <div className="absolute top-[240px] left-1/2 -translate-x-[60%] w-[230px] z-30 transition-all duration-500 hover:[transform:rotateY(-8deg)_rotateX(2deg)_rotateZ(1deg)_scale(1.05)]" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)' }}>
              <div className="rounded-2xl border border-border dark:border-white/10 bg-card p-4 shadow-[0_20px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
                <p className="text-[10px] font-semibold text-foreground mb-3">Documents</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-green-100 dark:bg-green-500/10 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" strokeWidth={2} /></div>
                    <span className="text-[11px] text-foreground">Property Deed (Dolil)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-green-100 dark:bg-green-500/10 flex items-center justify-center"><Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" strokeWidth={2} /></div>
                    <span className="text-[11px] text-foreground">Possession Certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center"><AlertTriangle className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" strokeWidth={2} /></div>
                    <span className="text-[11px] text-foreground">Mutation Khatian</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-md bg-red-100 dark:bg-red-500/10 flex items-center justify-center"><XIcon className="w-2.5 h-2.5 text-red-500 dark:text-red-400" strokeWidth={2} /></div>
                    <span className="text-[11px] text-foreground">LD Tax Receipt</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Score badge — floats above property card */}
            <div className="absolute top-[-5px] left-1/2 translate-x-[35%] z-30 transition-all duration-500 hover:[transform:rotateY(-8deg)_rotateX(2deg)_rotateZ(1deg)_scale(1.05)]" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)' }}>
              <div className="rounded-xl shadow-lg border border-border dark:border-white/10 bg-card px-5 py-3 text-center">
                <p className="text-[8px] text-muted-foreground uppercase tracking-wider font-medium">Readiness</p>
                <p className="text-2xl font-bold text-primary mt-0.5">72<span className="text-xs text-muted-foreground font-normal">/100</span></p>
              </div>
            </div>

            {/* Card 4: Notification — right side */}
            <div className="absolute top-[200px] left-1/2 translate-x-[40%] z-10" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)' }}>
              <div className="rounded-xl shadow-md border border-border dark:border-white/10 bg-card px-3 py-2.5 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                </div>
                <div>
                  <p className="text-[9px] font-medium text-foreground">Document uploaded</p>
                  <p className="text-[8px] text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
            </div>

            {/* Card 5: Families chip — bottom */}
            <div className="absolute bottom-[30px] left-1/2 -translate-x-[20%] z-10" style={{ transform: 'rotateY(-12deg) rotateX(4deg) rotateZ(2deg)' }}>
              <div className="rounded-full shadow-md border border-border dark:border-white/10 bg-card px-3.5 py-1.5 flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  <div className="w-4 h-4 rounded-full bg-primary/20 border-2 border-card" />
                  <div className="w-4 h-4 rounded-full bg-amber-200/40 border-2 border-card" />
                  <div className="w-4 h-4 rounded-full bg-primary/30 border-2 border-card" />
                </div>
                <p className="text-[9px] font-medium text-muted-foreground">+500 families</p>
              </div>
            </div>

          </div>
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
        <div className="p-10 sm:p-12 flex flex-col justify-center border-l-2 border-primary/20">
          <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] text-primary">{kicker}</p>
          <h3 className="mt-3 heading-section text-xl sm:text-2xl font-bold text-foreground">{heading}</h3>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">{body}</p>
          <Link href="/assessment/start" className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            Get started <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
        <div className="bg-primary/[0.04] p-8 flex items-center justify-center">
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
