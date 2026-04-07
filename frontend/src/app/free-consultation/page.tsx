import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Free Consultation - Wisebox',
  description:
    'Book a free 30-minute property consultation with a Wisebox expert.',
  alternates: {
    canonical: '/free-consultation',
  },
};

/**
 * Standalone route for `/free-consultation`.
 * External links (QR codes, social, email campaigns) point here.
 * Redirects to the public services page where users can start the
 * assessment flow or sign up to book a free consultation.
 */
export default function FreeConsultationPage() {
  redirect('/services');
}
