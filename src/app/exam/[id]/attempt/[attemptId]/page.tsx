"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import ExamPlayer from "@/components/ExamPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  type: string;
  options?: string[];
  marks?: number;
}

export default function AttemptPage() {
  const params = useParams();
  const id = params.id as string;
  const attemptId = params.attemptId as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [attempt, setAttempt] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
    if (status === "authenticated") {
      fetchAttempt();
      fetchQuestions();
    }
  }, [status]);

  const fetchAttempt = async () => {
    try {
      const resp = await fetch(`/api/exams/attempts/${attemptId}`);
      if (!resp.ok) throw new Error("Failed to load attempt");
      const data = await resp.json();
      if (data.success) {
        setAttempt(data.data);
        setAnswers(data.data.answers || {});
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load attempt");
    }
  };

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const resp = await fetch(`/api/exams/${id}/questions`);
      if (!resp.ok) throw new Error("Failed to fetch questions");
      const { success, data } = await resp.json();
      if (success) setQuestions(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch questions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (qId: string, selected: any) => {
    setAnswers((prev) => ({ ...prev, [qId]: selected }));
  };

  const saveProgress = async () => {
    try {
      const resp = await fetch(`/api/exams/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        toast.success("Progress saved");
        setAttempt(data.data);
      } else {
        toast.error(data.error || "Failed to save progress");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to save progress");
    }
  };

  const submitAttempt = async () => {
    if (
      !confirm(
        "Are you sure you want to submit? You won't be able to change answers after submission."
      )
    )
      return;
    try {
      setSubmitting(true);
      // Save before submit
      await fetch(`/api/exams/attempts/${attemptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const resp = await fetch(`/api/exams/attempts/${attemptId}`, {
        method: "POST",
      });
      const data = await resp.json();

      if (resp.ok && data.success) {
        toast.success("Exam submitted");
        // Show results
        router.push(`/exam/${id}`);
      } else {
        toast.error(data.error || "Failed to submit attempt");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit attempt");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-4">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Attempt</CardTitle>
        </CardHeader>
        <CardContent>
          <ExamPlayer
            examId={id}
            attemptId={attemptId}
            onSubmitDone={() => router.push(`/exam/${id}`)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
