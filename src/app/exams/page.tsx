"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Users,
  Search,
  Filter,
  Star,
  CheckCircle,
  Lock,
} from "lucide-react";
import ExamTable from "@/components/ExamTable";
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

export default function ExamsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingEnrollment, setCreatingEnrollment] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchExams();
      fetchEnrollments();
      checkPaymentStatus();
    }
  }, [status, router]);

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
          fetchEnrollments(); // Refresh enrollments
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

  const fetchExams = async () => {
    try {
      const response = await fetch("/api/exams");
      const data = await response.json();

      if (data.success) {
        // Only show published exams
        setExams(data.data.filter((exam: Exam) => exam.status === "published"));
      } else {
        console.error("Failed to fetch exams:", data.error);
        setExams([]);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      setExams([]);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await fetch("/api/exams/enrollments");
      const data = await response.json();

      if (data.success) {
        setEnrollments(data.data);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (exam: Exam) => {
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
          fetchEnrollments(); // Refresh enrollments
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

  const isEnrolled = (examId: string) => {
    return enrollments.some((enrollment) => enrollment.examId === examId);
  };

  const getEnrollmentStatus = (examId: string) => {
    const enrollment = enrollments.find((e) => e.examId === examId);
    return enrollment?.status || null;
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject =
      subjectFilter === "all" || exam.subject === subjectFilter;
    const matchesType = typeFilter === "all" || exam.type === typeFilter;
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "free" && (!exam.price || exam.price === 0)) ||
      (priceFilter === "paid" && exam.price && exam.price > 0);

    return matchesSearch && matchesSubject && matchesType && matchesPrice;
  });

  const getStatusBadge = (examId: string) => {
    const status = getEnrollmentStatus(examId);
    if (!status) return null;

    switch (status) {
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

  const uniqueSubjects = [...new Set(exams.map((exam) => exam.subject))].filter(
    Boolean
  );
  const uniqueTypes = [...new Set(exams.map((exam) => exam.type))].filter(
    Boolean
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Available Exams
              </h1>
              <p className="text-muted-foreground mt-1">
                Browse and enroll in exams to test your knowledge and earn
                certifications.
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Search & Filter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {uniqueSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {formatExamType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceFilter} onValueChange={setPriceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSubjectFilter("all");
                    setTypeFilter("all");
                    setPriceFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Exam Table (reusable) */}
          <Card>
            <CardHeader>
              <CardTitle>All Exams</CardTitle>
              <CardDescription>
                Click an exam to view details or enroll.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExamTable
                exams={filteredExams as any}
                enrollments={enrollments as any}
                onEnroll={handleEnroll}
              />
            </CardContent>
          </Card>

          {filteredExams.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No exams found</h3>
              <p className="text-muted-foreground">
                {searchTerm ||
                subjectFilter !== "all" ||
                typeFilter !== "all" ||
                priceFilter !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "No exams are currently available. Check back later!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
