import { NextRequest, NextResponse } from "next/server";
import handler from "@/lib/db-init";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET(request: NextRequest) {
  await handler();
  return NextResponse.json({ message: "Database initialized" });
}
