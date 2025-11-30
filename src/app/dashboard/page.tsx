"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Trophy,
  Target,
  BookOpen,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  BarChart3,
  Users,
  Award,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { ADMIN_ROLES } from "@/lib/roles";

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <Skeleton className="h-6 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-md mx-auto" />

          {/* Overview Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity Skeleton */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 space-y-4">
                  <Skeleton className="h-12 w-12 mx-auto" />
                  <Skeleton className="h-6 w-48 mx-auto" />
                  <Skeleton className="h-4 w-64 mx-auto" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

interface User {
  id: string;
  name: string;
  email: string;
  institution: string;
  role: string;
  points: number;
  streak?: number;
  dashboardStats?: {
    hoursStudied: number;
    recentActivity: {
      id: string;
      examTitle: string;
      score: number;
      totalMarks: number;
      date: string;
    }[];
    overallProgress: number;
    subjectProgress: {
      subject: string;
      progress: number;
    }[];
  };
}

interface ExamEnrollment {
  id: string;
  examId: string;
  status: string;
  paymentStatus: string;
  enrolledAt: string;
  exam: {
    id: string;
    title: string;
    subject: string;
    type: string;
    duration: number;
    totalQuestions: number;
  };
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [examEnrollments, setExamEnrollments] = useState<ExamEnrollment[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const [userResponse, enrollmentsResponse] = await Promise.all([
        fetch("/api/user/me"),
        fetch("/api/exams/enrollments"),
      ]);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        // Merge dashboardStats into user object if it comes separately or nested
        if (userData.dashboardStats) {
          userData.user.dashboardStats = userData.dashboardStats;
        }
        setUser(userData.user);
      }

      if (enrollmentsResponse.ok) {
        const enrollmentsData = await enrollmentsResponse.json();
        if (enrollmentsData.success) {
          setExamEnrollments(enrollmentsData.data);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={user?.name || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.name || "Student"}!
              </h1>
              <p className="text-muted-foreground">
                {user?.institution || "Institution not set"} •{" "}
                {user?.role || "Student"}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Active Student
          </Badge>
          {(ADMIN_ROLES as readonly string[]).includes(user?.role || "") && (
            <Button asChild variant="outline" size="sm" className="ml-4">
              <Link href="/admin" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Points
              </CardTitle>
              <Trophy className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-1">
                {user?.points || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Start earning points!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Study Streak
              </CardTitle>
              <Target className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">
                {user?.streak || 0} days
              </div>
              <p className="text-xs text-muted-foreground">
                {(user?.streak || 0) > 0 ? "Keep it up!" : "Start your streak!"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Hours Studied
              </CardTitle>
              <Clock className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">
                {user?.dashboardStats?.hoursStudied || 0}h
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">
                {user?.dashboardStats?.overallProgress || 0}%
              </div>
              <Progress
                value={user?.dashboardStats?.overallProgress || 0}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exams">My Exams</TabsTrigger>
            <TabsTrigger value="study">Study Plan</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>
                    Jump into your study session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/study-session">
                      <Calendar className="mr-2 h-4 w-4" />
                      Start Study Session
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/exams">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Take Practice Test
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/community">
                      <Users className="mr-2 h-4 w-4" />
                      Join Study Group
                    </Link>
                  </Button>
                  <Link href="/resources" passHref>
                    <Button className="w-full justify-start" variant="outline">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Browse Resources
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest study accomplishments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.dashboardStats?.recentActivity &&
                  user.dashboardStats.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {user.dashboardStats.recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium">{activity.examTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">
                              {activity.score}/{activity.totalMarks}
                            </p>
                            <Badge variant="outline">Completed</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No activity yet
                      </h3>
                      <p className="text-muted-foreground">
                        Start studying to see your activity here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            {examEnrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {examEnrollments.map((enrollment) => (
                  <Card
                    key={enrollment.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {enrollment.exam.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {enrollment.exam.subject} • {enrollment.exam.type}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            enrollment.status === "completed"
                              ? "default"
                              : enrollment.status === "in_progress"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {enrollment.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {enrollment.exam.duration} min
                            </div>
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {enrollment.exam.totalQuestions} questions
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            Enrolled{" "}
                            {new Date(
                              enrollment.enrolledAt
                            ).toLocaleDateString()}
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/exams/${enrollment.exam.id}/take`}>
                              {enrollment.status === "completed" ? (
                                <>
                                  <CheckCircle className="mr-2 h-3 w-3" />
                                  View Results
                                </>
                              ) : (
                                <>
                                  <BookOpen className="mr-2 h-3 w-3" />
                                  Take Exam
                                </>
                              )}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    My Exams
                  </CardTitle>
                  <CardDescription>
                    View your enrolled exams and track your progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No exams enrolled yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Browse available exams and enroll to start testing your
                      knowledge.
                    </p>
                    <Button asChild>
                      <Link href="/exams">Browse Exams</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="study" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Study Planner
                </CardTitle>
                <CardDescription>
                  Plan your study sessions and track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Study Planner Coming Soon
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    We&apos;re working on an advanced study planning system to
                    help you organize your exam preparation.
                  </p>
                  <Button>Get Notified</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Progress Tracking
                </CardTitle>
                <CardDescription>
                  Monitor your learning journey and exam readiness
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{user?.dashboardStats?.overallProgress || 0}%</span>
                    </div>
                    <Progress
                      value={user?.dashboardStats?.overallProgress || 0}
                    />
                  </div>
                  {user?.dashboardStats?.subjectProgress?.map((subject) => (
                    <div key={subject.subject}>
                      <div className="flex justify-between text-sm mb-2">
                        <span>{subject.subject}</span>
                        <span>{subject.progress}%</span>
                      </div>
                      <Progress value={subject.progress} />
                    </div>
                  ))}
                  {(!user?.dashboardStats?.subjectProgress ||
                    user.dashboardStats.subjectProgress.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No subject progress data available yet.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Your milestones and accomplishments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No achievements yet
                  </h3>
                  <p className="text-muted-foreground">
                    Complete quizzes and study sessions to unlock achievements.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
