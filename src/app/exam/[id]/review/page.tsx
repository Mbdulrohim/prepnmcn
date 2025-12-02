"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Home,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Loader,
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string | number; // Can be string or number
  explanation?: string;
}

interface ReviewData {
  id: string;
  examId: string;
  questions: Question[];
  answers: Record<string, any>; // Changed to any to handle various answer formats
  score: number;
  totalQuestions: number;
}

export default function ExamReviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const examId = params.id as string;
  const attemptId = searchParams.get("attemptId");

  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [aiExplanations, setAiExplanations] = useState<Record<number, string>>(
    {}
  );
  const [loadingAI, setLoadingAI] = useState<number | null>(null);
  const [showNavigator, setShowNavigator] = useState(true);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      switch (key) {
        case "p":
        case "arrowleft":
          event.preventDefault();
          if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
          break;
        case "n":
        case "arrowright":
          event.preventDefault();
          if (reviewData && currentIndex < reviewData.questions.length - 1)
            setCurrentIndex((prev) => prev + 1);
          break;
        case " ":
          event.preventDefault();
          setShowNavigator((prev) => !prev);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [currentIndex, reviewData]);

  useEffect(() => {
    if (attemptId) {
      loadReviewData();
    }
  }, [attemptId]);

  // Helper to normalize any answer format to an index
  const getAnswerIndex = (answer: any, options: string[] = []): number => {
    if (answer === undefined || answer === null) return -1;

    // If it's already a number
    if (typeof answer === "number") return answer;

    const str = String(answer).trim().toLowerCase();

    // Check if it's a numeric string "0", "1"
    if (/^\d+$/.test(str)) {
      const idx = parseInt(str, 10);
      // Only return if it's a valid index range, or if we don't have options to check against
      if (options.length === 0 || (idx >= 0 && idx < options.length))
        return idx;
    }

    // Check if it's a letter "a", "b"...
    if (/^[a-d]$/.test(str)) {
      return ["a", "b", "c", "d"].indexOf(str);
    }

    // Check if it matches option text
    if (options.length > 0) {
      const optionIdx = options.findIndex(
        (opt) => opt.trim().toLowerCase() === str
      );
      if (optionIdx !== -1) return optionIdx;
    }

    return -1;
  };

  const getAIExplanation = async (questionIndex: number) => {
    if (!currentQuestion || correctAnswerIndex === -1) return;

    setLoadingAI(questionIndex);

    try {
      const userAnswerRaw = reviewData?.answers[currentQuestion.id];
      const userAnswerIdx = getAnswerIndex(
        userAnswerRaw,
        currentQuestion.options
      );

      const response = await fetch("/api/ai-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          options: currentQuestion.options,
          correctAnswer: correctAnswerIndex,
          userAnswer: userAnswerIdx,
          isCorrect: userAnswerIdx === correctAnswerIndex,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        let formattedExplanation = data.explanation;

        if (data.truncated) {
          formattedExplanation +=
            "\n\n---\n📝 Explanation was optimized for length (200 words max)";
        }

        setAiExplanations((prev) => ({
          ...prev,
          [questionIndex]: formattedExplanation,
        }));
      } else {
        throw new Error(data.error || "Failed to get AI explanation");
      }
    } catch (error) {
      console.error("Error getting AI explanation:", error);
      setAiExplanations((prev) => ({
        ...prev,
        [questionIndex]:
          "Sorry, I encountered an error while generating the explanation. Please try again.",
      }));
    } finally {
      setLoadingAI(null);
    }
  };

  const loadReviewData = async () => {
    try {
      setLoading(true);

      // Fetch attempt data
      const attemptRes = await fetch(`/api/exams/attempts/${attemptId}`);
      const attemptData = await attemptRes.json();

      if (!attemptRes.ok || !attemptData.success) {
        throw new Error("Failed to load attempt data");
      }

      // Fetch questions with correct answers
      const questionsRes = await fetch(
        `/api/exams/${examId}/questions?includeAnswers=true`
      );
      const questionsData = await questionsRes.json();

      if (!questionsRes.ok || !questionsData.success) {
        throw new Error("Failed to load questions");
      }

      setReviewData({
        id: attemptData.data.id,
        examId: examId,
        questions: questionsData.data,
        answers: attemptData.data.answers || {},
        score: attemptData.data.score || 0,
        totalQuestions: questionsData.data.length,
      });
    } catch (error) {
      console.error("Error loading review data:", error);
      setError("Failed to load review data");
      toast.error("Failed to load review data");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = reviewData?.questions[currentIndex];

  // Calculate indices for current question
  const userAnswerRaw = currentQuestion
    ? reviewData?.answers[currentQuestion.id]
    : undefined;

  const userAnswerIndex = currentQuestion
    ? getAnswerIndex(userAnswerRaw, currentQuestion.options)
    : -1;

  const correctAnswerIndex = currentQuestion
    ? getAnswerIndex(currentQuestion.correctAnswer, currentQuestion.options)
    : -1;

  const isCorrect =
    userAnswerIndex !== -1 &&
    correctAnswerIndex !== -1 &&
    userAnswerIndex === correctAnswerIndex;

  const isAnswered = userAnswerIndex !== -1;

  // Debug logging
  if (currentQuestion) {
    console.log("Current Question:", {
      id: currentQuestion.id,
      userAnswerRaw,
      userAnswerIndex,
      correctAnswerRaw: currentQuestion.correctAnswer,
      correctAnswerIndex,
      isCorrect,
      isAnswered,
    });
  }

  const goToNext = () => {
    if (reviewData && currentIndex < reviewData.questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">
            Loading review data...
          </p>
        </div>
      </div>
    );
  }

  if (error || !reviewData || !currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Error Loading Review
          </h1>
          <p className="text-muted-foreground mb-6">
            {error || "No review data available"}
          </p>
          <Button
            onClick={() =>
              router.push(`/exam/${examId}/results?attemptId=${attemptId}`)
            }
          >
            Back to Results
          </Button>
        </div>
      </div>
    );
  }

  // Calculate stats using the robust index comparison
  const correctCount = reviewData.questions.filter((q) => {
    const uIdx = getAnswerIndex(reviewData.answers[q.id], q.options);
    const cIdx = getAnswerIndex(q.correctAnswer, q.options);
    return uIdx !== -1 && cIdx !== -1 && uIdx === cIdx;
  }).length;

  const incorrectCount = reviewData.questions.filter((q) => {
    const uIdx = getAnswerIndex(reviewData.answers[q.id], q.options);
    const cIdx = getAnswerIndex(q.correctAnswer, q.options);
    return uIdx !== -1 && (cIdx === -1 || uIdx !== cIdx);
  }).length;

  const unansweredCount =
    reviewData.totalQuestions - correctCount - incorrectCount;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() =>
                router.push(`/exam/${examId}/results?attemptId=${attemptId}`)
              }
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>

            <h1 className="text-xl font-semibold text-foreground">
              Review Answers
            </h1>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => setShowNavigator(!showNavigator)}
                className="hidden sm:flex"
              >
                {showNavigator ? "Hide Navigator" : "Show Navigator"}
              </Button>
              <Button onClick={() => router.push("/dashboard")} variant="ghost">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentIndex + 1} of {reviewData.totalQuestions}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-green-600 dark:text-green-400 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {correctCount} Correct
              </span>
              <span className="text-red-600 dark:text-red-400 flex items-center">
                <XCircle className="h-4 w-4 mr-1" />
                {incorrectCount} Wrong
              </span>
              <span className="text-muted-foreground flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {unansweredCount} Unanswered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Question {currentIndex + 1}
                  </span>
                  {isAnswered ? (
                    isCorrect ? (
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Incorrect
                      </Badge>
                    )
                  ) : (
                    <Badge variant="secondary">Not Answered</Badge>
                  )}
                </div>
                <CardTitle className="text-lg text-foreground">
                  {currentQuestion.question}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isUserAnswer = userAnswerIndex === index;
                const isCorrectAnswer =
                  correctAnswerIndex !== -1 && index === correctAnswerIndex;

                let className =
                  "w-full p-4 text-left rounded-lg border-2 transition-colors ";
                let markerClass =
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ";
                let textClass = "flex-1 ";

                if (isCorrectAnswer && isUserAnswer) {
                  // User got it right - green
                  className +=
                    "border-green-500 bg-green-50 dark:bg-green-900/20";
                  markerClass += "border-green-500 bg-green-500 text-white";
                  textClass += "text-foreground";
                } else if (isCorrectAnswer) {
                  // Correct answer (not selected) - green border
                  className +=
                    "border-green-500 bg-green-50 dark:bg-green-900/20";
                  markerClass += "border-green-500 bg-green-500 text-white";
                  textClass += "text-foreground";
                } else if (isUserAnswer && !isCorrect) {
                  // User's wrong answer - red
                  className += "border-red-500 bg-red-50 dark:bg-red-900/20";
                  markerClass += "border-red-500 bg-red-500 text-white";
                  textClass += "text-foreground";
                } else {
                  // Normal option
                  className += "border-border bg-card hover:bg-muted/50";
                  markerClass +=
                    "border-muted-foreground/30 text-muted-foreground";
                  textClass += "text-foreground";
                }

                return (
                  <div key={index} className={className}>
                    <div className="flex items-start space-x-3">
                      <div className={markerClass}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className={textClass}>
                        <span className="text-base">{option}</span>
                        {isCorrectAnswer && (
                          <span className="ml-2 text-sm text-green-600 dark:text-green-400 font-medium">
                            ✓ Correct Answer
                          </span>
                        )}
                        {isUserAnswer && !isCorrect && (
                          <span className="ml-2 text-sm text-red-600 dark:text-red-400 font-medium">
                            ✗ Your Answer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            {currentQuestion.explanation && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Explanation:
                </h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {/* AI Explanation */}
            <div className="mb-6">
              {!aiExplanations[currentIndex] ? (
                <Button
                  onClick={() => getAIExplanation(currentIndex)}
                  disabled={loadingAI === currentIndex}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
                >
                  {loadingAI === currentIndex ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Generating AI Explanation...
                    </>
                  ) : (
                    <>
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Get AI Explanation
                    </>
                  )}
                </Button>
              ) : (
                <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                      AI Explanation
                    </h4>
                  </div>
                  <p className="text-foreground text-sm leading-relaxed">
                    {aiExplanations[currentIndex]}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {reviewData.totalQuestions}
              </span>

              <Button
                onClick={goToNext}
                disabled={currentIndex === reviewData.totalQuestions - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigator */}
        {showNavigator && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">All Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {reviewData.questions.map((q, index) => {
                  const uIdx = getAnswerIndex(
                    reviewData.answers[q.id],
                    q.options
                  );
                  const cIdx = getAnswerIndex(q.correctAnswer, q.options);
                  const isCorrect = uIdx !== -1 && cIdx !== -1 && uIdx === cIdx;
                  const isAnswered = uIdx !== -1;

                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg border-2 transition-all ${
                        index === currentIndex
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCorrect
                          ? "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                          : isAnswered
                          ? "border-red-500 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          : "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
