"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Home,
  Award,
  TrendingUp,
} from "lucide-react";

interface ExamResults {
  id: string;
  examId: string;
  examTitle: string;
  score: number;
  percentage: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  totalQuestions: number;
  timeSpent: number;
  autoSubmitted?: boolean;
  endTime?: Date;
  createdAt?: Date;
}

export default function ExamResultsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const examId = params.id as string;
  const attemptId = searchParams.get("attemptId");
  const isAutoSubmit = searchParams.get("autoSubmit") === "true";

  const [results, setResults] = useState<ExamResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResults();
  }, [attemptId]);

  const loadResults = async () => {
    try {
      setLoading(true);

      if (!attemptId) {
        setError("No attempt ID provided");
        return;
      }

      const response = await fetch(`/api/exams/attempts/${attemptId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load results");
      }

      const attempt = data.data;

      // Fetch questions to calculate correct answers count
      const questionsResponse = await fetch(`/api/exams/${examId}/questions`);
      const questionsData = await questionsResponse.json();

      let correctCount = 0;
      let totalQuestions = 0;

      if (questionsData.success && Array.isArray(questionsData.data)) {
        const questions = questionsData.data;
        totalQuestions = questions.length;

        // Count correct answers by comparing with actual questions
        questions.forEach((q: any) => {
          const submitted = attempt.answers?.[q.id];
          if (submitted !== undefined && submitted !== null) {
            const normalizedSubmitted = String(submitted).trim().toLowerCase();
            const normalizedCorrect = String(q.correctAnswer || "")
              .trim()
              .toLowerCase();

            if (normalizedCorrect === normalizedSubmitted) {
              correctCount++;
            } else if (Array.isArray(q.options)) {
              // Check if submitted is numeric index
              const maybeIndex = parseInt(submitted as any, 10);
              if (!isNaN(maybeIndex) && q.options[maybeIndex]) {
                if (
                  q.options[maybeIndex].trim().toLowerCase() ===
                  normalizedCorrect
                ) {
                  correctCount++;
                }
              }
            }
          }
        });
      } else {
        // Fallback to answers object if questions fetch fails
        totalQuestions = Object.keys(attempt.answers || {}).length;
        correctCount = attempt.score || 0;
      }

      const answeredCount = Object.values(attempt.answers || {}).filter(
        (answer) => answer !== undefined && answer !== null
      ).length;

      setResults({
        id: attempt.id,
        examId: attempt.examId,
        examTitle: "Exam Results",
        score: attempt.score || 0,
        percentage:
          totalQuestions > 0
            ? Math.round((correctCount / totalQuestions) * 100)
            : 0,
        correctAnswers: correctCount,
        wrongAnswers: answeredCount - correctCount,
        unanswered: totalQuestions - answeredCount,
        totalQuestions: totalQuestions,
        timeSpent: attempt.timeTaken || 0,
        autoSubmitted: isAutoSubmit,
        endTime: attempt.completedAt
          ? new Date(attempt.completedAt)
          : undefined,
        createdAt: attempt.startedAt ? new Date(attempt.startedAt) : undefined,
      });
    } catch (error) {
      console.error("Error loading results:", error);
      setError("Failed to load exam results");
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

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90)
      return {
        level: "Excellent",
        color: "text-green-600",
        bg: "bg-green-100",
      };
    if (percentage >= 80)
      return { level: "Very Good", color: "text-blue-600", bg: "bg-blue-100" };
    if (percentage >= 70)
      return { level: "Good", color: "text-yellow-600", bg: "bg-yellow-100" };
    if (percentage >= 60)
      return { level: "Fair", color: "text-orange-600", bg: "bg-orange-100" };
    return {
      level: "Needs Improvement",
      color: "text-red-600",
      bg: "bg-red-100",
    };
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleBackToExams = () => {
    router.push("/dashboard/exams");
  };

  const handleReviewAnswers = () => {
    router.push(`/exam/${examId}/review?attemptId=${attemptId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">
              Loading your results...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Error Loading Results
            </h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={handleBackToDashboard}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  const performance = getPerformanceLevel(results.percentage);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Submission Alert */}
        {isAutoSubmit && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <p className="text-yellow-800 dark:text-yellow-200">
                <span className="font-medium">Auto-submitted:</span> Your exam
                was automatically submitted when time expired.
              </p>
            </div>
          </div>
        )}

        {/* Main Results Card */}
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-8 py-6 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Exam Completed!</h1>
                <p className="text-blue-100">Exam Results</p>
              </div>
            </div>
          </div>

          {/* Score Section */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-muted rounded-full mb-4">
                  <span className="text-3xl font-bold text-foreground">
                    {results.percentage}%
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Your Final Score
                </h2>
                <div
                  className={`inline-flex items-center px-4 py-2 rounded-full ${
                    performance.bg
                  } dark:${performance.bg.replace("bg-", "bg-")}/20`}
                >
                  <Award
                    className={`h-4 w-4 mr-2 ${
                      performance.color
                    } dark:${performance.color.replace("text-", "text-")}`}
                  />
                  <span
                    className={`font-medium ${
                      performance.color
                    } dark:${performance.color.replace("text-", "text-")}`}
                  >
                    {performance.level}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <Progress value={results.percentage} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {results.score} out of {results.totalQuestions} questions
                  correct
                </p>
              </div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                  {results.correctAnswers}
                </div>
                <div className="text-sm text-green-600 dark:text-green-500 font-medium">
                  Correct Answers
                </div>
              </div>

              <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {results.wrongAnswers}
                </div>
                <div className="text-sm text-red-600 dark:text-red-500 font-medium">
                  Incorrect Answers
                </div>
              </div>

              <div className="text-center p-6 bg-muted border border-border rounded-lg">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {results.unanswered}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  Unanswered
                </div>
              </div>
            </div>

            {/* Time Spent */}
            <div className="text-center mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-400">
                <Clock className="h-5 w-5" />
                <span className="font-medium">
                  Time Spent: {formatTime(results.timeSpent)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Button onClick={handleReviewAnswers} className="flex-1">
                <BookOpen className="h-4 w-4 mr-2" />
                Review Answers
              </Button>

              <Button
                onClick={handleBackToDashboard}
                variant="outline"
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>

            {/* Additional Info */}
            <div className="mt-8 p-4 bg-muted border border-border rounded-lg">
              <div className="flex items-start space-x-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">What's Next?</p>
                  <ul className="space-y-1">
                    <li>
                      • Review your performance and identify areas for
                      improvement
                    </li>
                    <li>• Practice more exams to strengthen weak areas</li>
                    <li>• Track your progress over time</li>
                    <li>• Aim for consistent improvement in future attempts</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
