import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageSquare, Phone } from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/marketing-footer';
import { MarketingHeader } from '@/components/marketing/marketing-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Wisebox for onboarding, service support, and partnership inquiries.',
};

const channels = [
  {
    title: 'Email support',
    detail: 'support@mywisebox.com',
    note: 'Best for account and onboarding help within one business day.',
    icon: Mail,
    href: 'mailto:support@mywisebox.com',
  },
  {
    title: 'Ticket workflow',
    detail: 'In-app support tickets',
    note: 'Track updates and consultant replies directly in your workspace.',
    icon: MessageSquare,
    href: '/login?redirect=%2Ftickets',
  },
  {
    title: 'Call scheduling',
    detail: '+1 (555) 014-2026',
    note: 'For service planning and enterprise onboarding discussions.',
    icon: Phone,
    href: 'tel:+15550142026',
  },
];

export default function ContactPage() {
  return (
    <>
      <MarketingHeader />
      <main className="bg-white">
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-4xl font-bold text-wisebox-text-primary sm:text-5xl">Contact Wisebox</h1>
            <p className="text-lg text-wisebox-text-secondary">
              Reach out for onboarding, service guidance, or collaboration requests.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Card key={channel.title} className="border-gray-200">
                  <CardHeader>
                    <Icon className="h-5 w-5 text-wisebox-primary-700" />
                    <CardTitle className="text-lg text-wisebox-text-primary">{channel.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium text-wisebox-text-primary">{channel.detail}</p>
                    <p className="text-sm leading-6 text-wisebox-text-secondary">{channel.note}</p>
                    <Button asChild variant="outline" className="border-teal-200 text-wisebox-primary-700">
                      <Link href={channel.href}>Open</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
