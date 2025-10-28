import { getDataSource } from "../../../lib/database";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET() {
  try {
    const { getDataSource } = await import("../../../lib/database");
    const AppDataSource = await getDataSource();

    // Test a simple query
    const result = await AppDataSource.query("SELECT NOW()");

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      timestamp: result[0].now,
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error,
      },
      { status: 500 }
    );
  }
}
