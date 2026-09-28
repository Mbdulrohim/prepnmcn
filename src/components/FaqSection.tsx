import { Mail } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CONTACT_EMAIL, faqs } from "@/lib/faqs";

export default function FaqSection({ className = "" }: { className?: string }) {
  return (
    <section
      id="faq"
      className={`scroll-mt-20 py-20 px-6 md:px-12 lg:px-20 ${className}`}
    >
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-4 text-center">
          <Badge variant="secondary" className="w-fit mx-auto">
            FAQs
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Frequently asked questions
          </h2>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={faq.question} value={`faq-${index}`}>
              <AccordionTrigger className="text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="space-y-3 text-muted-foreground leading-relaxed">
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
        <Card className="border-primary/20 text-center">
          <CardHeader>
            <CardTitle>Still have a question?</CardTitle>
            <CardDescription>
              We'd be happy to help. Send us a message through our official
              social media pages or email us, and a member of our team will
              respond as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail className="mr-2 h-4 w-4" />
                {CONTACT_EMAIL}
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
