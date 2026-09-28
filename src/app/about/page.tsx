import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CONTACT_EMAIL } from "@/lib/faqs";
import { benefits, programs } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "About | OPREP",
  description:
    "OPREP (Online Professional Readiness and Exam Preparation) helps nursing and midwifery students prepare for their professional licensing examinations.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-20 px-6 md:px-12 lg:px-20 border-b">
        <div className="max-w-3xl mx-auto space-y-6 text-center">
          <Badge variant="secondary" className="w-fit mx-auto">
            About OPREP
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Online Professional Readiness and Exam Preparation
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            OPREP is a structured learning platform that helps nursing and
            midwifery students prepare for their professional licensing
            examinations.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Why we exist
          </h2>
          <p>
            Preparing for professional examinations can be overwhelming when
            you're balancing lectures, clinical postings, assignments, and
            semester examinations. Too many students end up relying on
            last-minute reading.
          </p>
          <p>
            OPREP turns the approved NMCN curriculum into a structured study
            system, so you know what to study, when to study, and how to
            prepare consistently. We provide curriculum-based study plans,
            lecture notes, CBT practice questions, assessments, brainstorming
            sessions, and mock examinations to support steady preparation.
          </p>
          <p>
            Classes are delivered online, with WhatsApp as our primary medium.
            Learning materials, announcements, and activities are shared
            through our digital platforms, so students from institutions across
            Nigeria can take part regardless of location.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 lg:px-20 bg-muted/40">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2">
          <Card className="border-primary/20">
            <CardContent className="pt-6 space-y-3">
              <Badge>Mission</Badge>
              <p className="text-muted-foreground">
                Deliver accessible, high-impact learning experiences that raise
                professional standards across African healthcare.
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
      </section>

      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto space-y-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">
            Who we serve
          </h2>
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

      <section className="py-20 px-6 md:px-12 lg:px-20 bg-muted/40">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center">
            What every student gets
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2 text-muted-foreground">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="flex gap-2">
                <span className="text-primary">•</span>
                {benefit.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Our commitments
          </h2>
          <p>
            <span className="font-semibold text-foreground">
              We're independent.
            </span>{" "}
            OPREP is not affiliated with, endorsed by, or a partner of the
            Nursing and Midwifery Council of Nigeria (NMCN). Our study
            resources are developed using the approved NMCN curriculum.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              We're honest about results.
            </span>{" "}
            We don't guarantee that you'll pass. Success depends on your
            commitment, consistency, and participation. We provide the
            structure, learning resources, and support to help you prepare
            effectively and pass excellently.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              We protect our materials.
            </span>{" "}
            Registration gives you personal access to OPREP resources. Keeping
            them from being shared lets us keep developing quality resources
            for our students.
          </p>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 lg:px-20 border-t bg-primary/5">
        <div className="max-w-3xl mx-auto space-y-6 text-center">
          <h2 className="text-3xl font-bold text-foreground">
            Have questions?
          </h2>
          <p className="text-lg text-muted-foreground">
            Read our FAQs or send us a message. A member of our team will
            respond as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/faq">
                Read the FAQs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <Mail className="mr-2 h-4 w-4" />
                {CONTACT_EMAIL}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
