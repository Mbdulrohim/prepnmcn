import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { LearnerTestimonial } from "@/entities/LearnerTestimonial";

export const runtime = "nodejs";

// GET /api/admin/website/testimonials - Get all learner testimonials
export async function GET() {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const AppDataSource = await getDataSource();
    const testimonialRepo = AppDataSource.getRepository(LearnerTestimonial);

    const testimonials = await testimonialRepo.find({
      order: { createdAt: "DESC" },
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

// POST /api/admin/website/testimonials - Create a new testimonial
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, program, institution, content, imageUrl, isActive } = body;

    if (!name || !program || !institution || !content) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const testimonialRepo = AppDataSource.getRepository(LearnerTestimonial);

    const testimonial = testimonialRepo.create({
      name,
      program,
      institution,
      content,
      imageUrl,
      isActive: isActive !== undefined ? isActive : true,
    });

    await testimonialRepo.save(testimonial);

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}