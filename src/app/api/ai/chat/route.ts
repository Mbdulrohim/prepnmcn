import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createChatCompletion,
  createStreamingChatCompletion,
} from "@/lib/openai";
import { getDataSource } from "@/lib/database";
import { User } from "@/entities/User";
import { ExamAttempt } from "@/entities/ExamAttempt";
import { ExamEnrollment } from "@/entities/ExamEnrollment";
import { EnrollmentStatus } from "@/entities/ExamEnrollment";

interface UserContext {
  name: string;
  institution: string;
  level: string;
  courses: string[];
  studyPlan?: any;
  recentExamAttempts: Array<{
    examTitle: string;
    score: number;
    date: string;
  }>;
  enrolledExams: string[];
}

async function getUserContext(userId: string): Promise<UserContext> {
  const dataSource = await getDataSource();
  const userRepository = dataSource.getRepository(User);
  const examAttemptRepository = dataSource.getRepository(ExamAttempt);
  const examEnrollmentRepository = dataSource.getRepository(ExamEnrollment);

  // Get user basic info
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ["institution"],
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Get recent exam attempts (last 5)
  const recentAttempts = await examAttemptRepository.find({
    where: { userId },
    relations: ["exam"],
    order: { createdAt: "DESC" },
    take: 5,
  });

  // Get enrolled exams
  const enrollments = await examEnrollmentRepository.find({
    where: { userId, status: EnrollmentStatus.ENROLLED },
    relations: ["exam"],
  });

  return {
    name: user.name || "Student",
    institution: user.institution?.name || "Not specified",
    level: user.academicLevel || "Not specified",
    courses: user.selectedCourses?.map((c) => c.courseName) || [],
    recentExamAttempts: recentAttempts.map((attempt) => ({
      examTitle: attempt.exam?.title || "Unknown Exam",
      score: attempt.score || 0,
      date: attempt.createdAt.toISOString().split("T")[0],
    })),
    enrolledExams: enrollments.map((e) => e.exam?.title || "Unknown Exam"),
  };
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      message,
      conversationHistory = [],
      stream = false,
    } = await request.json();

    console.log("AI Chat request:", {
      message: message.substring(0, 50),
      stream,
      conversationHistoryLength: conversationHistory.length,
    });

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get user context
    const userContext = await getUserContext(session.user.id);

    // Create system prompt with user context
    const systemPrompt = `You are PrepNMCN's AI Study Assistant, a helpful and knowledgeable tutor specializing in nursing education and exam preparation.

USER CONTEXT:
- Name: ${userContext.name}
- Institution: ${userContext.institution}
- Academic Level: ${userContext.level}
- Courses: ${userContext.courses.join(", ") || "Not specified"}
- Enrolled Exams: ${userContext.enrolledExams.join(", ") || "None"}
- Recent Performance: ${
      userContext.recentExamAttempts.length > 0
        ? userContext.recentExamAttempts
            .map((a) => `${a.examTitle}: ${a.score}% (${a.date})`)
            .join("; ")
        : "No recent attempts"
    }

INSTRUCTIONS:
- Be encouraging, supportive, and personalized
- Reference their institution, level, and enrolled exams when relevant
- Provide study tips, exam strategies, and subject-specific help
- For nursing content, focus on NMCN curriculum and exam patterns
- Suggest relevant study resources and practice questions
- Track their progress and offer personalized advice
- Keep responses concise but helpful (under 300 words)
- If they ask about specific exams, reference their enrollment status
- Always maintain a professional, educational tone

You have access to information about:
- Nursing exam preparation (RN, RM, RPHN, NCLEX)
- Study planning and time management
- Exam strategies and techniques
- Subject-specific nursing content
- Career guidance for nursing students`;

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: "user", content: message },
    ];

    if (stream) {
      console.log("Using streaming response");
      // Handle streaming response
      const streamResponse = await createStreamingChatCompletion(messages, {
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 500,
      });

      // Create a ReadableStream for the response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content;
              if (content) {
                const data = JSON.stringify({ content });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } else {
      console.log("Using regular response");
      // Handle regular response
      const aiResponse = await createChatCompletion(messages, {
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 500,
      });

      return NextResponse.json({
        response: aiResponse,
        userContext: {
          name: userContext.name,
          institution: userContext.institution,
          level: userContext.level,
          enrolledExamsCount: userContext.enrolledExams.length,
          recentAttemptsCount: userContext.recentExamAttempts.length,
        },
      });
    }
  } catch (error) {
    console.error("AI Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
