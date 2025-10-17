import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { Feedback } from "@/entities/Feedback";
import { User } from "@/entities/User";
import { sendFeedbackEmail } from "@/lib/email";

export const runtime = "nodejs"; // Force Node.js runtime

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const feedbackRepo = AppDataSource.getRepository(Feedback);
    const userRepo = AppDataSource.getRepository(User);

    // Get the feedback with user relation
    const feedback = await feedbackRepo.findOne({
      where: { id: parseInt(id) },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: "Feedback not found" },
        { status: 404 }
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
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">Response to Your Feedback</h2>
            <p>Hi ${userDetails.name},</p>

            <p>Thank you for your feedback on O'Prep. We've received your message:</p>

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1e40af;">
              <p style="margin: 0; font-style: italic;">"${
                feedback.message
              }"</p>
            </div>

            <p><strong>Our Response:</strong></p>

            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <p style="margin: 0;">${response.replace(/\n/g, "<br>")}</p>
            </div>

            <p>If you have any further questions or need additional assistance, please don't hesitate to reach out.</p>

            <p>Best regards,<br>The O'Prep Team</p>

            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
              This is an automated response to your feedback submission.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send response email:", emailError);
      return NextResponse.json(
        { error: "Failed to send email response" },
        { status: 500 }
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
      { status: 500 }
    );
  }
}
