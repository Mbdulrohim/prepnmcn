import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { User } from "@/entities/User";
import { Notification } from "@/entities/Notification";
import { sendEmail } from "@/lib/email";
import { getDataSource } from "@/lib/database";
import { z } from "zod";
import { NotificationAutomation } from "@/lib/notification-automation";

export const runtime = "nodejs";

// Validation schemas
const sendEmailSchema = z
  .object({
    recipientEmails: z.array(z.string().email()).optional(),
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(10000),
    recipientRole: z
      .enum(["all", "user", "admin", "super_admin"])
      .optional(),
  })
  .refine(
    (data) => {
      // Either recipientEmails must be provided, or recipientRole must be provided
      return (
        (data.recipientEmails && data.recipientEmails.length > 0) ||
        data.recipientRole
      );
    },
    {
      message: "Either recipientEmails or recipientRole must be provided",
      path: ["recipientEmails"],
    }
  );

const createAutomationRuleSchema = z.object({
  name: z.string().min(1).max(100),
  trigger: z.enum([
    "user_registration",
    "feedback_submitted",
    "study_plan_created",
    "custom",
  ]),
  conditions: z.record(z.string(), z.any()),
  template: z.object({
    subject: z.string().min(1).max(200),
    body: z.string().min(1).max(10000),
  }),
});

// GET /api/admin/notifications - Fetch notifications and automation rules
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      !["super_admin", "admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const AppDataSource = await getDataSource();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'email' | 'automation' | null

    if (type === "automation") {
      const rules = await NotificationAutomation.getRules(AppDataSource);
      return NextResponse.json({
        success: true,
        data: rules,
      });
    }

    // Fetch notifications from database
    const notificationRepo = AppDataSource.getRepository(Notification);

    const notifications = await notificationRepo.find({
      order: { createdAt: "DESC" },
      take: 100, // Limit to last 100 notifications
    });

    // Return both email notifications and automation rules
    const automationRules = await NotificationAutomation.getRules(AppDataSource);
    return NextResponse.json({
      success: true,
      data: {
        notifications,
        automationRules,
        stats: {
          totalEmails: notifications.filter(
            (n: Notification) => n.type === "email"
          ).length,
          sentEmails: notifications.filter(
            (n: Notification) => n.type === "email" && n.status === "sent"
          ).length,
          pendingEmails: notifications.filter(
            (n: Notification) => n.type === "email" && n.status === "pending"
          ).length,
          failedEmails: notifications.filter(
            (n: Notification) => n.type === "email" && n.status === "failed"
          ).length,
          activeAutomationRules: automationRules.filter((r) => r.isActive)
            .length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/notifications - Send email or create automation rule
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      !["super_admin", "admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body;

    // Validate that type is provided
    if (!type || !["automation", "email"].includes(type)) {
      return NextResponse.json(
        {
          error:
            "Invalid or missing 'type' field. Must be 'automation' or 'email'",
        },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();

    if (type === "automation") {
      // Create automation rule
      const validation = createAutomationRuleSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.issues,
          },
          { status: 400 }
        );
      }

      const newRule = await NotificationAutomation.addRule(AppDataSource, {
        name: validation.data.name,
        trigger: validation.data.trigger,
        conditions: validation.data.conditions,
        template: validation.data.template,
        isActive: true,
      });

      return NextResponse.json({
        success: true,
        message: "Automation rule created successfully",
        data: newRule,
      });
    } else {
      // Handle email sending (type === "email")
      const validation = sendEmailSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: "Validation failed",
            details: validation.error.issues,
          },
          { status: 400 }
        );
      }

      const {
        recipientEmails,
        subject,
        body: emailBody,
        recipientRole,
      } = validation.data;

      // Determine final recipient emails
      let finalRecipientEmails: string[] = [];

      if (recipientRole) {
        const userRepository = AppDataSource.getRepository(User);

        if (recipientRole === "all") {
          // Get all users
          const users = await userRepository.find({
            select: ["email"],
          });
          finalRecipientEmails = users.map((u) => u.email);
        } else {
          // Get users with specific role
          const users = await userRepository.find({
            where: { role: recipientRole },
            select: ["email"],
          });
          finalRecipientEmails = users.map((u) => u.email);
        }
      } else if (recipientEmails) {
        // Use provided recipient emails
        finalRecipientEmails = recipientEmails;
      }

      // Send emails
      if (finalRecipientEmails.length === 0) {
        return NextResponse.json(
          { error: "No recipients found for the specified criteria" },
          { status: 400 }
        );
      }

      const notificationRepo = AppDataSource.getRepository(Notification);

      const results = [];
      for (const email of finalRecipientEmails) {
        try {
          await sendEmail({
            to: email,
            subject,
            html: emailBody,
          });

          const notification = notificationRepo.create({
            type: "email",
            title: subject,
            content: emailBody,
            recipientEmail: email,
            recipientRole: recipientRole || undefined,
            sentAt: new Date(),
            status: "sent",
          });

          await notificationRepo.save(notification);

          results.push({
            email,
            status: "sent",
            notificationId: notification.id,
          });
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);

          const notification = notificationRepo.create({
            type: "email",
            title: subject,
            content: emailBody,
            recipientEmail: email,
            recipientRole: recipientRole || undefined,
            status: "failed",
            errorMessage:
              error instanceof Error ? error.message : "Unknown error",
          });

          await notificationRepo.save(notification);

          results.push({
            email,
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Email sending completed. ${
          results.filter((r) => r.status === "sent").length
        } sent, ${results.filter((r) => r.status === "failed").length} failed.`,
        data: results,
      });
    }
  } catch (error) {
    console.error("Error in notifications POST:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/notifications - Update automation rule
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      !["super_admin", "admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;
    const AppDataSource = await getDataSource();

    const existingRule = await NotificationAutomation.getRuleById(
      AppDataSource,
      id
    );
    if (!existingRule) {
      return NextResponse.json(
        { error: "Automation rule not found" },
        { status: 404 }
      );
    }

    // Update the rule
    await NotificationAutomation.updateRule(AppDataSource, id, updates);

    const updatedRule = await NotificationAutomation.getRuleById(
      AppDataSource,
      id
    );
    return NextResponse.json({
      success: true,
      message: "Automation rule updated successfully",
      data: updatedRule,
    });
  } catch (error) {
    console.error("Error updating automation rule:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/notifications - Delete automation rule
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session ||
      !["super_admin", "admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json(
        { error: "Missing id or type parameter" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();

    if (type === "automation") {
      const existingRule = await NotificationAutomation.getRuleById(
        AppDataSource,
        id
      );
      if (!existingRule) {
        return NextResponse.json(
          { error: "Automation rule not found" },
          { status: 404 }
        );
      }

      await NotificationAutomation.removeRule(AppDataSource, id);

      return NextResponse.json({
        success: true,
        message: "Automation rule deleted successfully",
      });
    } else if (type === "notification") {
      const notificationRepo = AppDataSource.getRepository(Notification);

      const notification = await notificationRepo.findOne({ where: { id } });
      if (!notification) {
        return NextResponse.json(
          { error: "Notification not found" },
          { status: 404 }
        );
      }

      await notificationRepo.remove(notification);

      return NextResponse.json({
        success: true,
        message: "Notification deleted successfully",
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error deleting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}