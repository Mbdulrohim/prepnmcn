"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";
import { BookOpen, Clock } from "lucide-react";

interface ExamSummary {
  id: string;
  title: string;
  totalQuestions: number;
  duration: number; // minutes
  type?: string;
  subject?: string;
  topics?: string[];
  startAt?: string | null;
  endAt?: string | null;
}

export default function ExamStartDialog({
  exam,
  onStart,
}: {
  exam: ExamSummary;
  onStart: () => void;
}) {
  const { data: session } = useSession();
  const [agree, setAgree] = useState(false);
  const [user, setUser] = useState<{
    name?: string;
    institution?: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/user/me");
        const data = await res.json();
        if (res.ok) {
          setUser({
            name: data?.user?.name,
            institution: data?.user?.institution,
          });
        }
      } catch (e) {
        console.error("Failed to fetch user for dialog", e);
      }
    };

    load();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">
          <BookOpen className="mr-2 h-4 w-4" />
          Take Exam
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Start Your Exam</DialogTitle>
          <DialogDescription>
            Please confirm your details and exam information before starting
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          <div>
            <h4 className="text-sm text-muted-foreground">Exam</h4>
            <div className="mt-2">
              <div className="text-lg font-semibold">{exam.title}</div>
              <div className="text-sm text-muted-foreground">
                {exam.subject} • {exam.type}
              </div>
              {exam.startAt && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Starts: {new Date(exam.startAt).toLocaleString()}
                </div>
              )}
              <div className="flex gap-2 items-center mt-2">
                <Badge variant="outline">
                  Questions: {exam.totalQuestions}
                </Badge>
                <Badge variant="outline">
                  Duration:{" "}
                  {Math.floor(exam.duration / 60) > 0
                    ? `${Math.floor(exam.duration / 60)}h ${
                        exam.duration % 60
                      }m`
                    : `${exam.duration}m`}
                </Badge>
              </div>

              {exam.topics && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium">Topics Covered:</h5>
                  <div className="text-sm text-muted-foreground mt-1 max-h-28 overflow-auto">
                    {exam.topics.slice(0, 7).map((t, i) => (
                      <div key={i}>• {t}</div>
                    ))}
                    {exam.topics.length > 7 && (
                      <div className="text-muted-foreground text-xs mt-1">
                        +{exam.topics.length - 7} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm text-muted-foreground">Your Details</h4>
            <div className="mt-2">
              <div className="text-sm">Name:</div>
              <div className="font-medium">
                {user?.name || session?.user?.name}
              </div>

              <div className="mt-3 text-sm">University:</div>
              <div className="font-medium">{user?.institution || "N/A"}</div>

              <div className="mt-4 text-sm">Confirmation</div>
              <ul className="list-disc ml-5 text-sm mt-2 text-muted-foreground">
                <li>
                  I will not use any unauthorized materials during the exam
                </li>
                <li>
                  I understand that this exam is timed and cannot be paused
                </li>
                <li>I confirm that the information above is correct</li>
                <li>I am ready to begin the exam now</li>
              </ul>

              <div className="mt-4">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={agree}
                    onCheckedChange={(v) => setAgree(Boolean(v))}
                  />
                  <span className="text-sm">
                    I agree to the exam terms and conditions
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              Important Reminders: Ensure a stable internet connection, quiet
              environment, progress auto-saves, the exam will auto-submit when
              time expires.
            </p>
          </div>

          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button
                disabled={
                  !agree ||
                  (exam.startAt ? new Date() < new Date(exam.startAt) : false)
                }
                onClick={() => {
                  onStart();
                }}
              >
                Start Exam
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
