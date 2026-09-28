"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LifeBuoy,
  Lightbulb,
  Mail,
  MessageCircle,
  MonitorCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FaqSection from "@/components/FaqSection";
import { CONTACT_EMAIL } from "@/lib/faqs";
import { benefits, programs, steps } from "@/lib/site-content";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  isActive: boolean;
}

const benefitIcons = [
  BookOpen,
  FileText,
  MonitorCheck,
  ClipboardCheck,
  Lightbulb,
  CalendarCheck,
  LifeBuoy,
  Users,
];

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
      {/* Hero */}
      <section className="relative overflow-hidden border-b pt-24 md:pt-0">
        <div className="relative min-h-[80vh] px-6 md:px-12 lg:px-20 flex items-center">
          <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="space-y-10 text-center lg:text-left">
              <div className="space-y-4">
                <Badge
                  variant="outline"
                  className="inline-flex text-primary border-primary/30"
                >
                  Online Professional Readiness and Exam Preparation
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                  Prepare for your nursing and midwifery exams with
                  <span className="text-primary"> OPREP</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  A structured study system built on the approved NMCN
                  curriculum, so you know what to study, when to study it, and
                  how to prepare consistently for your RN, RM or RPHN
                  examination.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="h-12 px-6 text-base" asChild>
                  <Link href="/auth/register">
                    Register now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 px-6 text-base"
                  asChild
                >
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-muted-foreground">
                {programs.map((program) => (
                  <Badge
                    key={program.code}
                    variant="secondary"
                    className="px-3 py-1"
                  >
                    {program.code} · {program.title}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="relative max-w-sm mx-auto lg:mx-0 w-full">
              <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl hidden lg:block" />
              <Card className="relative border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Inside your cohort</CardTitle>
                  <CardDescription>
                    One payment. Everything you need to prepare.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {benefits.slice(0, 6).map((benefit, index) => {
                      const Icon = benefitIcons[index];
                      return (
                        <li
                          key={benefit.title}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </span>
                          {benefit.title}
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why OPREP */}
      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto space-y-6 text-center">
          <Badge variant="secondary" className="w-fit mx-auto">
            Why OPREP
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Stop relying on last-minute reading.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Preparing for professional examinations can be overwhelming when
            you're balancing lectures, clinical postings, assignments, and
            semester examinations. OPREP helps you stay organised by turning
            the curriculum into a structured study system, so you prepare
            steadily instead of cramming at the end.
          </p>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-muted/40">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="space-y-4 text-center">
            <Badge variant="secondary" className="w-fit mx-auto">
              Who it's for
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Programs for every licensing exam
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {programs.map((program) => (
              <Card key={program.code} className="border-primary/20">
                <CardHeader>
                  <Badge className="w-fit">{program.code}</Badge>
                  <CardTitle className="pt-2">{program.title}</CardTitle>
                  <CardDescription>{program.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <p className="text-center text-muted-foreground">
            We also develop programs for internship preparation and other
            healthcare career readiness initiatives.
          </p>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="space-y-4 text-center">
            <Badge variant="secondary" className="w-fit mx-auto">
              What you get
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Everything in one registration
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A one-time payment gives you access to all of this for the
              duration of your cohort.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <Card key={benefit.title} className="h-full">
                  <CardContent className="pt-6 space-y-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="font-semibold">{benefit.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 py-20 px-6 md:px-12 lg:px-20 bg-muted/40"
      >
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="space-y-4 text-center">
            <Badge variant="secondary" className="w-fit mx-auto">
              How it works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              From registration to exam day
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Classes run online, with WhatsApp as our primary medium, so you
              can join from any institution in Nigeria.
            </p>
          </div>
          <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <li key={step.title}>
                <Card className="h-full border-primary/20">
                  <CardContent className="pt-6 space-y-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                      {index + 1}
                    </span>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-20 py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit">
              About OPREP
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              A structured path to your professional licence.
            </h2>
            <p className="text-lg text-muted-foreground">
              OPREP is a structured learning platform that helps nursing and
              midwifery students prepare for their professional licensing
              examinations, with curriculum-based study plans, lecture notes,
              CBT practice questions, assessments, brainstorming sessions, and
              mock examinations.
            </p>
            <Button variant="outline" asChild>
              <Link href="/about">
                Learn more about us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-6 flex gap-4">
                <GraduationCap className="h-6 w-6 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="font-semibold">Built on the NMCN curriculum</p>
                  <p className="text-sm text-muted-foreground">
                    Our study resources are developed from the approved
                    curriculum.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-6 flex gap-4">
                <MessageCircle className="h-6 w-6 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="font-semibold">Learn from anywhere</p>
                  <p className="text-sm text-muted-foreground">
                    Everything runs online, with WhatsApp as our primary
                    medium.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20">
              <CardContent className="pt-6 flex gap-4">
                <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="font-semibold">Independent</p>
                  <p className="text-sm text-muted-foreground">
                    OPREP is not affiliated with, endorsed by, or a partner of
                    the Nursing and Midwifery Council of Nigeria (NMCN).
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-20 px-6 md:px-12 lg:px-20 bg-muted/40">
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

      <FaqSection className="border-t" />

      {/* Final call to action */}
      <section className="py-20 px-6 md:px-12 lg:px-20 border-t bg-primary/5">
        <div className="max-w-3xl mx-auto space-y-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Ready to start preparing?
          </h2>
          <p className="text-lg text-muted-foreground">
            Success depends on your commitment and consistency. We'll give you
            the structure, resources, and support to prepare effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="h-12 px-6 text-base" asChild>
              <Link href="/auth/register">
                Register now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-base"
              asChild
            >
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail className="mr-2 h-4 w-4" />
                Contact us
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
