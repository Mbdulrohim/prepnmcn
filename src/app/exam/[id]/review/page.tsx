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
  answers: Record<string, number>;
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

  useEffect(() => {
    if (attemptId) {
      loadReviewData();
    }
  }, [attemptId]);

  const getAIExplanation = async (questionIndex: number) => {
    if (!currentQuestion || correctAnswerIndex === undefined) return;

    setLoadingAI(questionIndex);

    try {
      const userAnswer = reviewData?.answers[currentQuestion.id];

      const response = await fetch("/api/ai-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion.question,
          options: currentQuestion.options,
          correctAnswer: correctAnswerIndex,
          userAnswer,
          isCorrect: userAnswer === correctAnswerIndex,
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
  const userAnswer = currentQuestion
    ? reviewData?.answers[currentQuestion.id]
    : undefined;
  
  // Parse correctAnswer to number if it's a string
  const correctAnswerIndex = currentQuestion 
    ? typeof currentQuestion.correctAnswer === 'string' 
      ? parseInt(currentQuestion.correctAnswer, 10)
      : currentQuestion.correctAnswer
    : undefined;
  
  const isCorrect =
    userAnswer !== undefined &&
    correctAnswerIndex !== undefined &&
    userAnswer === correctAnswerIndex;
  const isAnswered = userAnswer !== undefined;

  // Debug logging
  if (currentQuestion) {
    console.log("Current Question:", {
      id: currentQuestion.id,
      userAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      correctAnswerIndex,
      isCorrect,
      isAnswered,
      allAnswers: reviewData?.answers,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-slate-700">Loading review data...</p>
        </div>
      </div>
    );
  }

  if (error || !reviewData || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Review
          </h1>
          <p className="text-gray-600 mb-6">
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

  const correctCount = reviewData.questions.filter((q) => {
    const correctIdx = typeof q.correctAnswer === 'string' 
      ? parseInt(q.correctAnswer, 10) 
      : q.correctAnswer;
    return reviewData.answers[q.id] === correctIdx;
  }).length;
  
  const incorrectCount = reviewData.questions.filter((q) => {
    const correctIdx = typeof q.correctAnswer === 'string' 
      ? parseInt(q.correctAnswer, 10) 
      : q.correctAnswer;
    return (
      reviewData.answers[q.id] !== undefined &&
      reviewData.answers[q.id] !== correctIdx
    );
  }).length;
  const unansweredCount =
    reviewData.totalQuestions - correctCount - incorrectCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
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

            <h1 className="text-xl font-semibold text-gray-900">
              Review Answers
            </h1>

            <Button onClick={() => router.push("/dashboard")} variant="ghost">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>

          {/* Progress */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Question {currentIndex + 1} of {reviewData.totalQuestions}
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {correctCount} Correct
              </span>
              <span className="text-red-600 flex items-center">
                <XCircle className="h-4 w-4 mr-1" />
                {incorrectCount} Wrong
              </span>
              <span className="text-gray-600 flex items-center">
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
                  <span className="text-sm font-medium text-gray-500">
                    Question {currentIndex + 1}
                  </span>
                  {isAnswered ? (
                    isCorrect ? (
                      <Badge className="bg-green-100 text-green-700 border-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Correct
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 border-red-300">
                        <XCircle className="h-3 w-3 mr-1" />
                        Incorrect
                      </Badge>
                    )
                  ) : (
                    <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                      Not Answered
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg text-gray-900">
                  {currentQuestion.question}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => {
                const isUserAnswer = userAnswer === index;
                const isCorrectAnswer = correctAnswerIndex !== undefined && index === correctAnswerIndex;

                let className = "w-full p-4 text-left rounded-lg border-2 ";
                if (isCorrectAnswer && isUserAnswer) {
                  // User got it right - green
                  className += "border-green-500 bg-green-50";
                } else if (isCorrectAnswer) {
                  // Correct answer (not selected) - green border
                  className += "border-green-500 bg-green-50";
                } else if (isUserAnswer && !isCorrect) {
                  // User's wrong answer - red
                  className += "border-red-500 bg-red-50";
                } else {
                  className += "border-gray-200 bg-white";
                }

                return (
                  <div key={index} className={className}>
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                          isCorrectAnswer
                            ? "border-green-500 bg-green-500 text-white"
                            : isUserAnswer
                            ? "border-red-500 bg-red-500 text-white"
                            : "border-gray-300 text-gray-600"
                        }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <div className="flex-1">
                        <span className="text-gray-900">{option}</span>
                        {isCorrectAnswer && (
                          <span className="ml-2 text-sm text-green-700 font-medium">
                            ✓ Correct Answer
                          </span>
                        )}
                        {isUserAnswer && !isCorrect && (
                          <span className="ml-2 text-sm text-red-700 font-medium">
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
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
                <p className="text-blue-800 text-sm">
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
                <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg shadow-sm">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-purple-900">
                      AI Explanation
                    </h4>
                  </div>
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {aiExplanations[currentIndex]}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>

              <span className="text-sm text-gray-600">
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
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">All Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {reviewData.questions.map((q, index) => {
                const answer = reviewData.answers[q.id];
                const correctIdx = typeof q.correctAnswer === 'string' 
                  ? parseInt(q.correctAnswer, 10) 
                  : q.correctAnswer;
                const isCorrect = answer === correctIdx;
                const isAnswered = answer !== undefined;

                return (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`w-10 h-10 text-sm font-medium rounded-lg border-2 transition-all ${
                      index === currentIndex
                        ? "border-blue-500 bg-blue-500 text-white"
                        : isCorrect
                        ? "border-green-500 bg-green-100 text-green-700"
                        : isAnswered
                        ? "border-red-500 bg-red-100 text-red-700"
                        : "border-gray-300 bg-gray-100 text-gray-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
