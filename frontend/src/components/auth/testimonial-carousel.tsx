'use client';

import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "WiseBox has been a lifesaver for managing my family's properties back in Bangladesh. Everything is now organized and accessible from Toronto. I can finally sleep peacefully knowing our assets are properly documented and protected.",
    name: 'Ahmed Hassan',
    title: 'Software Engineer',
    location: 'Toronto, Canada',
  },
  {
    quote:
      "As a grandfather, I find great comfort in knowing that WiseBox allows me to manage our family's properties in Bangladesh from my home in Sydney. I can easily keep track of all the important documents and transactions.",
    name: 'Enayet Chowdhury',
    title: 'Retd. Physician',
    location: 'Sydney, Australia',
  },
  {
    quote:
      'I was worried about losing my father\'s land documents after he passed. WiseBox helped me organize the succession process, track every khatian and deed, and now everything is in one place for my children.',
    name: 'Fatima Rahman',
    title: 'University Lecturer',
    location: 'London, UK',
  },
  {
    quote:
      'Managing property from abroad used to mean expensive trips and endless phone calls. With WiseBox, I verified my mutation khatian, paid land tax, and hired a consultant without leaving Stockholm.',
    name: 'Rafiq Uddin',
    title: 'IT Consultant',
    location: 'Stockholm, Sweden',
  },
];

export function AuthTestimonialCarousel({ className }: { className?: string }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActive((current) => (current + 1) % testimonials.length);
    }, 2500);
    return () => window.clearInterval(interval);
  }, []);

  const t = testimonials[active];

  return (
    <div
      className={cn(
        'hidden lg:flex lg:w-1/2 relative overflow-hidden',
        className,
      )}
    >
      {/* Theme-swapped gradient backgrounds */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat block dark:hidden"
        style={{ backgroundImage: "url('/images/gradients/gradient-10-light.png')" }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat hidden dark:block"
        style={{ backgroundImage: "url('/images/gradients/gradient-10-dark.png')" }}
      />
      {/* Bottom-to-top overlay: darkens bottom for testimonial text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Testimonial content pinned to bottom */}
      <div className="relative z-10 flex flex-col justify-end h-full p-10 text-white w-full">
        <div
          key={active}
          className="max-w-xl space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <svg
            className="w-10 h-10 text-white/80"
            fill="currentColor"
            viewBox="0 0 32 32"
          >
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
          </svg>
          <p className="text-lg leading-relaxed">{t.quote}</p>
          <div>
            <p className="font-semibold">{t.name}</p>
            <p className="text-sm text-white/80">{t.title}</p>
            <p className="text-sm text-white/60 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              {t.location}
            </p>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === active
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/40 hover:bg-white/60',
              )}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
