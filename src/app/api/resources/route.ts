import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Resource } from "@/entities/Resource";

export const runtime = 'nodejs'; // Force Node.js runtime

export async function GET() {
  try {
    const AppDataSource = await getDataSource();
    const resourceRepo = AppDataSource.getRepository(Resource);
    const resources = await resourceRepo.find({
      select: ["id", "name", "isFree", "createdAt"],
      order: { createdAt: "DESC" },
    });
    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json({ message: "Error fetching resources" }, { status: 500 });
  }
}
