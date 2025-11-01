"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Target, BookOpen, CheckCircle } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  institution: string;
  role: string;
}

interface StudySession {
  session: number;
  topics: string[];
  duration: number;
}

interface StudyDay {
  date: string;
  day: number;
  sessions: StudySession[];
}

interface StudyPlan {
  studyPlan: StudyDay[];
}

export default function StudyPlanner() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyDay[] | null>(null);
  const [examType, setExamType] = useState("");
  const [examDate, setExamDate] = useState("");
  const [studyHours, setStudyHours] = useState("");
  const [knowledgeLevel, setKnowledgeLevel] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/user/me")
      .then((res) => {
        if (res.ok) {
          return res.json();
        } else {
          router.push("/auth/signin");
        }
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {
        router.push("/auth/signin");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const response = await fetch("/api/study-planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examType,
          examDate,
          studyHours: parseInt(studyHours),
          knowledgeLevel,
        }),
      });

      if (response.ok) {
        const data: StudyPlan = await response.json();
        setStudyPlan(data.studyPlan);
      } else {
        console.error("Failed to generate study plan");
      }
    } catch (error) {
      console.error("Error generating study plan:", error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading study planner...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Required</CardTitle>
            <CardDescription>
              Please sign in to access the study planner.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Personal Study Planner
          </h1>
          <p className="text-xl text-muted-foreground">
            Create customized study schedules based on your exam dates and
            learning pace.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Study Plan Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Create Your Study Plan
                </CardTitle>
                <CardDescription>
                  Fill in your details to generate a personalized study schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGeneratePlan} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="exam-type">Exam Type</Label>
                    <Select value={examType} onValueChange={setExamType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your exam" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rn">RN Pathway</SelectItem>
                        <SelectItem value="rm">RM Pathway</SelectItem>
                        <SelectItem value="rphn">RPHN Pathway</SelectItem>
                        <SelectItem value="nclex">NCLEX</SelectItem>
                        <SelectItem value="olevel">O'Level</SelectItem>
                        <SelectItem value="jamb">JAMB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exam-date">Exam Date</Label>
                    <Input
                      id="exam-date"
                      type="date"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="study-hours">Study Hours Per Day</Label>
                    <Select value={studyHours} onValueChange={setStudyHours}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="3">3 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="5">5 hours</SelectItem>
                        <SelectItem value="6">6+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="knowledge-level">
                      Current Knowledge Level
                    </Label>
                    <Select
                      value={knowledgeLevel}
                      onValueChange={setKnowledgeLevel}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={generating}>
                    {generating ? "Generating Plan..." : "Generate Study Plan"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Study Plan Display */}
          {studyPlan && (
            <div className="lg:col-span-3 mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Your Study Plan
                  </CardTitle>
                  <CardDescription>
                    Your personalized study schedule for {examType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {studyPlan.slice(0, 7).map((day) => (
                      <div key={day.day} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg">
                            Day {day.day} - {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                          </h3>
                          <Badge variant="outline">
                            {day.sessions.length} session{day.sessions.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          {day.sessions.map((session) => (
                            <div key={session.session} className="bg-muted/50 rounded p-3">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-medium">Session {session.session}</span>
                                <span className="text-sm text-muted-foreground">({session.duration}h)</span>
                              </div>
                              <div className="space-y-1">
                                {session.topics.map((topic, index) => (
                                  <div key={index} className="text-sm flex items-center gap-2">
                                    <CheckCircle className="h-3 w-3 text-primary" />
                                    {topic}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {studyPlan.length > 7 && (
                      <div className="text-center">
                        <p className="text-muted-foreground">
                          And {studyPlan.length - 7} more days...
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Study Tips Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Consistent Schedule</h4>
                    <p className="text-sm text-muted-foreground">
                      Study at the same time each day to build habits.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Active Learning</h4>
                    <p className="text-sm text-muted-foreground">
                      Use practice questions and teach concepts to others.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Regular Breaks</h4>
                    <p className="text-sm text-muted-foreground">
                      Take short breaks every 25-50 minutes of study.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Study Streak
                  </span>
                  <span className="font-medium">0 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Hours This Week
                  </span>
                  <span className="font-medium">0h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Completed Tasks
                  </span>
                  <span className="font-medium">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
