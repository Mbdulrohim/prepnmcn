import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import PrepDynamicText from "@/components/PrepDynamicText";
import ParticleButton from "@/components/kokonutui/particle-button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center px-8 md:px-16 lg:px-24">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content - Left Side */}
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              <PrepDynamicText className="inline" /> Your Exams with{" "}
              <span className="text-primary">O'Prep</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              The proven 8-step study system that works.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 pt-2">
              <Link href="/auth/signin">
                <ParticleButton
                  size="lg"
                  className="bg-primary hover:bg-primary/90 h-12 px-6 text-base"
                  {...({} as any)}
                >
                  Start Now
                </ParticleButton>
              </Link>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-6 text-base border-2"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>

          {/* Image - Right Side */}
          <div className="flex justify-center lg:justify-end">
            <img
              src="/prephero.png"
              alt="Student success with O'Prep"
              className="max-w-md w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Main Programs Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Our <span className="text-primary">Programs</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect pathway for your exam preparation journey using
              our O'Prep methodology
            </p>
          </div>

          {/* O'Prep Methodology */}
          <div className="bg-card rounded-2xl p-8 shadow-lg border-2 border-primary/20 mb-12">
            <div className="text-center space-y-6">
              <h3 className="text-3xl font-bold text-primary">
                The O'Prep Methodology
              </h3>
              <p className="text-lg text-muted-foreground">
                Our proven 8-step system for exam success
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="text-center space-y-2">
                  <Badge className="w-12 h-12 rounded-full text-lg font-bold">
                    P
                  </Badge>
                  <p className="font-semibold">Practice</p>
                </div>
                <div className="text-center space-y-2">
                  <Badge className="w-12 h-12 rounded-full text-lg font-bold">
                    R
                  </Badge>
                  <p className="font-semibold">Review</p>
                </div>
                <div className="text-center space-y-2">
                  <Badge className="w-12 h-12 rounded-full text-lg font-bold">
                    E
                  </Badge>
                  <p className="font-semibold">Evaluate</p>
                </div>
                <div className="text-center space-y-2">
                  <Badge className="w-12 h-12 rounded-full text-lg font-bold">
                    P
                  </Badge>
                  <p className="font-semibold">Plan</p>
                </div>
                <div className="text-center space-y-2">
                  <Badge className="w-12 h-12 rounded-full text-lg font-bold">
                    N
                  </Badge>
                  <p className="font-semibold">Note</p>
                </div>
                <div className="text-center space-y-2">
                  <Badge className="w-12 h-12 rounded-full text-lg font-bold">
                    M
                  </Badge>
                  <p className="font-semibold">Memorize</p>
                </div>
                <div className="text-center space-y-2">
                  <Badge className="w-12 h-12 rounded-full text-lg font-bold">
                    C
                  </Badge>
                  <p className="font-semibold">Conquer</p>
                </div>
                {/* <div className="text-center space-y-2">
                  <Badge className="w-12 h-12 rounded-full text-lg font-bold">
                    N
                  </Badge>
                  <p className="font-semibold">Next</p>
                </div> */}
              </div>
            </div>
          </div>

          {/* Pathways */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-primary flex items-center gap-3">
                <Badge className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                  1
                </Badge>
                EXAM PATHWAYS
              </h3>
              <p className="text-muted-foreground text-lg">
                Structured learning paths for different exam categories using
                our O'Prep methodology
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl">RN Pathway</CardTitle>
                  <CardDescription>
                    Registered Nurse Certification Track
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Weekly & Monthly Assessments
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Mock Exams (Paper 1 & 2)
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      O'Prep Study System
                    </li>
                  </ul>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ₦1,500
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl">RM Pathway</CardTitle>
                  <CardDescription>
                    Registered Midwife Certification Track
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Specialized Midwifery Content
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Clinical Practice Questions
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Expert Guidance
                    </li>
                  </ul>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ₦2,000
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Other Professional Exams
                  </CardTitle>
                  <CardDescription>
                    Medical, Legal, Accounting & More
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      MDCN, ICAN, NBA & Others
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      University & College Exams
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Customized Study Plans
                    </li>
                  </ul>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ₦1,800
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <CardTitle className="text-xl">All-Access Package</CardTitle>
                  <CardDescription>
                    Complete O'Prep System Access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      All Exam Categories
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Premium Features
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Priority Support
                    </li>
                  </ul>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ₦2,500
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /month
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Research Services */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-accent-foreground flex items-center gap-3">
                <Badge className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-accent">
                  2
                </Badge>
                O'Prep RESEARCH
              </h3>
              <p className="text-muted-foreground text-lg">
                Professional research assistance and academic writing support
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/20">
                <CardHeader>
                  <CardTitle className="text-xl">Project Writing</CardTitle>
                  <CardDescription>
                    Complete research project assistance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Literature Review
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Data Analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Professional Formatting
                    </li>
                  </ul>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-accent-foreground">
                      ₦15,000+
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /project
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/20">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Research Consultation
                  </CardTitle>
                  <CardDescription>
                    Expert guidance and mentorship
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Topic Selection
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Methodology Design
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      One-on-One Sessions
                    </li>
                  </ul>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-accent-foreground">
                      ₦5,000
                    </span>
                    <span className="text-sm text-muted-foreground">/hour</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* O'Level & JAMB */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-secondary-foreground flex items-center gap-3">
                <Badge className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-secondary">
                  3
                </Badge>
                O'LEVEL & JAMB
              </h3>
              <p className="text-muted-foreground text-lg">
                Foundation courses for aspiring healthcare professionals
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary/20">
                <CardHeader>
                  <CardTitle className="text-xl">O'Level Preparation</CardTitle>
                  <CardDescription>WAEC/NECO focused learning</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Science Subjects Focus
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Past Questions Bank
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Progress Tracking
                    </li>
                  </ul>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-secondary-foreground">
                      ₦3,000
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary/20">
                <CardHeader>
                  <CardTitle className="text-xl">JAMB Preparation</CardTitle>
                  <CardDescription>UTME for Health Sciences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      CBT Practice Tests
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      University Cut-off Guide
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="w-2 h-2 rounded-full p-0"
                      ></Badge>
                      Mock JAMB Exams
                    </li>
                  </ul>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-secondary-foreground">
                      ₦2,500
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /month
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center space-y-6 py-16">
            <h2 className="text-3xl font-bold text-foreground">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of successful students who used our proven O'Prep
              methodology for exam success
            </p>
            <Button
              asChild
              size="lg"
              className="h-12 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Link href="/auth/signin">Sign Up Now - It's Free!</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-muted text-muted-foreground py-12 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <h3 className="text-2xl font-bold">O'Prep</h3>
          <p className="text-muted-foreground">
            Empowering Students Through Our Proven Study Methodology
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="mailto:hello@oprep.com"
              className="hover:text-primary transition-colors"
            >
              Contact Us
            </Link>
          </div>
          <Separator className="my-8" />
          <p className="text-sm text-muted-foreground">
            © 2025 O'Prep - All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
