import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
      className={`scroll-mt-16 px-4 sm:px-6 lg:px-8 py-20 md:py-28 ${className}`}
    >
      <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Heading className="font-serif text-4xl leading-tight tracking-[-0.01em] md:text-5xl">
            Frequently asked questions
          </Heading>
          <div className="mt-8 max-w-sm border-t border-rule pt-6">
            <p className="font-medium">Still have a question?</p>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Send us a message through our official social media pages or
              email us, and a member of our team will respond as soon as
              possible.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-4 inline-block font-medium text-brand underline decoration-brand/30 underline-offset-[6px] hover:decoration-brand"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
        <Accordion
          type="single"
          collapsible
          className="w-full border-t border-foreground/80"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.question}
              value={`faq-${index}`}
              className="border-rule"
            >
              <AccordionTrigger className="py-6 text-lg font-medium hover:no-underline hover:text-brand [&>svg]:size-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl space-y-3 pb-6 text-base leading-relaxed text-muted-foreground">
                {faq.answer.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {faq.list && (
                  <ul className="list-disc space-y-1 pl-5 marker:text-brand">
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
