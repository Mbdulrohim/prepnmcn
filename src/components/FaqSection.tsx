import { Mail } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, faqs } from "@/lib/faqs";

export default function FaqSection({
  className = "",
  as: Heading = "h2",
}: {
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <section
      id="faq"
      className={`scroll-mt-20 py-20 md:py-28 px-4 sm:px-6 lg:px-8 ${className}`}
    >
      <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              FAQs
            </p>
            <Heading className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Frequently asked questions
            </Heading>
          </div>
          <div className="rounded-2xl border bg-muted/40 p-6 space-y-4">
            <p className="font-semibold">Still have a question?</p>
            <p className="text-sm text-muted-foreground">
              We'd be happy to help. Send us a message through our official
              social media pages or email us, and a member of our team will
              respond as soon as possible.
            </p>
            <Button variant="outline" className="bg-background" asChild>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail className="mr-2 h-4 w-4" />
                {CONTACT_EMAIL}
              </a>
            </Button>
          </div>
        </div>
        <Accordion type="single" collapsible className="w-full border-t">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="py-5 text-base font-semibold hover:no-underline hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-5 text-base text-muted-foreground leading-relaxed">
                {faq.answer.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {faq.list && (
                  <ul className="list-disc pl-5 space-y-1">
                    {faq.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {faq.footnote && <p>{faq.footnote}</p>}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
