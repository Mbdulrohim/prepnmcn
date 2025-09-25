import { AppDataSource } from "../../../lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("✅ Database connected successfully!");
    }

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
