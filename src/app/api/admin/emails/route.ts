import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Email } from "@/entities/Email";
import { Like } from "typeorm";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const folder = searchParams.get("folder") || "inbox";
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const dataSource = await getDataSource();
    const emailRepo = dataSource.getRepository(Email);

    const where: any = { folder };

    if (search) {
      where.subject = Like(`%${search}%`);
      // Note: For more complex search (from, body), we'd need OR conditions
      // but TypeORM simple find options are limited.
      // For now, simple subject search.
    }

    const [emails, total] = await emailRepo.findAndCount({
      where,
      order: { receivedAt: "DESC" },
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: emails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
