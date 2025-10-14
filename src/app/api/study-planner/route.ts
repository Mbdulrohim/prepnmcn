import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { NotificationAutomation } from "../../../lib/notification-automation";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { examType, examDate, studyHours, knowledgeLevel } = body;

    // Calculate study plan based on inputs
    const examDateObj = new Date(examDate);
    const today = new Date();
    const daysUntilExam = Math.ceil(
      (examDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate study schedule
    const studyPlan = generateStudyPlan(
      examType,
      daysUntilExam,
      studyHours,
      knowledgeLevel
    );

    // Trigger automation for study plan creation
    try {
      await NotificationAutomation.triggerAutomation("study_plan_created", {
        userId: parseInt(userId),
        examType,
        examDate,
        studyHours,
        knowledgeLevel,
        daysUntilExam,
        planGenerated: true,
      });
    } catch (error) {
      console.error("Failed to trigger study plan creation automation:", error);
      // Don't fail the study plan generation if automation fails
    }

    return NextResponse.json({ studyPlan });
  } catch (error) {
    console.error("Error generating study plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateStudyPlan(
  examType: string,
  daysUntilExam: number,
  studyHours: number,
  knowledgeLevel: string
) {
  const topics = getTopicsForExam(examType);
  const sessionsPerDay = Math.max(1, Math.floor(studyHours / 2)); // Assume 2-hour sessions
  const totalSessions = daysUntilExam * sessionsPerDay;

  const topicsPerSession = Math.ceil(topics.length / totalSessions);

  const studyPlan = [];
  let topicIndex = 0;

  for (let day = 1; day <= daysUntilExam; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);

    const dayTopics = [];
    for (
      let session = 0;
      session < sessionsPerDay && topicIndex < topics.length;
      session++
    ) {
      const sessionTopics = topics.slice(
        topicIndex,
        topicIndex + topicsPerSession
      );
      dayTopics.push({
        session: session + 1,
        topics: sessionTopics,
        duration: 2, // hours
      });
      topicIndex += topicsPerSession;
    }

    studyPlan.push({
      date: date.toISOString().split("T")[0],
      day,
      sessions: dayTopics,
    });
  }

  return studyPlan;
}

function getTopicsForExam(examType: string): string[] {
  const topicMaps: { [key: string]: string[] } = {
    "RN Pathway": [
      "Anatomy and Physiology",
      "Medical-Surgical Nursing",
      "Pediatric Nursing",
      "Maternal and Child Health",
      "Mental Health Nursing",
      "Community Health Nursing",
      "Pharmacology",
      "Pathophysiology",
      "Nursing Ethics and Jurisprudence",
    ],
    "RM Pathway": [
      "Midwifery Theory",
      "Obstetrics",
      "Gynecology",
      "Neonatal Care",
      "Family Planning",
      "Reproductive Health",
      "Midwifery Practice",
      "Emergency Obstetrics",
    ],
    "RPHN Pathway": [
      "Public Health Nursing",
      "Epidemiology",
      "Health Education",
      "Community Assessment",
      "Health Policy",
      "Environmental Health",
      "Occupational Health",
    ],
    NCLEX: [
      "Management of Care",
      "Safety and Infection Control",
      "Health Promotion",
      "Psychosocial Integrity",
      "Physiological Integrity",
    ],
    "O'Level": [
      "English Language",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
      "Geography",
      "Economics",
    ],
    JAMB: [
      "English Language",
      "Mathematics",
      "Biology",
      "Chemistry",
      "Physics",
      "Government",
      "Literature",
      "Economics",
    ],
  };

  return topicMaps[examType] || [];
}
