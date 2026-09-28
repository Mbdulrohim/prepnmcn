"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight, CheckCheck } from "lucide-react";
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

const primaryButton =
  "inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-6 text-[15px] font-medium text-brand-foreground transition-colors hover:bg-brand/90";

const sampleThread = [
  {
    from: "tutor",
    text: "Good morning, RN cohort. Today's study guide: Pharmacology, drug calculations. The notes are in the group files.",
    time: "7:02",
  },
  {
    from: "tutor",
    text: "Brainstorming session tonight at 8pm. Bring your questions.",
    time: "7:03",
  },
  {
    from: "student",
    text: "Please can we go over IV drip rates again?",
    time: "9:41",
  },
  {
    from: "tutor",
    text: "Yes, we'll start with that tonight.",
    time: "9:45",
  },
  {
    from: "tutor",
    text: "Reminder: this week's assessment opens on Saturday.",
    time: "18:30",
  },
];

function CohortThread() {
  return (
    <figure className="w-full max-w-[400px] mx-auto">
      <div className="overflow-hidden rounded-xl border border-rule shadow-[0_24px_60px_-30px_rgba(22,22,95,0.35)]">
        <div className="flex items-center gap-3 bg-band px-4 py-3 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xs font-semibold">
            RN
          </span>
          <div className="leading-tight">
            <p className="text-sm font-medium">OPREP · RN Cohort</p>
            <p className="text-xs text-white/60">Tutors and students</p>
          </div>
        </div>
        <div className="space-y-2 bg-[#efeae2] px-3 py-4 dark:bg-[#0b141a]">
          {sampleThread.map((message, index) => {
            const mine = message.from === "student";
            return (
              <div
                key={index}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-[13.5px] leading-snug shadow-sm ${
                    mine
                      ? "bg-[#d9fdd3] text-neutral-900 dark:bg-[#005c4b] dark:text-white"
                      : "bg-white text-neutral-900 dark:bg-[#202c33] dark:text-white"
                  }`}
                >
                  {!mine && index === 0 && (
                    <p className="mb-0.5 text-xs font-semibold text-brand">
                      OPREP Tutor
                    </p>
                  )}
                  <p>{message.text}</p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-[11px] text-neutral-500 dark:text-white/50">
                    {message.time}
                    {mine && <CheckCheck className="h-3.5 w-3.5 text-sky-500" />}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-muted-foreground">
        An example day in an OPREP cohort
      </figcaption>
    </figure>
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

  return (
    <div className="bg-paper text-foreground">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid gap-14 pt-14 pb-16 md:pt-20 md:pb-24 lg:grid-cols-[1.25fr_1fr] lg:items-center">
          <div>
            <p className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="h-px w-8 bg-brand" />
              Online Professional Readiness and Exam Preparation
            </p>
            <h1 className="mt-6 font-serif text-[2.6rem] leading-[1.05] tracking-[-0.02em] sm:text-6xl lg:text-[4.4rem]">
              Prepare for your licensing exam,{" "}
              <em className="text-brand">one planned week at a time.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              OPREP helps nursing and midwifery students prepare for the RN,
              RM and RPHN examinations. We turn the approved NMCN curriculum
              into a study plan you follow with your cohort, with notes, CBT
              practice, assessments and mock exams along the way.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/auth/signin" className={primaryButton}>
                Join OPREP
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center px-2 text-[15px] font-medium underline decoration-rule underline-offset-[6px] hover:decoration-brand"
              >
                See how it works
              </Link>
            </div>
          </div>
          <CohortThread />
        </div>

        {/* Key facts */}
        <dl className="max-w-6xl mx-auto grid border-t border-rule sm:grid-cols-3">
          {[
            { term: "RN · RM · RPHN", detail: "Programs for three licensing exams" },
            { term: "NMCN curriculum", detail: "Every lecture note is built from it" },
            { term: "One payment", detail: "Access for the length of your cohort" },
          ].map((fact, index) => (
            <div
              key={fact.term}
              className={`py-6 sm:px-6 ${index > 0 ? "border-t border-rule sm:border-t-0 sm:border-l" : "sm:pl-0"}`}
            >
              <dt className="font-serif text-xl">{fact.term}</dt>
              <dd className="mt-1 text-sm text-muted-foreground">
                {fact.detail}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* What a cohort includes */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28 border-t border-rule">
        <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="font-serif text-4xl leading-tight tracking-[-0.01em] md:text-5xl">
              What your registration includes
            </h2>
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-muted-foreground">
              A one-time payment covers everything below for the duration of
              your cohort.
            </p>
          </div>
          <ol className="border-t border-foreground/80">
            {benefits.map((benefit, index) => (
              <li
                key={benefit.title}
                className="grid grid-cols-[3rem_1fr] gap-x-4 border-b border-rule py-6 sm:grid-cols-[3.5rem_1fr_1.2fr] sm:items-baseline"
              >
                <span className="font-serif text-lg text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-lg font-medium">{benefit.title}</p>
                <p className="col-start-2 mt-1 text-muted-foreground sm:col-start-3 sm:mt-0">
                  {benefit.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-16 bg-band px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-white"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
            <h2 className="font-serif text-4xl leading-tight tracking-[-0.01em] md:text-5xl">
              From registration to exam day
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-white/70 lg:justify-self-end">
              Classes run online, with WhatsApp as our main medium, so you can
              join from any institution in Nigeria.
            </p>
          </div>
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {steps.map((step, index) => (
              <li key={step.title} className="border-t border-white/25 pt-6">
                <span className="font-serif text-5xl text-white/40">
                  {index + 1}
                </span>
                <p className="mt-4 text-lg font-medium">{step.title}</p>
                <p className="mt-2 leading-relaxed text-white/70">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Programs */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl leading-tight tracking-[-0.01em] md:text-5xl">
            Who OPREP is for
          </h2>
          <div className="mt-12 grid border-t border-foreground/80 md:grid-cols-3">
            {programs.map((program, index) => (
              <div
                key={program.code}
                className={`py-8 md:px-8 ${index === 0 ? "md:pl-0" : "border-t border-rule md:border-t-0 md:border-l"}`}
              >
                <p className="font-serif text-6xl tracking-[-0.02em] text-brand">
                  {program.code}
                </p>
                <p className="mt-5 text-lg font-medium">{program.title}</p>
                <p className="mt-1 text-muted-foreground">
                  {program.description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-rule pt-6 text-muted-foreground">
            We also develop programs for internship preparation and other
            healthcare career readiness initiatives.
          </p>
        </div>
      </section>

      {/* Our position */}
      <section
        id="about"
        className="scroll-mt-16 px-4 sm:px-6 lg:px-8 py-20 md:py-28 border-t border-rule"
      >
        <div className="max-w-4xl mx-auto">
          <blockquote className="font-serif text-3xl leading-snug tracking-[-0.01em] md:text-[2.75rem] md:leading-[1.2]">
            “Success depends on your commitment, consistency and
            participation. <span className="text-brand">We provide the
            structure, the learning resources and the support.</span>”
          </blockquote>
          <div className="mt-10 grid gap-8 border-t border-rule pt-8 sm:grid-cols-2">
            <p className="text-muted-foreground leading-relaxed">
              OPREP is an independent educational platform. We are not
              affiliated with, endorsed by, or a partner of the Nursing and
              Midwifery Council of Nigeria (NMCN). Our resources are developed
              from the approved NMCN curriculum.
            </p>
            <div className="sm:justify-self-end">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 font-medium text-brand underline decoration-brand/30 underline-offset-[6px] hover:decoration-brand"
              >
                Read more about OPREP
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-28 border-t border-rule">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-4xl leading-tight md:text-5xl">
              From our students
            </h2>
            <div className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.id}
                  className="border-t border-foreground/80 pt-6"
                >
                  <blockquote className="font-serif text-xl leading-snug">
                    “{testimonial.quote}”
                  </blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-medium">{testimonial.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {testimonial.role}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      <FaqSection className="border-t border-rule" />

      {/* Closing */}
      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto border-t border-foreground/80 pt-14 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <h2 className="font-serif text-4xl leading-tight tracking-[-0.01em] md:text-6xl">
            Start preparing <em className="text-brand">properly.</em>
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:justify-end">
            <Link href="/auth/signin" className={primaryButton}>
              Join OPREP
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex h-12 items-center justify-center px-2 text-[15px] font-medium underline decoration-rule underline-offset-[6px] hover:decoration-brand"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
