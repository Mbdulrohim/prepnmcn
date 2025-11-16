"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  ArrowLeft,
  Calendar,
  Trophy,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ExamAttempt {
  id: string;
  examId: string;
  userId: string;
  status: "in_progress" | "completed" | "abandoned";
  score?: number;
  percentage?: number;
  answers: Record<string, any>;
  timeTaken?: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  duration: number;
  totalQuestions: number;
}

export default function ExamAttemptsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      loadExamAndAttempts();
    }
  }, [session, examId]);

  const loadExamAndAttempts = async () => {
    try {
      setLoading(true);

      // Load exam details
      const examRes = await fetch(`/api/exams/${examId}`);
      const examData = await examRes.json();
      if (examData.success) {
        setExam(examData.data);
      }

      // Load user's attempts
      const attemptsRes = await fetch(`/api/exams/${examId}/attempts`);
      const attemptsData = await attemptsRes.json();
      if (attemptsData.success) {
        setAttempts(attemptsData.data || []);
      }
    } catch (error) {
      console.error("Error loading attempts:", error);
      toast.error("Failed to load exam attempts");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (attempt: ExamAttempt) => {
    if (attempt.status === "completed") {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      );
    } else if (attempt.status === "in_progress") {
      return (
        <Badge className="bg-blue-100 text-blue-700 border-blue-300">
          <PlayCircle className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-700 border-gray-300">
          <XCircle className="h-3 w-3 mr-1" />
          Abandoned
        </Badge>
      );
    }
  };

  const handleViewResults = (attemptId: string) => {
    router.push(`/exam/${examId}/results?attemptId=${attemptId}`);
  };

  const handleContinueAttempt = (attemptId: string) => {
    router.push(`/exam/${examId}/attempt/${attemptId}`);
  };

  const handleStartNewAttempt = () => {
    router.push(`/exam/${examId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-700">Loading attempts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.push(`/exam/${examId}`)}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exam
          </Button>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {exam?.title || "Exam"}
                </h1>
                <p className="text-gray-600">Your Attempt History</p>
              </div>
              <Button
                onClick={handleStartNewAttempt}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start New Attempt
              </Button>
            </div>
          </div>
        </div>

        {/* Attempts List */}
        {attempts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Attempts Yet
              </h3>
              <p className="text-gray-600 mb-6 text-center max-w-md">
                You haven't started this exam yet. Click the button above to
                begin your first attempt.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {attempts.map((attempt, index) => (
              <Card key={attempt.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Attempt #{attempts.length - index}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(attempt.startedAt)}</span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(attempt)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {attempt.status === "completed" && (
                      <>
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-5 w-5 text-yellow-600" />
                          <div>
                            <div className="text-sm text-gray-600">Score</div>
                            <div className="font-semibold text-gray-900">
                              {attempt.percentage !== undefined
                                ? `${attempt.percentage}%`
                                : `${attempt.score || 0} / ${
                                    exam?.totalQuestions || 0
                                  }`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Time Spent
                            </div>
                            <div className="font-semibold text-gray-900">
                              {attempt.timeTaken
                                ? formatTime(attempt.timeTaken)
                                : "N/A"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Completed
                            </div>
                            <div className="font-semibold text-gray-900">
                              {attempt.completedAt
                                ? formatDate(attempt.completedAt)
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {attempt.status === "in_progress" && (
                      <div className="flex items-center space-x-2">
                        <PlayCircle className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="text-sm text-gray-600">Status</div>
                          <div className="font-semibold text-gray-900">
                            In Progress - Resume to continue
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {attempt.status === "completed" && (
                      <Button
                        onClick={() => handleViewResults(attempt.id)}
                        variant="outline"
                      >
                        View Results
                      </Button>
                    )}

                    {attempt.status === "in_progress" && (
                      <Button
                        onClick={() => handleContinueAttempt(attempt.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Continue Attempt
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
