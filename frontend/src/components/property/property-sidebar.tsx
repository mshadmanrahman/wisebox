'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('properties');

  return (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <Card className="bg-wisebox-background-card border-wisebox-border overflow-hidden">
        <div className="h-48 bg-wisebox-background-lighter relative flex items-center justify-center">
          <div className="text-center space-y-2">
            <MapPin className="h-8 w-8 text-wisebox-primary mx-auto" />
            <p className="text-sm text-wisebox-text-secondary">{t('sidebar.yourProperty')}</p>
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
            className="w-full h-auto flex-col gap-2 py-4 border-wisebox-border text-wisebox-text-primary hover:bg-wisebox-background-lighter hover:border-wisebox-border-light"
          >
            <BookOpen className="h-5 w-5 text-wisebox-primary" />
            <span className="text-xs">{t('sidebar.journal')}</span>
          </Button>
        </Link>
        <Link href={`/properties/${property.id}/recommendations`}>
          <Button
            variant="outline"
            className="w-full h-auto flex-col gap-2 py-4 border-wisebox-border text-wisebox-text-primary hover:bg-wisebox-background-lighter hover:border-wisebox-border-light"
          >
            <BarChart3 className="h-5 w-5 text-wisebox-primary" />
            <span className="text-xs">{t('sidebar.analytics')}</span>
          </Button>
        </Link>
        <Link href="/tickets">
          <Button
            variant="outline"
            className="w-full h-auto flex-col gap-2 py-4 border-wisebox-border text-wisebox-text-primary hover:bg-wisebox-background-lighter hover:border-wisebox-border-light"
          >
            <MessageSquare className="h-5 w-5 text-wisebox-primary" />
            <span className="text-xs">{t('sidebar.consult')}</span>
          </Button>
        </Link>
      </div>

      {/* Marketing Banner */}
      <Card className="bg-gradient-to-br from-wisebox-primary-700 via-wisebox-primary-600 to-wisebox-primary-500 border-0 overflow-hidden">
        <CardContent className="p-5 space-y-3">
          <p className="text-white/80 text-xs uppercase tracking-wider">{t('sidebar.needHelp')}</p>
          <h3 className="text-lg font-bold text-white leading-tight">
            {t('sidebar.dontHavePapers')}
          </h3>
          <p className="text-sm text-white/80">
            {t('sidebar.dontHavePapersDesc')}
          </p>
          <Button asChild size="sm" className="bg-white text-wisebox-primary-700 hover:bg-white/90 font-semibold">
            <Link href="/workspace/services">{t('sidebar.exploreServices')}</Link>
          </Button>
        </CardContent>
      </Card>

      {/* FAQ Accordion */}
      <Card className="bg-wisebox-background-card border-wisebox-border">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-wisebox-text-primary mb-4">{t('sidebar.faq')}</h3>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="q1" className="border-wisebox-border">
              <AccordionTrigger className="text-sm text-wisebox-text-primary hover:text-wisebox-primary py-3 hover:no-underline">
                {t('sidebar.faqQ1')}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-wisebox-text-secondary pb-3">
                {t('sidebar.faqA1')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2" className="border-wisebox-border">
              <AccordionTrigger className="text-sm text-wisebox-text-primary hover:text-wisebox-primary py-3 hover:no-underline">
                {t('sidebar.faqQ2')}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-wisebox-text-secondary pb-3">
                {t('sidebar.faqA2')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3" className="border-wisebox-border">
              <AccordionTrigger className="text-sm text-wisebox-text-primary hover:text-wisebox-primary py-3 hover:no-underline">
                {t('sidebar.faqQ3')}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-wisebox-text-secondary pb-3">
                {t('sidebar.faqA3')}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q4" className="border-wisebox-border border-b-0">
              <AccordionTrigger className="text-sm text-wisebox-text-primary hover:text-wisebox-primary py-3 hover:no-underline">
                {t('sidebar.faqQ4')}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-wisebox-text-secondary pb-3">
                {t('sidebar.faqA4')}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
