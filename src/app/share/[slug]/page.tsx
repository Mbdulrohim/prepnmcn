"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  BookOpen,
  AlertCircle,
  PlayCircle,
  Lock,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import ExamPlayer from "@/components/ExamPlayer";

interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: number;
  totalQuestions: number;
  isShareable: boolean;
  shareSlug: string;
}

interface ExamAttempt {
  id: string;
  status: string;
  isCompleted: boolean;
}

export default function ShareableExamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [inExam, setInExam] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=/share/${slug}`);
    } else if (status === "authenticated") {
      loadExam();
    }
  }, [status, slug]);

  const loadExam = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/exams/share/${slug}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Exam not found");
      }

      setExam(data.data.exam);
      setAttempt(data.data.attempt);
    } catch (error: any) {
      console.error("Error loading exam:", error);
      setError(error.message || "Failed to load exam");
      toast.error(error.message || "Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  const startExam = async () => {
    try {
      setIsStarting(true);

      const res = await fetch(`/api/exams/share/${slug}/start`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to start exam");
      }

      setAttempt(data.data);
      setInExam(true);
      toast.success("Exam started!");
    } catch (error: any) {
      console.error("Error starting exam:", error);
      toast.error(error.message || "Failed to start exam");
    } finally {
      setIsStarting(false);
    }
  };

  const handleExamComplete = async (result: any) => {
    setInExam(false);

    // Update attempt with the completed result
    if (result?.id) {
      setAttempt({
        id: result.id,
        status: "completed",
        isCompleted: true,
      });
    }

    // Navigate to results
    router.push(
      `/exam/${exam?.id}/results?attemptId=${result?.id || attempt?.id}`
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-700">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <Lock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <CardTitle className="text-center">Login Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You need to be logged in to access this exam.
            </p>
            <Button
              onClick={() =>
                router.push(`/auth/signin?callbackUrl=/share/${slug}`)
              }
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-center">Exam Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              {error || "This exam link is invalid or has been removed."}
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If in exam mode
  if (inExam && attempt && !attempt.isCompleted) {
    return (
      <ExamPlayer
        examId={exam.id}
        attemptId={attempt.id}
        onSubmitDone={handleExamComplete}
      />
    );
  }

  // Exam overview page
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                Shared Exam
              </Badge>
              {attempt?.isCompleted && (
                <Badge className="bg-green-100 text-green-700 border-green-300">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl mb-2">{exam.title}</CardTitle>
            {exam.subject && (
              <p className="text-gray-600">Subject: {exam.subject}</p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {exam.description && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{exam.description}</p>
              </div>
            )}

            {/* Exam Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-medium text-gray-900">
                    {exam.duration} minutes
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <BookOpen className="h-5 w-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-600">Questions</div>
                  <div className="font-medium text-gray-900">
                    {exam.totalQuestions} questions
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <h4 className="font-medium text-blue-900 mb-2">
                Before You Start:
              </h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Make sure you have a stable internet connection</li>
                <li>• You have {exam.duration} minutes to complete the exam</li>
                <li>• Your progress will be auto-saved every 30 seconds</li>
                <li>• Once submitted, you cannot change your answers</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              {attempt?.isCompleted ? (
                <>
                  <Button
                    onClick={() => {
                      if (attempt?.id) {
                        router.push(
                          `/exam/${exam.id}/results?attemptId=${attempt.id}`
                        );
                      } else {
                        toast.error(
                          "Unable to load results. Please try again."
                        );
                        loadExam();
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    View Results
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="outline"
                    size="lg"
                  >
                    Back to Dashboard
                  </Button>
                </>
              ) : attempt && !attempt.isCompleted ? (
                <>
                  <Button
                    onClick={() => setInExam(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    Continue Exam
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="outline"
                    size="lg"
                  >
                    Back to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={startExam}
                    disabled={isStarting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <PlayCircle className="h-5 w-5 mr-2" />
                    {isStarting ? "Starting..." : "Start Exam"}
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="outline"
                    size="lg"
                  >
                    Back to Dashboard
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
