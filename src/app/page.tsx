import Link from "next/link";
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
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";

export default function Home() {
  const recentUpdates = [
    {
      title: "Universities now linked to student accounts",
      description:
        "Enrollment is streamlined with verified campus data powering leaderboards and study groups.",
      date: "Oct 2025",
      tag: "Platform",
    },
    {
      title: "Feedback hub launched for students & admins",
      description:
        "Real-time conversations around feedback ensure every learner gets the support they need.",
      date: "Sep 2025",
      tag: "Community",
    },
    {
      title: "Study planner beta is live",
      description:
        "Personalized timetables adapt to exam timelines, keeping preparation on track effortlessly.",
      date: "Aug 2025",
      tag: "Product",
    },
  ];

  const featureHighlights = [
    {
      title: "Smart Study Planner",
      description:
        "Generate daily schedules around exams, classes, and personal commitments automatically.",
    },
    {
      title: "Progress Tracker",
      description:
        "Celebrate milestones with completion metrics, streaks, and supportive nudges to stay consistent.",
    },
    {
      title: "Resource Library",
      description:
        "Browse curated past questions, step-by-step solutions, and video lessons by topic and level.",
    },
    {
      title: "Exam AI Assistant",
      description:
        "Receive contextual guidance that understands your courses, study habits, and performance data.",
    },
  ];

  const testimonials = [
    {
      name: "Chioma A.",
      role: "BNSc Student, UNILAG",
      quote:
        "O'Prep gave me structure and accountability. The planner and AI prompts made revision stress-free.",
    },
    {
      name: "Ibrahim M.",
      role: "RM Candidate, ABU",
      quote:
        "Our faculty study group thrives now—we track streaks, swap resources, and stay exam ready together.",
    },
    {
      name: "Opeyemi S.",
      role: "Final Year Nursing Student, OAU",
      quote:
        "The feedback timeline keeps me heard. I can raise issues, get responses, and keep learning without blockers.",
    },
  ];

  const team = [
    {
      name: "Titilope Abidoye",
      title: "Co-founder & CEO",
      bio: "Leads product vision and community partnerships across Nigerian campuses.",
    },
    {
      name: "Ridwan Ayinde",
      title: "Co-founder & COO",
      bio: "Drives operations, academic programs, and the O'Prep study methodology roadmap.",
    },
    {
      name: "Yusuf Adamu",
      title: "Head of Engineering",
      bio: "Builds delightful learning experiences backed by data and thoughtful automation.",
    },
  ];

  const socialLinks = [
    {
      label: "Follow on X",
      href: "https://twitter.com",
      icon: <Twitter className="h-5 w-5" aria-hidden />,
    },
    {
      label: "Connect on LinkedIn",
      href: "https://linkedin.com",
      icon: <Linkedin className="h-5 w-5" aria-hidden />,
    },
    {
      label: "Join on Instagram",
      href: "https://instagram.com",
      icon: <Instagram className="h-5 w-5" aria-hidden />,
    },
    {
      label: "Like on Facebook",
      href: "https://facebook.com",
      icon: <Facebook className="h-5 w-5" aria-hidden />,
    },
    {
      label: "Email the team",
      href: "mailto:contact@prepnmcn.com",
      icon: <Mail className="h-5 w-5" aria-hidden />,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b pt-24 md:pt-0">
        <div className="relative min-h-[80vh] px-6 md:px-12 lg:px-20 flex items-center">
          <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.05fr_0.95fr] items-center">
            <div className="space-y-10 text-center lg:text-left">
              <div className="space-y-4">
                <Badge variant="outline" className="inline-flex text-primary border-primary/30">
                  Built for ambitious exam takers
                </Badge>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                  <PrepDynamicText className="inline" /> every exam with
                  <span className="text-primary"> O'Prep</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  Structure your prep, stay accountable with peers, and get personalised guidance—across nursing, medical, legal, and more professional exams.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth/signin">
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
                  <Badge variant="secondary" className="px-3 py-1 text-xs">30+</Badge>
                  Partner universities onboarded
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs">12k+</Badge>
                  Learners planning smarter
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Badge variant="secondary" className="px-3 py-1 text-xs">8-step</Badge>
                  Proven O'Prep methodology
                </div>
              </div>
            </div>
            <div className="relative max-w-sm mx-auto lg:mx-0 w-full">
              <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl hidden lg:block" />
              <Card className="relative border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Learner momentum</CardTitle>
                  <CardDescription>Snapshots from across the O'Prep network.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Active streaks
                      </p>
                      <p className="text-2xl font-semibold text-primary">1,247 learners</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary w-fit">+18% this week</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Students from 30+ universities build plans, stay accountable, and share wins together every week.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 lg:px-20 bg-muted/40">
        <div className="max-w-6xl mx-auto grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Badge variant="secondary" className="w-fit">
              About O'Prep
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              We exist to help every Nigerian professional exam student thrive from admission to certification.
            </h2>
            <p className="text-lg text-muted-foreground">
              Built by a team of educators, clinicians, and product thinkers, O'Prep fuses evidence-backed study systems with intuitive technology. We prioritise accountability, collaboration, and support so learners can focus on the work that matters.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-primary/20">
                <CardContent className="pt-6 space-y-3">
                  <Badge>Mission</Badge>
                  <p className="text-muted-foreground">
                    Deliver accessible, high-impact learning experiences that raise professional standards across African healthcare.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-primary/20">
                <CardContent className="pt-6 space-y-3">
                  <Badge variant="outline">Vision</Badge>
                  <p className="text-muted-foreground">
                    A continental network where every student has clarity, confidence, and community on their exam journey.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          <Card className="border-primary/20 flex flex-col justify-between">
            <CardHeader>
              <CardTitle>O'Prep methodology</CardTitle>
              <CardDescription>The 8-step framework guiding every learning path.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {"PREPMNC".split("").map((letter, index) => (
                <Card key={`${letter}-${index}`} className="text-center border-dashed">
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
                Each step powers adaptive plans, real-time insights, and coaching moments inside the app.
              </p>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <Badge variant="secondary" className="w-fit">
                Recent updates
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-4">
                Building faster with your feedback every release cycle.
              </h2>
            </div>
            <Button variant="outline" asChild>
              <Link href="/blog">See all updates</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {recentUpdates.map((update) => (
              <Card key={update.title} className="h-full">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{update.date}</span>
                    <Badge variant="outline">{update.tag}</Badge>
                  </div>
                  <CardTitle className="text-xl">{update.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {update.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 md:px-12 lg:px-20 bg-muted/40">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="space-y-4 text-center">
            <Badge variant="secondary" className="w-fit mx-auto">
              Why learners stay
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              A complete prep command centre in one login.
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Every module aligns with the realities of professional programs—tight schedules, multiple exams, and the need for collaborative accountability.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featureHighlights.map((feature) => (
              <Card key={feature.title} className="h-full border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

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
              <Card key={testimonial.name} className="h-full">
                <CardContent className="space-y-6 pt-6">
                  <p className="text-muted-foreground leading-relaxed">
                    “{testimonial.quote}”
                  </p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/*
      <section className="py-20 px-6 md:px-12 lg:px-20 bg-muted/40">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="space-y-4 text-center">
            <Badge variant="secondary" className="w-fit mx-auto">
              Meet the team
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Operators, educators, and professionals building with you.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {team.map((member) => (
              <Card key={member.name} className="h-full">
                <CardContent className="pt-6 space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border">
                      <AvatarImage src={``} alt={member.name} />
                      <AvatarFallback>
                        {member.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.title}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      */}

      <section className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <Card className="border-primary/20">
            <CardHeader>
              <Badge variant="secondary" className="w-fit">
                Join the movement
              </Badge>
              <CardTitle className="text-3xl">Stay plugged into O'Prep</CardTitle>
              <CardDescription>
                Be the first to access the resource library, exam AI assistant, and cross-campus study forums launching soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {socialLinks.map((link) => (
                  <Button
                    key={link.label}
                    variant="outline"
                    className="justify-start gap-3"
                    asChild
                  >
                    <Link href={link.href} target="_blank" rel="noreferrer">
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="border-dashed border-primary/30">
            <CardHeader>
              <CardTitle className="text-2xl">What’s coming next</CardTitle>
              <CardDescription>
                Our roadmap focuses on connection, motivation, and recognition for consistent learners.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <p className="font-semibold">Progress tracker dashboards</p>
                <p className="text-sm text-muted-foreground">
                  Monitor completion rates, daily streaks, and days left till exams at a glance.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">University communities</p>
                <p className="text-sm text-muted-foreground">
                  Dedicated forums for each partner campus to collaborate and host revision sprints.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-semibold">Study buddies & certification</p>
                <p className="text-sm text-muted-foreground">
                  Pair up for accountability and download certificates once your plan is completed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-muted text-muted-foreground py-12 px-6 md:px-12 lg:px-20 border-t">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">O'Prep</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Empowering Nigeria's exam prep community with structure, support, and smart technology.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <Button
                  key={`footer-${link.label}`}
                  variant="ghost"
                  className="gap-2"
                  asChild
                >
                  <Link href={link.href} target="_blank" rel="noreferrer">
                    {link.icon}
                    <span className="text-sm">{link.label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
          <Separator />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm">
            <p>© {new Date().getFullYear()} O'Prep. All rights reserved.</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link
                href="mailto:contact@prepnmcn.com"
                className="hover:text-primary transition-colors"
              >
                contact@prepnmcn.com
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
