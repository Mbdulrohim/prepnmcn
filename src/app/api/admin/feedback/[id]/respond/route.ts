import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { sendFeedbackEmail } from "@/lib/email";
import {
  wrapEmailTemplate,
  emailHeading,
  emailParagraph,
  quoteBlock,
  infoBlock,
  signatureBlock,
} from "@/lib/email-template";

export const runtime = "nodejs"; // Force Node.js runtime

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { response } = await request.json();
    if (!response || !response.trim()) {
      return NextResponse.json(
        { error: "Response message is required" },
        { status: 400 },
      );
    }

    const AppDataSource = await getDataSource();
    const { Feedback } = await import("@/entities/Feedback");
    const { User } = await import("@/entities/User");
    const feedbackRepo = AppDataSource.getRepository(Feedback);
    const userRepo = AppDataSource.getRepository(User);

    // Get the feedback with user relation
    const feedback = await feedbackRepo.findOne({
      where: { id: parseInt(id) },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 },
      );
    }

    // Get user details by userId
    const userDetails = await userRepo.findOne({
      where: { id: feedback.userId },
    });

    if (!userDetails) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Send email to user
    try {
      await sendFeedbackEmail({
        to: userDetails.email,
        subject: "Response to Your Feedback - O'Prep",
        html: wrapEmailTemplate({
          preheader: "We've responded to your feedback",
          body: `
            ${emailHeading("Response to Your Feedback")}
            ${emailParagraph(`Hi <strong>${userDetails.name}</strong>,`)}
            ${emailParagraph("Thank you for your feedback on O'Prep. We've received your message:")}
            ${quoteBlock(feedback.message)}
            ${emailParagraph("<strong>Our Response:</strong>")}
            ${infoBlock(response.replace(/\n/g, "<br>"))}
            ${emailParagraph("If you have any further questions or need additional assistance, please don't hesitate to reach out.")}
            ${signatureBlock()}
          `,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send response email:", emailError);
      return NextResponse.json(
        { error: "Failed to send email response" },
        { status: 500 },
      );
    }

    // Update feedback status to responded
    feedback.status = "responded";
    await feedbackRepo.save(feedback);

    return NextResponse.json({
      message: "Response sent successfully",
      feedback: {
        id: feedback.id,
        status: feedback.status,
      },
    });
  } catch (error) {
    console.error("Error sending feedback response:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
