import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { LearnerTestimonial } from "@/entities/LearnerTestimonial";

export const runtime = "nodejs";

// GET /api/website/testimonials - Get active learner testimonials for public website
export async function GET() {
  try {
    const AppDataSource = await getDataSource();
    const testimonialRepo = AppDataSource.getRepository(LearnerTestimonial);

    const testimonials = await testimonialRepo.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
      select: ["id", "name", "program", "institution", "content", "imageUrl", "createdAt"],
    });

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}