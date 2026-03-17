import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { MarketingFaq } from '@/components/marketing/content';

interface FaqAccordionProps {
  faqs: MarketingFaq[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={faq.question} value={`faq-${index}`} className="border-b border-border">
          <AccordionTrigger className="text-left text-base font-medium text-foreground py-5" style={{ letterSpacing: '-0.01em' }}>
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground" style={{ lineHeight: '1.6' }}>
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
