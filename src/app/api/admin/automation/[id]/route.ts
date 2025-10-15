import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { NotificationAutomation } from "@/lib/notification-automation";

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
    const AppDataSource = await getDataSource();
    const rule = await NotificationAutomation.getRuleById(AppDataSource, id);
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
    const AppDataSource = await getDataSource();
    const existingRule = await NotificationAutomation.getRuleById(
      AppDataSource,
      id
    );

    if (!existingRule) {
      return NextResponse.json(
        { message: "Automation rule not found" },
        { status: 404 }
      );
    }

    await NotificationAutomation.updateRule(AppDataSource, id, updates);

    const updatedRule = await NotificationAutomation.getRuleById(
      AppDataSource,
      id
    );
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
    const AppDataSource = await getDataSource();
    const existingRule = await NotificationAutomation.getRuleById(
      AppDataSource,
      id
    );
    if (!existingRule) {
      return NextResponse.json(
        { message: "Automation rule not found" },
        { status: 404 }
      );
    }

    await NotificationAutomation.removeRule(AppDataSource, id);
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