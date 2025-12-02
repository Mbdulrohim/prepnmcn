"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Calculator as CalculatorIcon,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: string;
  options?: string[];
  marks?: number;
  text?: string;
  correctAnswer?: number;
  flagged?: boolean;
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
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [current, setCurrent] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNavigator, setShowNavigator] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcPrevious, setCalcPrevious] = useState<number | null>(null);
  const [calcOperation, setCalcOperation] = useState<string | null>(null);
  const [calcWaiting, setCalcWaiting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "saved" | "saving" | "error"
  >("saved");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const autosaveRef = useRef<number | null>(null);

  const currentQuestion = questions[current];
  const totalQuestions = questions.length;
  const progress = totalQuestions ? ((current + 1) / totalQuestions) * 100 : 0;
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] !== undefined && answers[k] !== ""
  ).length;
  const unansweredCount = totalQuestions - answeredCount;
  const flaggedCount = flaggedQuestions.size;

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    // Load from localStorage first
    const savedState = localStorage.getItem(`exam_${examId}_${attemptId}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setAnswers(parsed.answers || {});
        setFlaggedQuestions(new Set(parsed.flaggedQuestions || []));
        setCurrent(parsed.current || 0);
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }

    // Fetch questions
    const load = async () => {
      setIsLoadingQuestions(true);
      try {
        const res = await fetch(`/api/exams/${examId}/questions`);
        const data = await res.json();
        if (data.success) {
          setQuestions(data.data.map((q: any) => ({ ...q, flagged: false })));
        }
      } catch (e) {
        console.error("Failed to load questions", e);
        toast.error("Failed to load questions");
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    load();

    // Fetch exam + attempt to calculate timer
    const loadExamAndAttempt = async () => {
      try {
        const examResp = await fetch(`/api/exams/${examId}`);
        const eData = await examResp.json();
        if (examResp.ok && eData.success) {
          const dur = (eData.data.duration || 0) * 60;
          setDurationSec(dur);
        }

        const attemptResp = await fetch(`/api/exams/attempts/${attemptId}`);
        if (attemptResp.ok) {
          const attemptData = await attemptResp.json();
          if (attemptData.success) {
            const started = attemptData.data.startedAt
              ? new Date(attemptData.data.startedAt).getTime()
              : null;
            const timeTaken = attemptData.data.timeTaken || 0;
            const dur = (eData.data.duration || 0) * 60;
            if (dur && started) {
              const elapsed =
                Math.floor((Date.now() - started) / 1000) + timeTaken;
              setTimeLeft(Math.max(dur - elapsed, 0));
            } else if (dur) {
              setTimeLeft(dur);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load exam or attempt", e);
      }
    };

    loadExamAndAttempt();

    // Autosave every 30s
    autosaveRef.current = window.setInterval(() => {
      if (Object.keys(answers).length > 0) {
        saveAnswers();
      }
    }, 30000);

    // Timer tick
    const timerTick = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t === null) return t;
        if (t <= 1) {
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

  // Keyboard shortcuts
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
        case "a":
          event.preventDefault();
          handleAnswerSelect(0);
          break;
        case "b":
          event.preventDefault();
          handleAnswerSelect(1);
          break;
        case "c":
          event.preventDefault();
          handleAnswerSelect(2);
          break;
        case "d":
          event.preventDefault();
          handleAnswerSelect(3);
          break;
        case "p":
          event.preventDefault();
          if (current > 0) goToQuestion(current - 1);
          break;
        case "n":
          event.preventDefault();
          if (current < totalQuestions - 1) goToQuestion(current + 1);
          break;
        case "f":
          event.preventDefault();
          toggleFlag();
          break;
        case "enter":
          event.preventDefault();
          if (current < totalQuestions - 1) goToQuestion(current + 1);
          break;
        case "h":
        case "?":
          event.preventDefault();
          setShowKeyboardHelp(!showKeyboardHelp);
          break;
        case " ":
          event.preventDefault();
          setShowNavigator(!showNavigator);
          break;
        case "arrowleft":
          event.preventDefault();
          if (current > 0) goToQuestion(current - 1);
          break;
        case "arrowright":
          event.preventDefault();
          if (current < totalQuestions - 1) goToQuestion(current + 1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [current, totalQuestions, showNavigator, showKeyboardHelp]);

  const saveAnswers = async () => {
    try {
      setAutoSaveStatus("saving");
      const timeTaken =
        durationSec && timeLeft !== null
          ? Math.max(durationSec - timeLeft, 0)
          : undefined;

      // Save to localStorage
      const stateToSave = {
        answers,
        flaggedQuestions: Array.from(flaggedQuestions),
        current,
        timeTaken,
        lastSaved: new Date().toISOString(),
      };
      localStorage.setItem(
        `exam_${examId}_${attemptId}`,
        JSON.stringify(stateToSave)
      );

      const resp = await fetch(`/api/exams/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTaken }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Failed to save");
      }
      setAutoSaveStatus("saved");
    } catch (e) {
      console.error("Autosave failed", e);
      setAutoSaveStatus("error");
      toast.error("Autosave failed. Check your connection.");
    }
  };

  const submit = async (auto?: boolean) => {
    if (!auto) {
      setShowSubmitModal(true);
      return;
    }
    await confirmSubmit(auto);
  };

  const confirmSubmit = async (auto?: boolean) => {
    try {
      await saveAnswers();
      setIsSubmitting(true);
      const resp = await fetch(`/api/exams/attempts/${attemptId}`, {
        method: "POST",
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || "Failed to submit exam");
      }

      // Clear localStorage after successful submission
      localStorage.removeItem(`exam_${examId}_${attemptId}`);

      toast.success("Exam submitted");
      setShowSubmitModal(false);

      if (onSubmitDone) {
        onSubmitDone(data.data);
      } else {
        // Redirect to results page
        router.push(
          `/exam/${examId}/results?attemptId=${attemptId}${
            auto ? "&autoSubmit=true" : ""
          }`
        );
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to submit exam");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = { ...answers };
    newAnswers[currentQuestion.id] = optionIndex;
    setAnswers(newAnswers);
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrent(index);
    }
  };

  const toggleFlag = () => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(current)) {
      newFlagged.delete(current);
    } else {
      newFlagged.add(current);
    }
    setFlaggedQuestions(newFlagged);
  };

  // Calculator functions
  const inputCalcNumber = (num: string) => {
    if (calcDisplay === "Error") {
      setCalcDisplay(num);
      setCalcPrevious(null);
      setCalcOperation(null);
      setCalcWaiting(false);
      return;
    }

    if (calcWaiting) {
      setCalcDisplay(num);
      setCalcWaiting(false);
    } else {
      setCalcDisplay(calcDisplay === "0" ? num : calcDisplay + num);
    }
  };

  const inputCalcDecimal = () => {
    if (calcWaiting) {
      setCalcDisplay("0.");
      setCalcWaiting(false);
    } else if (calcDisplay.indexOf(".") === -1) {
      setCalcDisplay(calcDisplay + ".");
    }
  };

  const clearCalc = () => {
    setCalcDisplay("0");
    setCalcPrevious(null);
    setCalcOperation(null);
    setCalcWaiting(false);
  };

  const backspaceCalc = () => {
    if (calcDisplay === "Error") {
      clearCalc();
      return;
    }
    if (calcDisplay.length > 1) {
      setCalcDisplay(calcDisplay.slice(0, -1));
    } else {
      setCalcDisplay("0");
    }
  };

  const performCalcOperation = (nextOperation: string) => {
    const inputValue = parseFloat(calcDisplay);

    if (isNaN(inputValue)) {
      setCalcDisplay("Error");
      setCalcPrevious(null);
      setCalcOperation(null);
      setCalcWaiting(true);
      return;
    }

    if (calcPrevious === null) {
      setCalcPrevious(inputValue);
    } else if (calcOperation) {
      const currentValue = calcPrevious || 0;
      let result: number;

      switch (calcOperation) {
        case "+":
          result = currentValue + inputValue;
          break;
        case "-":
          result = currentValue - inputValue;
          break;
        case "*":
          result = currentValue * inputValue;
          break;
        case "/":
          if (inputValue === 0) {
            setCalcDisplay("Error");
            setCalcPrevious(null);
            setCalcOperation(null);
            setCalcWaiting(true);
            return;
          }
          result = currentValue / inputValue;
          break;
        default:
          return;
      }

      if (!isFinite(result)) {
        setCalcDisplay("Error");
        setCalcPrevious(null);
        setCalcOperation(null);
        setCalcWaiting(true);
        return;
      }

      const roundedResult = Math.round(result * 1000000000) / 1000000000;
      setCalcDisplay(String(roundedResult));
      setCalcPrevious(roundedResult);
    }

    setCalcWaiting(true);
    setCalcOperation(nextOperation === "=" ? null : nextOperation);
  };

  if (!currentQuestion) {
    if (isLoadingQuestions) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-foreground">
              Loading questions...
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Hang tight, we’re getting your exam ready.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            No questions available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col">
      {/* Header with Timer and Progress */}
      <div className="bg-white dark:bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">Exam</h1>
              <div className="flex items-center space-x-2">
                <Save
                  className={`h-4 w-4 ${
                    autoSaveStatus === "saved"
                      ? "text-green-500"
                      : autoSaveStatus === "saving"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  {autoSaveStatus === "saved"
                    ? "Saved"
                    : autoSaveStatus === "saving"
                    ? "Saving..."
                    : "Save Error"}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Clock
                  className={`h-5 w-5 ${
                    timeLeft && timeLeft < 600
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-lg font-mono font-bold ${
                    timeLeft && timeLeft < 300
                      ? "text-red-600 animate-pulse"
                      : timeLeft && timeLeft < 600
                      ? "text-orange-600"
                      : "text-foreground"
                  }`}
                >
                  {timeLeft !== null ? formatTime(timeLeft) : "00:00:00"}
                </span>
                {timeLeft && timeLeft < 600 && (
                  <span className="text-xs text-red-600 font-medium">
                    {timeLeft < 300 ? "⚠️ FINAL WARNING" : "⚠️ Low Time"}
                  </span>
                )}
              </div>

              <Button
                onClick={() => setShowCalculator(!showCalculator)}
                variant="outline"
                size="sm"
              >
                <CalculatorIcon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Calculator</span>
              </Button>

              <Button onClick={() => submit(false)} variant="outline">
                Submit Exam
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pb-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>
                Question {current + 1} of {totalQuestions}
              </span>
              <span>
                {answeredCount} answered • {flaggedCount} flagged
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Question Area */}
      <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Keyboard Shortcuts Help */}
        {showKeyboardHelp && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                Keyboard Shortcuts
              </h3>
              <Button
                onClick={() => setShowKeyboardHelp(false)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Answer Options
                </h4>
                <div className="space-y-1 text-blue-800 dark:text-blue-200">
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded text-xs">A</kbd>{" "}
                    Select option A
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded text-xs">B</kbd>{" "}
                    Select option B
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded text-xs">C</kbd>{" "}
                    Select option C
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded text-xs">D</kbd>{" "}
                    Select option D
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Navigation
                </h4>
                <div className="space-y-1 text-blue-800 dark:text-blue-200">
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded text-xs">P</kbd>{" "}
                    Previous question
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded text-xs">N</kbd>{" "}
                    Next question
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded text-xs">
                      ←/→
                    </kbd>{" "}
                    Navigate
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded text-xs">
                      Enter
                    </kbd>{" "}
                    Next question
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Other Actions
                </h4>
                <div className="space-y-1 text-blue-800 dark:text-blue-200">
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded text-xs">F</kbd>{" "}
                    Toggle flag
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded text-xs">
                      Space
                    </kbd>{" "}
                    Toggle navigator
                  </div>
                  <div>
                    <kbd className="px-2 py-1 bg-white rounded text-xs">
                      H/?
                    </kbd>{" "}
                    Toggle help
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-card rounded-lg shadow-sm border border-border p-6 lg:p-8 mb-6">
          {/* Question Header */}
          <div className="flex justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Question {current + 1} of {totalQuestions}
                </span>
                {flaggedQuestions.has(current) && (
                  <Flag className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
                variant="outline"
                size="sm"
                title="Keyboard shortcuts"
              >
                <span className="hidden sm:inline">Help</span>
                <span className="sm:hidden">?</span>
              </Button>
              <Button
                onClick={toggleFlag}
                variant="outline"
                size="sm"
                className={
                  flaggedQuestions.has(current)
                    ? "border-yellow-500 text-yellow-600"
                    : ""
                }
              >
                <Flag
                  className={`h-4 w-4 ${
                    flaggedQuestions.has(current) ? "fill-current mr-1" : "mr-1"
                  }`}
                />
                <span className="hidden sm:inline">
                  {flaggedQuestions.has(current) ? "Unflag" : "Flag"}
                </span>
              </Button>
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-8">
            <p className="text-lg text-foreground leading-relaxed">
              {currentQuestion.question || currentQuestion.text}
            </p>
          </div>

          {/* Answer Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion.options?.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === index;
              const optionLabel = String.fromCharCode(65 + index);

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-border hover:border-gray-300 dark:hover:border-gray-600 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                        isSelected
                          ? "border-blue-500 bg-blue-500 text-white"
                          : "border-gray-300 dark:border-gray-600 text-muted-foreground"
                      }`}
                    >
                      {optionLabel}
                    </div>
                    <span className="text-foreground leading-relaxed">
                      {option}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              onClick={() => goToQuestion(current - 1)}
              disabled={current === 0}
              variant="outline"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {current === totalQuestions - 1 ? (
              <Button
                onClick={() => submit(false)}
                className="bg-green-600 hover:bg-green-700 px-6"
              >
                Submit Exam
              </Button>
            ) : (
              <Button onClick={() => goToQuestion(current + 1)}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Question Navigator */}
      <div className="bg-white dark:bg-card border-t border-border sticky bottom-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 border-b border-border">
            <div className="flex items-center space-x-4">
              <h3 className="font-medium text-foreground">
                Question Navigator
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border-2 border-green-500 bg-green-100 dark:bg-green-900/30 rounded"></div>
                  <span className="text-muted-foreground">
                    Answered ({answeredCount})
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-card rounded"></div>
                  <span className="text-muted-foreground">
                    Not Answered ({unansweredCount})
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 border-2 border-yellow-400 bg-yellow-100 rounded ring-1 ring-yellow-400"></div>
                  <span className="text-gray-600">
                    Flagged ({flaggedCount})
                  </span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowNavigator(!showNavigator)}
              variant="outline"
              size="sm"
            >
              {showNavigator ? (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Show</span>
                </>
              )}
            </Button>
          </div>

          {showNavigator && (
            <div className="py-4">
              <div className="grid grid-cols-10 md:grid-cols-15 lg:grid-cols-20 gap-2">
                {questions.map((question, index) => {
                  const isAnswered =
                    answers[question.id] !== undefined &&
                    answers[question.id] !== null;
                  const isCurrent = index === current;
                  const isFlagged = flaggedQuestions.has(index);

                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-10 h-10 text-sm font-medium rounded-lg border-2 transition-all ${
                        isCurrent
                          ? "border-blue-500 bg-blue-500 text-white"
                          : isAnswered
                          ? "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-card text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-muted/50"
                      } ${isFlagged ? "ring-2 ring-yellow-400" : ""}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Calculator */}
      {showCalculator && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white dark:bg-card border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 w-64">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CalculatorIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Calculator
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalculator(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-gray-50 dark:bg-muted/30 border dark:border-gray-600 rounded p-3 mb-4">
              <div className="text-right text-lg font-mono text-foreground truncate">
                {calcDisplay}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" className="h-12" onClick={clearCalc}>
                C
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={backspaceCalc}
              >
                ⌫
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => performCalcOperation("/")}
              >
                ÷
              </Button>
              <Button
                className="h-12 bg-blue-600 text-white"
                onClick={() => performCalcOperation("*")}
              >
                ×
              </Button>

              <Button
                variant="outline"
                className="h-12"
                onClick={() => inputCalcNumber("7")}
              >
                7
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => inputCalcNumber("8")}
              >
                8
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => inputCalcNumber("9")}
              >
                9
              </Button>
              <Button
                className="h-12 bg-blue-600 text-white"
                onClick={() => performCalcOperation("-")}
              >
                −
              </Button>

              <Button
                variant="outline"
                className="h-12"
                onClick={() => inputCalcNumber("4")}
              >
                4
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => inputCalcNumber("5")}
              >
                5
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => inputCalcNumber("6")}
              >
                6
              </Button>
              <Button
                className="h-12 bg-blue-600 text-white"
                onClick={() => performCalcOperation("+")}
              >
                +
              </Button>

              <Button
                variant="outline"
                className="h-12"
                onClick={() => inputCalcNumber("1")}
              >
                1
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => inputCalcNumber("2")}
              >
                2
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={() => inputCalcNumber("3")}
              >
                3
              </Button>
              <Button
                className="h-12 bg-green-600 text-white row-span-2"
                onClick={() => performCalcOperation("=")}
                style={{ gridRow: "span 2" }}
              >
                =
              </Button>

              <Button
                variant="outline"
                className="h-12 col-span-2"
                onClick={() => inputCalcNumber("0")}
                style={{ gridColumn: "span 2" }}
              >
                0
              </Button>
              <Button
                variant="outline"
                className="h-12"
                onClick={inputCalcDecimal}
              >
                .
              </Button>
            </div>

            <div className="mt-3 text-xs text-muted-foreground text-center">
              Use keyboard: 0-9, +, -, *, /, Enter, Esc
            </div>
          </div>
        </div>
      )}

      {/* Submit Warning Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-card rounded-lg p-6 max-w-md mx-4 border dark:border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold">Submit Exam?</h3>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-muted-foreground">
                Are you sure you want to submit your exam? This action cannot be
                undone.
              </p>
              <div className="bg-gray-50 dark:bg-muted/30 p-3 rounded">
                <div className="text-sm space-y-1">
                  <div>Total Questions: {totalQuestions}</div>
                  <div>Answered: {answeredCount}</div>
                  <div>Unanswered: {unansweredCount}</div>
                  {timeLeft !== null && (
                    <div>Time Remaining: {formatTime(timeLeft)}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setShowSubmitModal(false)}
                variant="outline"
                className="flex-1"
              >
                Continue Exam
              </Button>
              <Button
                onClick={() => confirmSubmit(false)}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Now"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
