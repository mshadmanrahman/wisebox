import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { MarketingFaq } from '@/components/marketing/content';

interface FaqAccordionProps {
  faqs: MarketingFaq[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {faqs.map((faq, index) => (
        <AccordionItem key={faq.question} value={`faq-${index}`}>
          <AccordionTrigger className="text-left text-base font-semibold text-wisebox-text-primary">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-6 text-wisebox-text-secondary">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
