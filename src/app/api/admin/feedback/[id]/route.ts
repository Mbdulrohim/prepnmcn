import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Feedback } from "@/entities/Feedback";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !["unread", "read", "responded"].includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const AppDataSource = await getDataSource();
    const feedbackRepo = AppDataSource.getRepository(Feedback);

    const feedback = await feedbackRepo.findOne({
      where: { id: parseInt(id) },
    });

    if (!feedback) {
      return NextResponse.json(
        { message: "Feedback not found" },
        { status: 404 }
      );
    }

    feedback.status = status;
    await feedbackRepo.save(feedback);

    return NextResponse.json({
      message: "Feedback status updated successfully",
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    return NextResponse.json(
      { message: "Error updating feedback" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const AppDataSource = await getDataSource();
    const feedbackRepo = AppDataSource.getRepository(Feedback);

    const feedback = await feedbackRepo.findOne({
      where: { id: parseInt(id) },
    });

    if (!feedback) {
      return NextResponse.json(
        { message: "Feedback not found" },
        { status: 404 }
      );
    }

    await feedbackRepo.remove(feedback);

    return NextResponse.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    return NextResponse.json(
      { message: "Error deleting feedback" },
      { status: 500 }
    );
  }
}
