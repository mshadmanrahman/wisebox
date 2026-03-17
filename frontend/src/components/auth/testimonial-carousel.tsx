'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  location: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      "WiseBox has been a lifesaver for managing my family's properties back in Bangladesh. Everything is now organized and accessible from Toronto. I can finally sleep peacefully knowing our assets are properly documented and protected.",
    name: 'Ahmed Hassan',
    title: 'Software Engineer',
    location: 'Toronto, Canada',
    image: '/images/auth/father-son-laptop.jpg',
  },
  {
    quote:
      "As a grandfather, I find great comfort in knowing that WiseBox allows me to manage our family's properties in Bangladesh from my home in Sydney. I can easily keep track of all the important documents and transactions.",
    name: 'Enayet Chowdhury',
    title: 'Retd. Physician',
    location: 'Sydney, Australia',
    image: '/images/auth/grandfather-grandson-park.jpg',
  },
  {
    quote:
      'I was worried about losing my father\'s land documents after he passed. WiseBox helped me organize the succession process, track every khatian and deed, and now everything is in one place for my children.',
    name: 'Fatima Rahman',
    title: 'University Lecturer',
    location: 'London, UK',
    image: '/images/auth/woman-armchair-phone.jpg',
  },
  {
    quote:
      'Managing property from abroad used to mean expensive trips and endless phone calls. With WiseBox, I verified my mutation khatian, paid land tax, and hired a consultant without leaving Stockholm.',
    name: 'Rafiq Uddin',
    title: 'IT Consultant',
    location: 'Stockholm, Sweden',
    image: '/images/auth/woman-cafe-laptop.jpg',
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
      {/* Full-bleed photo backgrounds */}
      {testimonials.map((slide, i) => (
        <div
          key={i}
          className={cn(
            'absolute inset-0 transition-opacity duration-700',
            i === active ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Image
            src={slide.image}
            alt={slide.name}
            fill
            className="object-cover"
            sizes="50vw"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Gradient overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
        {/* Location badge */}
        <div className="flex justify-end">
          <div
            key={active}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm animate-in fade-in duration-500"
          >
            <MapPin className="w-4 h-4" />
            <span>{t.location}</span>
          </div>
        </div>

        {/* Testimonial content */}
        <div
          key={active}
          className="max-w-xl space-y-4 bg-wisebox-overlay-light backdrop-blur-sm p-8 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500"
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
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 pt-4">
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
