import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDataSource } from "@/lib/database";
import { NotificationAutomation } from "@/lib/notification-automation";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
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

    const AppDataSource = await getDataSource();
    const rules = await NotificationAutomation.getRules(AppDataSource);
    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Error fetching automation rules:", error);
    return NextResponse.json(
      { message: "Error fetching automation rules" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const { name, trigger, conditions, template, isActive } = await req.json();

    if (!name || !trigger || !template) {
      return NextResponse.json(
        { message: "Name, trigger, and template are required" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const rule = await NotificationAutomation.addRule(AppDataSource, {
      name,
      trigger,
      conditions: conditions || {},
      template,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({
      message: "Automation rule created successfully",
      rule,
    });
  } catch (error) {
    console.error("Error creating automation rule:", error);
    return NextResponse.json(
      { message: "Error creating automation rule" },
      { status: 500 }
    );
  }
}