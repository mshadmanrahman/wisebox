'use client';

import Link from 'next/link';
import { BarChart3, BookOpen, MapPin, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { Property } from '@/types';

interface PropertySidebarProps {
  property: Property;
}

const FAQ_ITEMS = [
  {
    q: 'What documents do I need for my property?',
    a: 'Key documents include the deed, mutation certificate, tax receipts, and any legal agreements related to the property.',
  },
  {
    q: 'How do I add a consultant?',
    a: 'You can open a support ticket and request a consultant assignment from the tickets page.',
  },
  {
    q: 'What is a readiness score?',
    a: 'Your readiness score reflects how complete your property documentation is, from 0 (no documents) to 100 (fully documented).',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All documents and data are encrypted at rest and in transit, with role-based access controls.',
  },
];

export function PropertySidebar({ property }: PropertySidebarProps) {
  return (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <Card className="bg-card border border-border overflow-hidden">
        <div className="h-48 bg-muted relative flex items-center justify-center">
          <div className="text-center space-y-2">
            <MapPin className="h-8 w-8 text-primary mx-auto" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground">Your property location</p>
          </div>
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
        </div>
      </Card>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Link href={`/properties/${property.id}/journal`}>
          <Button
            variant="outline"
            className="w-full h-auto flex-col gap-2 py-4 border-border text-foreground hover:bg-muted hover:border-border transition-all duration-200"
          >
            <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span className="text-xs">Journal</span>
          </Button>
        </Link>
        <Link href={`/properties/${property.id}/recommendations`}>
          <Button
            variant="outline"
            className="w-full h-auto flex-col gap-2 py-4 border-border text-foreground hover:bg-muted hover:border-border transition-all duration-200"
          >
            <BarChart3 className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span className="text-xs">Analytics</span>
          </Button>
        </Link>
        <Link href="/tickets">
          <Button
            variant="outline"
            className="w-full h-auto flex-col gap-2 py-4 border-border text-foreground hover:bg-muted hover:border-border transition-all duration-200"
          >
            <MessageSquare className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <span className="text-xs">Consult</span>
          </Button>
        </Link>
      </div>

      {/* Need Help Card */}
      <Card className="bg-card border border-primary/20 rounded-2xl overflow-hidden">
        <CardContent className="p-6 space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">Need Help?</p>
          <h3 className="text-base font-semibold text-foreground leading-tight">
            Don&rsquo;t have all your papers?
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We can help you locate, verify, and organize your property documents with expert support.
          </p>
          <Button asChild variant="ghost" className="border border-primary text-primary rounded-full px-5 py-2 text-sm font-medium hover:bg-primary/5 h-auto">
            <Link href="/workspace/services">Explore Services</Link>
          </Button>
        </CardContent>
      </Card>

      {/* FAQ Accordion */}
      <Card className="bg-card border border-border">
        <CardContent className="p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`q${i + 1}`}
                className={i === FAQ_ITEMS.length - 1 ? 'border-border border-b-0' : 'border-border'}
              >
                <AccordionTrigger className="text-sm text-foreground hover:text-primary py-3 hover:no-underline transition-colors duration-200">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-3">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
