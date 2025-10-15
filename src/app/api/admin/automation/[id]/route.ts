import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { NotificationAutomation } = await import(
      "@/lib/notification-automation"
    );
    const rule = await NotificationAutomation.getRuleById(id);
    if (!rule) {
      return NextResponse.json(
        { message: "Automation rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("Error fetching automation rule:", error);
    return NextResponse.json(
      { message: "Error fetching automation rule" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const updates = await req.json();
    const { NotificationAutomation } = await import(
      "@/lib/notification-automation"
    );
    const existingRule = await NotificationAutomation.getRuleById(id);

    if (!existingRule) {
      return NextResponse.json(
        { message: "Automation rule not found" },
        { status: 404 }
      );
    }

    await NotificationAutomation.updateRule(id, updates);

    const updatedRule = await NotificationAutomation.getRuleById(id);
    return NextResponse.json({
      message: "Automation rule updated successfully",
      rule: updatedRule,
    });
  } catch (error) {
    console.error("Error updating automation rule:", error);
    return NextResponse.json(
      { message: "Error updating automation rule" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (
      !session ||
      !["admin", "super_admin"].includes((session.user as any)?.role)
    ) {
      return NextResponse.json(
        { message: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { NotificationAutomation } = await import(
      "@/lib/notification-automation"
    );
    const existingRule = await NotificationAutomation.getRuleById(id);
    if (!existingRule) {
      return NextResponse.json(
        { message: "Automation rule not found" },
        { status: 404 }
      );
    }

    await NotificationAutomation.removeRule(id);
    return NextResponse.json({
      message: "Automation rule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting automation rule:", error);
    return NextResponse.json(
      { message: "Error deleting automation rule" },
      { status: 500 }
    );
  }
}
