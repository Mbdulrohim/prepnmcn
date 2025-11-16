"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Calculator,
  Clock,
  BookOpen,
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: string;
  options?: string[];
  marks?: number;
}

export default function ExamPlayer({
  examId,
  attemptId,
  onSubmitDone,
}: {
  examId: string;
  attemptId: string;
  onSubmitDone?: (result: any) => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [current, setCurrent] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const autosaveRef = useRef<number | null>(null);

  useEffect(() => {
    // Fetch questions
    const load = async () => {
      try {
        const res = await fetch(`/api/exams/${examId}/questions`);
        const data = await res.json();
        if (data.success) {
          setQuestions(data.data);
        }
      } catch (e) {
        console.error("Failed to load questions", e);
        toast.error("Failed to load questions");
      }
    };

    load();

    // Fetch exam + attempt to calculate timer
    const loadExamAndAttempt = async () => {
      let durationSeconds = 0;
      try {
        const examResp = await fetch(`/api/exams/${examId}`);
        const eData = await examResp.json();
        if (examResp.ok && eData.success) {
          durationSeconds = (eData.data.duration || 0) * 60; // minutes to seconds
          setDurationSec(durationSeconds);
        }

        const attemptResp = await fetch(`/api/exams/attempts/${attemptId}`);
        if (attemptResp.ok) {
          const attemptData = await attemptResp.json();
          if (attemptData.success) {
            // If attempt startedAt, compute timeLeft
            const started = attemptData.data.startedAt
              ? new Date(attemptData.data.startedAt).getTime()
              : null;
            const timeTaken = attemptData.data.timeTaken || 0;
            if (durationSeconds && started) {
              const elapsed =
                Math.floor((Date.now() - started) / 1000) + timeTaken;
              setTimeLeft(Math.max(durationSeconds - elapsed, 0));
            } else if (durationSeconds) {
              setTimeLeft(durationSeconds);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load exam or attempt", e);
      }
    };

    loadExamAndAttempt();

    // Autosave every 15s
    autosaveRef.current = window.setInterval(() => {
      saveAnswers();
    }, 15000);

    // Timer tick every second if set
    const timerTick = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t === null) return t;
        if (t <= 1) {
          // Auto submit if time finishes
          saveAnswers().then(() => {
            submit(true);
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (autosaveRef.current) window.clearInterval(autosaveRef.current);
      window.clearInterval(timerTick);
    };
  }, [examId, attemptId]);

  const saveAnswers = async () => {
    try {
      setIsSaving(true);
      const timeTaken =
        durationSec && timeLeft !== null
          ? Math.max(durationSec - timeLeft, 0)
          : undefined;

      const resp = await fetch(`/api/exams/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTaken }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Failed to save");
      }
      toast.success("Progress saved");
    } catch (e) {
      console.error("Autosave failed", e);
      toast.error("Autosave failed. Check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const submit = async (auto?: boolean) => {
    if (!auto) {
      if (!confirm("Submit exam? You cannot change answers after submission."))
        return;
    }
    try {
      // Ensure any outstanding autosave is awaited
      await saveAnswers();
      setIsSubmitting(true);
      await saveAnswers();
      const resp = await fetch(`/api/exams/attempts/${attemptId}`, {
        method: "POST",
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Failed to submit exam");
      }
      toast.success("Exam submitted");
      onSubmitDone?.(data.data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[current];

  const setAnswer = (qid: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleCalcButton = (value: string) => {
    if (value === "C") {
      setCalcDisplay("0");
    } else if (value === "=") {
      try {
        setCalcDisplay(String(eval(calcDisplay)));
      } catch {
        setCalcDisplay("Error");
      }
    } else if (value === "←") {
      setCalcDisplay(calcDisplay.length > 1 ? calcDisplay.slice(0, -1) : "0");
    } else {
      setCalcDisplay(calcDisplay === "0" ? value : calcDisplay + value);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== ""
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <div className="text-sm font-semibold">
                  Question {current + 1} of {questions.length}
                </div>
                <div className="text-xs text-muted-foreground">
                  {answeredCount} answered
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {timeLeft !== null && (
                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    timeLeft < 300
                      ? "bg-red-50 text-red-600 dark:bg-red-900/20"
                      : "bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span className="font-mono font-semibold">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}

              <Badge variant={isSaving ? "secondary" : "outline"}>
                {isSaving ? "Saving..." : "Saved"}
              </Badge>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowNavigator(!showNavigator)}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCalculator(!showCalculator)}
              >
                <Calculator className="h-4 w-4" />
              </Button>

              <Button size="sm" variant="outline" onClick={saveAnswers}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => submit(false)}
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4 mr-1" />
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-2">
            {currentQuestion ? (
              <Card className="shadow-lg">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      Question {current + 1}
                    </CardTitle>
                    {currentQuestion.marks && (
                      <Badge variant="secondary">
                        {currentQuestion.marks} marks
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose dark:prose-invert max-w-none mb-6">
                    <p className="text-lg font-medium leading-relaxed">
                      {currentQuestion.question}
                    </p>
                  </div>

                  {currentQuestion.type === "multiple_choice" &&
                    currentQuestion.options?.map((opt, idx) => (
                      <label
                        key={idx}
                        className="flex items-start gap-3 p-4 mb-3 border-2 rounded-lg cursor-pointer transition-all hover:border-primary hover:bg-primary/5"
                        style={{
                          borderColor:
                            String(answers[currentQuestion.id]) === String(idx)
                              ? "var(--primary)"
                              : "",
                          backgroundColor:
                            String(answers[currentQuestion.id]) === String(idx)
                              ? "var(--primary-foreground)"
                              : "",
                        }}
                      >
                        <input
                          type="radio"
                          name={currentQuestion.id}
                          checked={
                            String(answers[currentQuestion.id]) === String(idx)
                          }
                          onChange={() =>
                            setAnswer(currentQuestion.id, String(idx))
                          }
                          className="mt-1 h-4 w-4 text-primary"
                        />
                        <span className="flex-1 text-base">{opt}</span>
                      </label>
                    ))}

                  {currentQuestion.type === "essay" && (
                    <textarea
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) =>
                        setAnswer(currentQuestion.id, e.target.value)
                      }
                      className="w-full p-4 border-2 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                      rows={12}
                      placeholder="Type your answer here..."
                    />
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center mt-6 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setCurrent(Math.max(current - 1, 0))}
                      disabled={current === 0}
                      className="min-w-[120px]"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <div className="text-sm text-muted-foreground">
                      {current + 1} / {questions.length}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrent(Math.min(current + 1, questions.length - 1))
                      }
                      disabled={current >= questions.length - 1}
                      className="min-w-[120px]"
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No questions available
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Question Navigator */}
            {showNavigator && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Grid3x3 className="h-4 w-4" />
                    Question Navigator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, idx) => (
                      <button
                        key={q.id}
                        onClick={() => setCurrent(idx)}
                        className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                          idx === current
                            ? "bg-primary text-primary-foreground"
                            : answers[q.id] !== undefined &&
                              answers[q.id] !== ""
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Calculator */}
            {showCalculator && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-slate-900 text-white p-4 rounded-lg text-right font-mono text-2xl min-h-[60px] flex items-center justify-end">
                      {calcDisplay}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {["C", "←", "/", "*"].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => handleCalcButton(btn)}
                          className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 p-3 rounded font-semibold transition-colors"
                        >
                          {btn}
                        </button>
                      ))}
                      {["7", "8", "9", "-"].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => handleCalcButton(btn)}
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-3 rounded font-semibold transition-colors"
                        >
                          {btn}
                        </button>
                      ))}
                      {["4", "5", "6", "+"].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => handleCalcButton(btn)}
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-3 rounded font-semibold transition-colors"
                        >
                          {btn}
                        </button>
                      ))}
                      {["1", "2", "3"].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => handleCalcButton(btn)}
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-3 rounded font-semibold transition-colors"
                        >
                          {btn}
                        </button>
                      ))}
                      <button
                        onClick={() => handleCalcButton("=")}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 p-3 rounded font-semibold transition-colors row-span-2"
                      >
                        =
                      </button>
                      {["0", "."].map((btn) => (
                        <button
                          key={btn}
                          onClick={() => handleCalcButton(btn)}
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-3 rounded font-semibold transition-colors"
                        >
                          {btn}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Summary */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Answered</span>
                    <span className="font-semibold">
                      {answeredCount} / {questions.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(answeredCount / questions.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Remaining</span>
                    <span className="font-semibold">
                      {questions.length - answeredCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
