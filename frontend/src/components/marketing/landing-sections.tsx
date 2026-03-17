'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ────────────────────────────────────────────
   useInView — scroll-triggered reveal
   ──────────────────────────────────────────── */
function useInView(options: { threshold?: number; rootMargin?: string; once?: boolean } = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px', once = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, [threshold, rootMargin, once]);

  return { ref, isInView };
}

/* ────────────────────────────────────────────
   RevealSection — fade-up on scroll
   ──────────────────────────────────────────── */
export function RevealSection({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────
   StaggerGrid — children stagger in
   ──────────────────────────────────────────── */
export function StaggerGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, isInView } = useInView();

  return (
    <div ref={ref} className={cn(className, '[&>*]:transition-all [&>*]:duration-700 [&>*]:ease-out', isInView ? '' : '[&>*]:opacity-0 [&>*]:translate-y-6')}>
      <style>{`
        ${isInView ? Array.from({ length: 12 }, (_, i) => `& > *:nth-child(${i + 1}) { transition-delay: ${i * 100}ms; }`).join('\n') : ''}
      `}</style>
      {children}
    </div>
  );
}

/* ────────────────────────────────────────────
   LandingHero — split layout, parallax
   ──────────────────────────────────────────── */
export function LandingHero() {
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const parallaxOffset = scrollY * 0.15;

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 py-16 sm:py-20 lg:grid-cols-[1.2fr_1fr] lg:gap-12 lg:py-0 lg:min-h-[calc(100vh-4rem)]">
        {/* Left — text */}
        <div className="flex flex-col justify-center lg:py-24">
          <p
            className={cn(
              'text-xs font-medium uppercase text-primary transition-all duration-700',
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            )}
            style={{ letterSpacing: '0.2em', transitionDelay: '200ms' }}
          >
            Property operations for Bangladeshi families abroad
          </p>

          <h1
            className={cn(
              'mt-6 font-[family-name:var(--font-geist-sans)] text-4xl font-semibold leading-[1.05] text-foreground sm:text-5xl lg:text-6xl xl:text-7xl transition-all duration-700',
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            )}
            style={{ letterSpacing: '-0.02em', transitionDelay: '300ms' }}
          >
            Your property<br className="hidden sm:inline" /> back home deserves<br className="hidden sm:inline" /> better than a<br className="hidden sm:inline" />{' '}
            <span className="text-primary">WhatsApp group.</span>
          </h1>

          <p
            className={cn(
              'mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed transition-all duration-700',
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            )}
            style={{ transitionDelay: '400ms' }}
          >
            Wisebox replaces scattered documents, missed deadlines, and long-distance guesswork with one secure workspace for your property in Bangladesh.
          </p>

          <div
            className={cn(
              'mt-8 flex flex-col gap-4 sm:flex-row transition-all duration-700',
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            )}
            style={{ transitionDelay: '500ms' }}
          >
            <Link
              href="/assessment/start"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02]"
            >
              Get Free Assessment <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              onClick={() => document.querySelector('#process-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="group inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-4 text-base font-medium text-foreground transition-all duration-200 hover:bg-muted"
            >
              See How It Works <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" strokeWidth={1.5} />
            </button>
          </div>

          <p
            className={cn(
              'mt-12 text-sm text-muted-foreground transition-all duration-700',
              loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            )}
            style={{ transitionDelay: '600ms' }}
          >
            Encrypted &amp; access-controlled&ensp;&middot;&ensp;Licensed consultants&ensp;&middot;&ensp;Free to start
          </p>
        </div>

        {/* Right — hero image (fix #1: ring for clean edge in dark mode, reduced dark overlay would be on gradient sections) */}
        <div
          className={cn(
            'relative transition-all duration-1000',
            loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          )}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="overflow-hidden rounded-3xl shadow-2xl dark:shadow-none ring-1 ring-black/10 dark:ring-white/5">
            <img
              src="/images/landing/hero-family.jpg"
              alt="Grandfather and grandson walking together"
              className="w-full object-cover aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4]"
              style={{ transform: `translateY(${parallaxOffset}px)`, transition: 'transform 0.1s linear' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────
   TestimonialScroller — horizontal scroll
   ──────────────────────────────────────────── */
interface Testimonial {
  quote: string;
  name: string;
  location: string;
}

export function TestimonialScroller({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="mt-12 -mx-6 px-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
      <div className="flex gap-6 sm:pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="min-w-[340px] sm:min-w-[400px] shrink-0 snap-start rounded-2xl border border-border dark:border-white/10 bg-card dark:bg-white/[0.03] p-8 shadow-sm dark:shadow-none transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:border-white/15"
          >
            <svg className="mb-4 h-8 w-8 text-primary/30" fill="currentColor" viewBox="0 0 32 32">
              <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
            </svg>
            <p className="text-base text-foreground leading-relaxed">{t.quote}</p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
