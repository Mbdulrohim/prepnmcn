"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Target,
  Award,
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
      fetchExam();
      fetchEnrollment();
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
          toast.success(
            "Payment successful! You are now enrolled in the exam."
          );
          fetchEnrollment(); // Refresh enrollment
          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } else {
          toast.error(
            "Payment verification failed. Please contact support if you were charged."
          );
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
        toast.error("Exam not found");
        router.push("/exams");
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      toast.error("Failed to load exam");
      router.push("/exams");
    }
  };

  const fetchEnrollment = async () => {
    try {
      const response = await fetch("/api/exams/enrollments");
      const data = await response.json();

      if (data.success) {
        const userEnrollment = data.data.find(
          (e: Enrollment) => e.examId === examId
        );
        setEnrollment(userEnrollment || null);
      }
    } catch (error) {
      console.error("Error fetching enrollment:", error);
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
          <p className="text-muted-foreground">Exam not found</p>
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
            <Link href="/exams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exams
            </Link>
          </Button>

          {/* Exam Header */}
          <div className="text-center space-y-4">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{exam.title}</h1>
              <p className="text-lg text-muted-foreground mt-2">
                {exam.subject} • {formatExamType(exam.type)}
              </p>
              {getStatusBadge()}
            </div>
          </div>

          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Clock className="mx-auto h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Duration</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {exam.duration} minutes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <BookOpen className="mx-auto h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {exam.totalQuestions} questions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Target className="mx-auto h-8 w-8 text-primary mb-2" />
                <CardTitle className="text-lg">Passing Score</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {exam.passingScore || 70}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Exam</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {exam.description || "No description available for this exam."}
              </p>
            </CardContent>
          </Card>

          {/* Institution Info */}
          {exam.institution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Offered by
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">{exam.institution.name}</p>
              </CardContent>
            </Card>
          )}

          {/* Enrollment Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ready to Take This Exam?</CardTitle>
              <CardDescription>
                {exam.price && exam.price > 0
                  ? `Enroll now to access this exam for ${
                      exam.currency || "NGN"
                    } ${exam.price}`
                  : "This exam is free to take"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="text-2xl font-bold">
                  {exam.price && exam.price > 0 ? (
                    <span className="text-green-600">
                      {exam.currency || "NGN"} {exam.price}
                    </span>
                  ) : (
                    <span className="text-green-600">Free</span>
                  )}
                </div>

                <div className="flex gap-2">
                  {enrollment ? (
                    <Button asChild size="lg">
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
                      size="lg"
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
