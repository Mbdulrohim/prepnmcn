import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Program } from "@/entities/Program";

export const runtime = "nodejs";

// GET /api/programs - Public endpoint to list active programs
export async function GET() {
  try {
    const dataSource = await getDataSource();
    const programRepo = dataSource.getRepository(Program);

    const programs = await programRepo.find({
      where: { isActive: true },
      order: { createdAt: "ASC" },
    });

    // Sort by displayOrder from metadata
    programs.sort((a, b) => {
      const orderA = a.metadata?.displayOrder ?? 999;
      const orderB = b.metadata?.displayOrder ?? 999;
      return orderA - orderB;
    });

    return NextResponse.json({
      success: true,
      programs: programs.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        price: p.price,
        currency: p.currency,
        durationMonths: p.durationMonths,
        metadata: p.metadata,
      })),
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 },
    );
  }
}
