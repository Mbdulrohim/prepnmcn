"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  CheckCircle,
  Lock,
  ArrowLeft,
  Calendar,
  Award,
  Target,
} from "lucide-react";
import { toast } from "sonner";

interface Exam {
  id: string;
  title: string;
  subject: string;
  description?: string;
  type: string;
  level: string;
  duration: number;
  totalQuestions: number;
  status: "draft" | "published" | "archived";
  price?: number;
  currency?: string;
  passingScore?: number;
  createdAt: string;
  institutionId?: string;
  institution?: {
    id: string;
    name: string;
  };
}

interface Enrollment {
  id: string;
  examId: string;
  status: string;
  paymentStatus: string;
}

export default function ExamDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingEnrollment, setCreatingEnrollment] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated" && examId) {
      loadExamData();
      checkPaymentStatus();
    }
  }, [status, router, examId]);

  const checkPaymentStatus = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference") || urlParams.get("trxref");

    if (reference) {
      try {
        const response = await fetch("/api/payments/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        });

        const data = await response.json();

        if (data.success && data.data.status === "success") {
          toast.success("Payment successful! You are now enrolled in the exam.");
          fetchEnrollment(); // Refresh enrollment
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          toast.error("Payment verification failed. Please contact support if you were charged.");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Failed to verify payment status.");
      }
    }
  };

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/exams/${examId}`);
      const data = await response.json();

      if (data.success) {
        setExam(data.data);
      } else {
        console.error("Failed to fetch exam:", data.error);
        router.push("/exams");
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      router.push("/exams");
    }
  };

  const fetchEnrollment = async () => {
    try {
      const response = await fetch("/api/exams/enrollments");
      const data = await response.json();

      if (data.success) {
        const userEnrollment = data.data.find((e: Enrollment) => e.examId === examId);
        setEnrollment(userEnrollment || null);
      }
    } catch (error) {
      console.error("Error fetching enrollment:", error);
    }
  };

  const loadExamData = async () => {
    try {
      await Promise.all([fetchExam(), fetchEnrollment()]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!exam) return;

    try {
      setCreatingEnrollment(true);
      const response = await fetch("/api/exams/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examId: exam.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.data.payment) {
          // Redirect to payment URL for paid exams
          window.location.href = data.data.payment.url;
        } else {
          // Free exam enrolled successfully
          toast.success("Successfully enrolled in exam!");
          fetchEnrollment(); // Refresh enrollment
        }
      } else {
        toast.error(data.error || "Failed to enroll in exam");
      }
    } catch (error) {
      console.error("Error enrolling in exam:", error);
      toast.error("Failed to enroll in exam. Please try again.");
    } finally {
      setCreatingEnrollment(false);
    }
  };

  const formatExamType = (type: string) => {
    switch (type) {
      case "certification":
        return "Certification";
      case "licensing":
        return "Licensing";
      case "professional":
        return "Professional";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getStatusBadge = () => {
    if (!enrollment) return null;

    switch (enrollment.status) {
      case "enrolled":
        return <Badge variant="secondary">Enrolled</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Exam not found</h3>
          <p className="text-muted-foreground">The exam you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/exams">Back to Exams</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/exams" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Exams
            </Link>
          </Button>

          {/* Exam Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight">{exam.title}</h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline">{exam.subject}</Badge>
                  <Badge variant="outline">{formatExamType(exam.type)}</Badge>
                  <Badge variant="outline">{exam.level}</Badge>
                  {getStatusBadge()}
                </div>
              </div>
            </div>

            {exam.institution && (
              <p className="text-muted-foreground">
                Offered by {exam.institution.name}
              </p>
            )}
          </div>

          {/* Exam Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About this Exam</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {exam.description || "No detailed description available for this exam."}
                  </p>
                </CardContent>
              </Card>

              {/* Exam Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{exam.duration}</p>
                        <p className="text-xs text-muted-foreground">Minutes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{exam.totalQuestions}</p>
                        <p className="text-xs text-muted-foreground">Questions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{exam.passingScore || 70}%</p>
                        <p className="text-xs text-muted-foreground">Passing Score</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{exam.level}</p>
                        <p className="text-xs text-muted-foreground">Level</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {exam.price && exam.price > 0 ? (
                        <span className="text-green-600">
                          {exam.currency || "NGN"} {exam.price}
                        </span>
                      ) : (
                        <span className="text-green-600">Free</span>
                      )}
                    </div>
                    {exam.price && exam.price > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
                    )}
                  </div>

                  {enrollment ? (
                    <Button asChild className="w-full">
                      <Link href={`/exams/${exam.id}/take`}>
                        {enrollment.status === "completed" ? (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            View Results
                          </>
                        ) : (
                          <>
                            <BookOpen className="mr-2 h-4 w-4" />
                            Take Exam
                          </>
                        )}
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={creatingEnrollment}
                      className="w-full"
                    >
                      {exam.price && exam.price > 0 ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Pay & Enroll
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Enroll Free
                        </>
                      )}
                    </Button>
                  )}

                  {exam.price && exam.price > 0 && !enrollment && (
                    <p className="text-xs text-muted-foreground text-center">
                      Secure payment powered by Paystack
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span>{exam.duration} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Questions:</span>
                    <span>{exam.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Passing Score:</span>
                    <span>{exam.passingScore || 70}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{new Date(exam.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}