import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";
import { ExamAttempt } from "@/entities/ExamAttempt";
import { ExamEnrollment } from "@/entities/ExamEnrollment";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const AppDataSource = await getDataSource();

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({
      where: { id: (session.user as any).id },
      relations: ["institution"],
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch Dashboard Stats
    const attemptRepo = AppDataSource.getRepository(ExamAttempt);
    const enrollmentRepo = AppDataSource.getRepository(ExamEnrollment);

    // 1. Hours Studied (Total time taken in seconds / 3600)
    // We'll calculate total all-time for now, or we could filter by date for "This week"
    const { totalTime } = await attemptRepo
      .createQueryBuilder("attempt")
      .select("SUM(attempt.timeTaken)", "totalTime")
      .where("attempt.userId = :userId", { userId: user.id })
      .getRawOne();

    const hoursStudied = totalTime ? Math.round((parseInt(totalTime) / 3600) * 10) / 10 : 0;

    // 2. Recent Activity (Last 5 attempts)
    const recentActivity = await attemptRepo.find({
      where: { userId: user.id },
      relations: ["exam"],
      order: { startedAt: "DESC" },
      take: 5,
    });

    // 3. Progress (Completed enrollments / Total enrollments)
    const enrollments = await enrollmentRepo.find({
      where: { userId: user.id },
      relations: ["exam"],
    });

    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.status === "completed").length;
    const overallProgress = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

    // Subject Progress
    const subjectStats: Record<string, { total: number; completed: number }> = {};
    enrollments.forEach(e => {
      const subject = e.exam.subject || "General";
      if (!subjectStats[subject]) {
        subjectStats[subject] = { total: 0, completed: 0 };
      }
      subjectStats[subject].total += 1;
      if (e.status === "completed") {
        subjectStats[subject].completed += 1;
      }
    });

    const subjectProgress = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      progress: Math.round((stats.completed / stats.total) * 100),
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        institution: user.institution ? user.institution.name : "N/A",
        role: user.role,
        points: user.points,
        permissions: user.permissions || [],
        academicLevel: user.academicLevel,
        selectedCourses: user.selectedCourses,
        studyPreferences: user.studyPreferences,
        notificationSettings: user.notificationSettings,
        streak: user.streak,
      },
      dashboardStats: {
        hoursStudied,
        recentActivity: recentActivity.map(a => ({
          id: a.id,
          examTitle: a.exam.title,
          score: a.score,
          totalMarks: a.totalMarks,
          date: a.startedAt,
        })),
        overallProgress,
        subjectProgress,
      }
    });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
