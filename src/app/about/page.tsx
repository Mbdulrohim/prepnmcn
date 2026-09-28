import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CONTACT_EMAIL } from "@/lib/faqs";
import { benefits, programs } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About | OPREP",
  description:
    "OPREP (Online Professional Readiness and Exam Preparation) helps nursing and midwifery students prepare for their professional licensing examinations.",
};

const commitments = [
  {
    title: "We're independent",
    text: "OPREP is not affiliated with, endorsed by, or a partner of the Nursing and Midwifery Council of Nigeria (NMCN). Our study resources are developed using the approved NMCN curriculum.",
  },
  {
    title: "We're honest about results",
    text: "We don't guarantee that you'll pass. Success depends on your commitment, consistency and participation. We provide the structure, learning resources and support to help you prepare effectively and pass excellently.",
  },
  {
    title: "We protect our materials",
    text: "Registration gives you personal access to OPREP resources. Keeping them from being shared lets us keep developing quality resources for our students.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-paper text-foreground">
      <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <p className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px w-8 bg-brand" />
            About OPREP
          </p>
          <h1 className="mt-6 max-w-4xl font-serif text-[2.6rem] leading-[1.05] tracking-[-0.02em] sm:text-6xl lg:text-7xl">
            Online Professional Readiness and{" "}
            <em className="text-brand">Exam Preparation.</em>
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            A structured learning platform that helps nursing and midwifery
            students prepare for their professional licensing examinations.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-24 border-t border-rule">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <h2 className="font-serif text-4xl leading-tight md:text-5xl">
            Why we exist
          </h2>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              Preparing for professional examinations can be overwhelming
              when you're balancing lectures, clinical postings, assignments
              and semester examinations. Too many students end up relying on
              last-minute reading.
            </p>
            <p>
              OPREP turns the approved NMCN curriculum into a structured study
              system, so you know what to study, when to study, and how to
              prepare consistently. We provide curriculum-based study plans,
              lecture notes, CBT practice questions, assessments,
              brainstorming sessions and mock examinations.
            </p>
            <p>
              Classes are delivered online, with WhatsApp as our primary
              medium. Learning materials, announcements and activities are
              shared through our digital platforms, so students from
              institutions across Nigeria can take part regardless of
              location.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-band px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-white">
        <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-2">
          <div className="border-t border-white/25 pt-6">
            <p className="text-sm text-white/60">Mission</p>
            <p className="mt-4 font-serif text-2xl leading-snug md:text-3xl">
              Deliver accessible, high-impact learning experiences that raise
              professional standards across African healthcare.
            </p>
          </div>
          <div className="border-t border-white/25 pt-6">
            <p className="text-sm text-white/60">Vision</p>
            <p className="mt-4 font-serif text-2xl leading-snug md:text-3xl">
              A continental network where every student has clarity,
              confidence and community on their exam journey.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl leading-tight md:text-5xl">
            Who we serve
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

      <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-24 border-t border-rule">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <h2 className="font-serif text-4xl leading-tight md:text-5xl">
            What every student gets
          </h2>
          <ul className="grid border-t border-foreground/80 sm:grid-cols-2 sm:gap-x-10">
            {benefits.map((benefit) => (
              <li
                key={benefit.title}
                className="border-b border-rule py-4 text-lg"
              >
                {benefit.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 py-20 md:py-24 border-t border-rule">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <h2 className="font-serif text-4xl leading-tight md:text-5xl">
            Our commitments
          </h2>
          <div className="border-t border-foreground/80">
            {commitments.map((item) => (
              <div key={item.title} className="border-b border-rule py-6">
                <p className="text-lg font-medium">{item.title}</p>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-6xl mx-auto border-t border-foreground/80 pt-14 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <h2 className="font-serif text-4xl leading-tight md:text-5xl">
            Have a question?
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:justify-end">
            <Link
              href="/faq"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-6 text-[15px] font-medium text-brand-foreground transition-colors hover:bg-brand/90"
            >
              Read the FAQs
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
