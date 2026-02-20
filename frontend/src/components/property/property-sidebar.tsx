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

export function PropertySidebar({ property }: PropertySidebarProps) {
  return (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <Card className="bg-wisebox-background-card border-wisebox-border overflow-hidden">
        <div className="h-48 bg-slate-800 relative flex items-center justify-center">
          <div className="text-center space-y-2">
            <MapPin className="h-8 w-8 text-wisebox-primary mx-auto" />
            <p className="text-sm text-wisebox-text-secondary">Your Property</p>
          </div>
          {/* Subtle grid overlay for map effect */}
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
            className="w-full h-auto flex-col gap-2 py-4 border-wisebox-border text-white hover:bg-wisebox-background-lighter hover:border-wisebox-border-light"
          >
            <BookOpen className="h-5 w-5 text-wisebox-primary" />
            <span className="text-xs">Journal</span>
          </Button>
        </Link>
        <Link href={`/properties/${property.id}/recommendations`}>
          <Button
            variant="outline"
            className="w-full h-auto flex-col gap-2 py-4 border-wisebox-border text-white hover:bg-wisebox-background-lighter hover:border-wisebox-border-light"
          >
            <BarChart3 className="h-5 w-5 text-wisebox-primary" />
            <span className="text-xs">Analytics</span>
          </Button>
        </Link>
        <Link href="/tickets">
          <Button
            variant="outline"
            className="w-full h-auto flex-col gap-2 py-4 border-wisebox-border text-white hover:bg-wisebox-background-lighter hover:border-wisebox-border-light"
          >
            <MessageSquare className="h-5 w-5 text-wisebox-primary" />
            <span className="text-xs">Consult</span>
          </Button>
        </Link>
      </div>

      {/* Marketing Banner */}
      <Card className="bg-gradient-to-br from-wisebox-primary-700 via-wisebox-primary-600 to-wisebox-primary-500 border-0 overflow-hidden">
        <CardContent className="p-5 space-y-3">
          <p className="text-white/80 text-xs uppercase tracking-wider">Need help?</p>
          <h3 className="text-lg font-bold text-white leading-tight">
            Don't have all your papers?
          </h3>
          <p className="text-sm text-white/80">
            Our experts can help you gather and verify your property documents.
          </p>
          <Button asChild size="sm" className="bg-white text-wisebox-primary-700 hover:bg-white/90 font-semibold">
            <Link href="/workspace/services">Explore Services</Link>
          </Button>
        </CardContent>
      </Card>

      {/* FAQ Accordion */}
      <Card className="bg-wisebox-background-card border-wisebox-border">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Frequently Asked Questions</h3>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="q1" className="border-wisebox-border">
              <AccordionTrigger className="text-sm text-white hover:text-wisebox-primary py-3 hover:no-underline">
                How do I protect my property?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-wisebox-text-secondary pb-3">
                Start by digitizing all your property documents through Wisebox. Our platform helps you maintain a verified digital record that can be used as evidence of ownership.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2" className="border-wisebox-border">
              <AccordionTrigger className="text-sm text-white hover:text-wisebox-primary py-3 hover:no-underline">
                What documents do I need?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-wisebox-text-secondary pb-3">
                Essential documents include your deed of ownership (dalil), mutation records, tax receipts, and any relevant court orders. Our checklist will guide you through what's needed.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3" className="border-wisebox-border">
              <AccordionTrigger className="text-sm text-white hover:text-wisebox-primary py-3 hover:no-underline">
                How long does verification take?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-wisebox-text-secondary pb-3">
                Initial verification typically takes 3-5 business days. Complex cases involving multiple co-owners or disputed records may take longer.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4" className="border-wisebox-border border-b-0">
              <AccordionTrigger className="text-sm text-white hover:text-wisebox-primary py-3 hover:no-underline">
                Can I add co-owners later?
              </AccordionTrigger>
              <AccordionContent className="text-sm text-wisebox-text-secondary pb-3">
                Yes, you can add or modify co-owners at any time through the property edit page. All co-owners will be notified of changes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
