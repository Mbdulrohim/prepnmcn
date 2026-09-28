"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PrepDynamicText from "@/components/PrepDynamicText";
import ParticleButton from "@/components/kokonutui/particle-button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Facebook, Instagram, Linkedin, Mail, Twitter } from "lucide-react";
import { CONTACT_EMAIL, faqs } from "@/lib/faqs";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  isActive: boolean;
}

export default function Home() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/website/testimonials");
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b pt-24 md:pt-0">
        <div className="relative min-h-[80vh] px-6 md:px-12 lg:px-20 flex items-center">
          <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="space-y-10 text-center lg:text-left">
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="inline-flex text-primary border-primary/30"
                >
                  Built for ambitious exam takers
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                  <PrepDynamicText className="inline" /> every exam with
                  <span className="text-primary"> O'Prep</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  Structure your prep, stay accountable with peers, and get
                  personalised guidance—across nursing, medical, legal, and more
                  professional exams.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/exams">
                  <ParticleButton
                    size="lg"
                    className="bg-primary hover:bg-primary/90 h-12 px-6 text-base"
                    {...({} as any)}
                  >
                    Start learning for free
                  </ParticleButton>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 text-base"
                  asChild
                >
                  <Link href="/dashboard">Explore the dashboard</Link>
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-8 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    30+
                  </Badge>
                  Partner universities onboarded
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    12k+
                  </Badge>
                  Learners planning smarter
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs">
                    8-step
                  </Badge>
                  Proven O'Prep methodology
                </div>
              </div>
            </div>
            <div className="relative max-w-sm mx-auto lg:mx-0 w-full">
              <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl hidden lg:block" />
              <Card className="relative border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Learner momentum</CardTitle>
                  <CardDescription>
                    Snapshots from across the O'Prep network.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Active streaks
                      </p>
                      <p className="text-2xl font-semibold text-primary">
                        1,247 learners
                      </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary w-fit">
                      +18% this week
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Students from 30+ universities build plans, stay
                    accountable, and share wins together every week.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-20 py-20 px-6 md:px-12 lg:px-20 bg-muted/40"
      >
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit">
              About OPREP
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Online Professional Readiness and Exam Preparation.
            </h2>
            <p className="text-lg text-muted-foreground">
              OPREP is a structured learning platform that helps nursing and
              midwifery students prepare for their professional licensing
              examinations. We turn the approved NMCN curriculum into a clear
              study system — study plans, lecture notes, CBT practice
              questions, assessments, brainstorming sessions, and mock
              examinations — so you know what to study, when to study it, and
              how to prepare consistently.
            </p>
            <p className="text-muted-foreground">
              Classes run online, with WhatsApp as our primary medium, so
              students from institutions across Nigeria can take part wherever
              they are.
            </p>
            <p className="text-sm text-muted-foreground">
              OPREP is an independent educational platform and is not
              affiliated with, endorsed by, or a partner of the Nursing and
              Midwifery Council of Nigeria (NMCN).
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-primary/20">
                <CardContent className="pt-6 space-y-3">
                  <Badge>Mission</Badge>
                  <p className="text-muted-foreground">
                    Deliver accessible, high-impact learning experiences that
                    raise professional standards across African healthcare.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-6 space-y-3">
                  <Badge variant="outline">Vision</Badge>
                  <p className="text-muted-foreground">
                    A continental network where every student has clarity,
                    confidence, and community on their exam journey.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          <Card className="border-primary/20 flex flex-col justify-between">
            <CardHeader>
              <CardTitle>O'Prep methodology</CardTitle>
              <CardDescription>
                The 8-step framework guiding every learning path.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {"PREPMNC".split("").map((letter, index) => (
                <Card
                  key={`${letter}-${index}`}
                  className="text-center border-dashed"
                >
                  <CardContent className="pt-6 pb-4 space-y-2">
                    <Badge className="mx-auto w-12 h-12 rounded-full text-lg font-bold flex items-center justify-center">
                      {letter}
                    </Badge>
                    <p className="text-sm font-semibold">
                      {letter === "P" && "Practice"}
                      {letter === "R" && "Review"}
                      {letter === "E" && "Evaluate"}
                      {letter === "M" && "Memorize"}
                      {letter === "N" && "Note"}
                      {letter === "C" && "Conquer"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
            <CardFooter className="pt-0">
              <p className="text-sm text-muted-foreground">
                Each step powers adaptive plans, real-time insights, and
                coaching moments inside the app.
              </p>
            </CardFooter>
          </Card>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-20 px-6 md:px-12 lg:px-20">
          <div className="max-w-6xl mx-auto space-y-10">
            <div className="space-y-4 text-center">
              <Badge variant="secondary" className="w-fit mx-auto">
                Voices from the community
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Stories from campuses we serve.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.id} className="h-full">
                  <CardContent className="space-y-6 pt-6">
                    <p className="text-muted-foreground leading-relaxed">
                      “{testimonial.quote}”
                    </p>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <section
        id="faq"
        className="scroll-mt-20 py-20 px-6 md:px-12 lg:px-20 border-t"
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
    </div>
  );
}
