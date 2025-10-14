import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (
    !session ||
    !["admin", "super_admin"].includes((session.user as any)?.role)
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Validate limit (max 100 to prevent abuse)
    const validatedLimit = Math.min(Math.max(limit, 1), 100);

    // Mock data for AI engine - in real implementation, this would come from database
    const mockPrompts = [
      {
        id: "1",
        name: "Study Plan Generator",
        model: "GPT-4",
        successRate: 94,
        usageCount: 1250,
        lastUpdated: "2024-01-20",
        status: "active",
      },
      {
        id: "2",
        name: "Question Analyzer",
        model: "GPT-3.5",
        successRate: 87,
        usageCount: 890,
        lastUpdated: "2024-01-18",
        status: "active",
      },
      {
        id: "3",
        name: "Progress Predictor",
        model: "GPT-4",
        successRate: 91,
        usageCount: 654,
        lastUpdated: "2024-01-15",
        status: "testing",
      },
      {
        id: "4",
        name: "Feedback Generator",
        model: "GPT-3.5",
        successRate: 78,
        usageCount: 432,
        lastUpdated: "2024-01-12",
        status: "deprecated",
      },
      {
        id: "5",
        name: "Content Summarizer",
        model: "GPT-4",
        successRate: 96,
        usageCount: 2103,
        lastUpdated: "2024-01-10",
        status: "active",
      },
    ];

    // Simulate pagination
    const totalCount = mockPrompts.length;
    const paginatedPrompts = mockPrompts.slice(offset, offset + validatedLimit);

    return NextResponse.json({
      prompts: paginatedPrompts,
      totalCount,
      hasMore: offset + validatedLimit < totalCount,
      currentLimit: validatedLimit,
      currentOffset: offset,
    });
  } catch (error) {
    console.error("Error fetching AI engine data:", error);
    return NextResponse.json(
      { message: "Error fetching AI engine data" },
      { status: 500 }
    );
  }
}
