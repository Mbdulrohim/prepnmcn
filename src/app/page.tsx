"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  Check,
  ClipboardCheck,
  FileText,
  GraduationCap,
  LifeBuoy,
  Lightbulb,
  MessageCircle,
  MonitorCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FaqSection from "@/components/FaqSection";
import { benefits, programs, steps } from "@/lib/site-content";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  isActive: boolean;
}

// Same order as `benefits` in site-content.
const benefitIcons = [
  BookOpen,
  FileText,
  MonitorCheck,
  ClipboardCheck,
  CalendarCheck,
  Lightbulb,
  LifeBuoy,
  Users,
];

const sampleWeek = [
  { day: "Mon", task: "Lecture notes", topic: "Medical-Surgical Nursing", done: true },
  { day: "Tue", task: "CBT practice", topic: "Timed question set", done: true },
  { day: "Wed", task: "Brainstorming", topic: "Group session", done: true },
  { day: "Thu", task: "Lecture notes", topic: "Pharmacology", current: true },
  { day: "Fri", task: "CBT practice", topic: "Timed question set" },
  { day: "Sat", task: "Weekly assessment", topic: "This week's topics" },
];

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={`space-y-4 ${align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-xl"}`}
    >
      <p className="text-sm font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </p>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground text-balance">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground text-pretty">
          {description}
        </p>
      )}
    </div>
  );
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

  const [featured, ...otherBenefits] = benefits;
  const FeaturedIcon = benefitIcons[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--color-secondary),transparent_60%)] opacity-60"
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-28 grid gap-14 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="space-y-8 text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary" />
              For RN, RM and RPHN students
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] text-foreground text-balance">
              Prepare for your licensing exam with a plan,{" "}
              <span className="text-primary">not panic.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 text-pretty">
              OPREP turns the approved NMCN curriculum into a structured study
              system, so you know what to study, when to study it, and how to
              prepare consistently.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button size="lg" className="h-12 px-7 text-base" asChild>
                <Link href="/auth/signin">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-7 text-base bg-background/80"
                asChild
              >
                <Link href="#how-it-works">How it works</Link>
              </Button>
            </div>
          </div>

          {/* Sample study week */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="rounded-2xl border bg-card shadow-xl shadow-primary/5">
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <p className="font-semibold">Your study week</p>
                  <p className="text-sm text-muted-foreground">
                    Every day has a job.
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  RN cohort
                </span>
              </div>
              <ul className="divide-y">
                {sampleWeek.map((item) => (
                  <li
                    key={item.day}
                    className={`flex items-center gap-4 px-5 py-3 ${item.current ? "bg-primary/5" : ""}`}
                  >
                    <span className="w-9 text-sm font-semibold text-muted-foreground">
                      {item.day}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.task}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.topic}
                      </p>
                    </div>
                    {item.done ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : item.current ? (
                      <span className="rounded-full border border-primary px-2 py-0.5 text-xs font-medium text-primary">
                        Today
                      </span>
                    ) : (
                      <span className="h-6 w-6 rounded-full border-2 border-dashed" />
                    )}
                  </li>
                ))}
              </ul>
              <div className="border-t px-5 py-4 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>This week</span>
                  <span>3 of 6 done</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 w-1/2 rounded-full bg-primary" />
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Example study week
            </p>
          </div>
        </div>

        {/* Trust strip */}
        <div className="relative border-y bg-muted/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid gap-4 sm:grid-cols-3 text-sm">
            {[
              { icon: GraduationCap, text: "Built on the approved NMCN curriculum" },
              { icon: MessageCircle, text: "Online, with WhatsApp as our main medium" },
              { icon: ShieldCheck, text: "One-time payment per cohort" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center justify-center sm:justify-start gap-3 text-muted-foreground"
              >
                <Icon className="h-5 w-5 shrink-0 text-primary" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The problem */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground text-balance">
            Lectures. Clinical postings. Assignments. Semester exams.{" "}
            <span className="text-muted-foreground">
              And a licensing exam at the end of it all.
            </span>
          </h2>
          <div className="space-y-5 text-lg text-muted-foreground text-pretty">
            <p>
              Preparing for professional examinations is overwhelming when
              everything else is competing for your time. Too many students end
              up relying on last-minute reading.
            </p>
            <p>
              OPREP gives you a structure to follow from day one: what to
              study, when to study it, and regular checks to show you where you
              stand, so your preparation is steady instead of rushed.
            </p>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted/40 border-y">
        <div className="max-w-6xl mx-auto space-y-12">
          <SectionHeading
            eyebrow="What you get"
            title="Everything you need, in one registration"
            description="A one-time payment gives you access to all of this for the duration of your cohort."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 rounded-2xl bg-primary p-8 text-primary-foreground flex flex-col justify-between gap-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/15">
                <FeaturedIcon className="h-6 w-6" />
              </span>
              <div className="space-y-3">
                <p className="text-2xl md:text-3xl font-bold">
                  {featured.title}
                </p>
                <p className="text-primary-foreground/80 text-lg max-w-md">
                  The whole curriculum, broken into a plan you can follow week
                  by week, so you always know what's next.
                </p>
              </div>
            </div>
            {otherBenefits.map((benefit, index) => {
              const Icon = benefitIcons[index + 1];
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border bg-card p-6 space-y-3"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="font-semibold">{benefit.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <SectionHeading
            eyebrow="Who it's for"
            title="A program for your licensing exam"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {programs.map((program) => (
              <div
                key={program.code}
                className="group rounded-2xl border bg-card p-8 space-y-4 transition-colors hover:border-primary/40"
              >
                <p className="text-5xl font-bold tracking-tight text-primary">
                  {program.code}
                </p>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{program.title}</p>
                  <p className="text-muted-foreground">{program.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground">
            We also develop programs for internship preparation and other
            healthcare career readiness initiatives.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted/40 border-y"
      >
        <div className="max-w-6xl mx-auto space-y-14">
          <SectionHeading
            eyebrow="How it works"
            title="From registration to exam day"
            description="Classes run online, so you can join from any institution in Nigeria."
          />
          <ol className="relative grid gap-10 md:grid-cols-4 md:gap-6">
            <div
              aria-hidden
              className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-border"
            />
            {steps.map((step, index) => (
              <li
                key={step.title}
                className="relative flex flex-col items-center text-center gap-4"
              >
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground ring-8 ring-muted">
                  {index + 1}
                </span>
                <p className="font-semibold text-lg">{step.title}</p>
                <p className="text-sm text-muted-foreground max-w-60">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* About */}
      <section
        id="about"
        className="scroll-mt-20 py-20 md:py-28 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="space-y-6">
            <SectionHeading
              align="left"
              eyebrow="About OPREP"
              title="Online Professional Readiness and Exam Preparation"
              description="A structured learning platform that helps nursing and midwifery students prepare for their professional licensing examinations."
            />
            <Button variant="outline" asChild>
              <Link href="/about">
                More about us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6 space-y-2">
              <p className="font-semibold">You put in the work</p>
              <p className="text-sm text-muted-foreground">
                We don't promise results. Success depends on your commitment
                and consistency. We give you the structure, resources, and
                support.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-6 space-y-2">
              <p className="font-semibold">Your access is yours</p>
              <p className="text-sm text-muted-foreground">
                Registration gives you personal access for the duration of your
                cohort. Materials aren't for sharing.
              </p>
            </div>
            <div className="sm:col-span-2 rounded-2xl border border-dashed p-6 flex gap-4">
              <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
              <p className="text-sm text-muted-foreground">
                OPREP is an independent educational platform. We are not
                affiliated with, endorsed by, or a partner of the Nursing and
                Midwifery Council of Nigeria (NMCN).
              </p>
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-muted/40 border-y">
          <div className="max-w-6xl mx-auto space-y-12">
            <SectionHeading
              eyebrow="Student stories"
              title="From students who've prepared with us"
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.id}
                  className="rounded-2xl border bg-card p-6 flex flex-col justify-between gap-6"
                >
                  <blockquote className="text-muted-foreground leading-relaxed">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <FaqSection className="border-t" />

      {/* Closing call to action */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 md:pb-28">
        <div className="max-w-6xl mx-auto rounded-3xl bg-primary px-6 py-14 md:px-16 md:py-20 text-center text-primary-foreground space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-balance">
            Start preparing the structured way.
          </h2>
          <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
            Join a cohort and get a study plan, lecture notes, CBT practice,
            assessments and mock exams in one place.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="h-12 px-7 text-base"
            asChild
          >
            <Link href="/auth/signin">
              Get started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
