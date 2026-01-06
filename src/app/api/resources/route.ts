import { NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Resource } from "@/entities/Resource";
import { auth } from "@/lib/auth";
import { User } from "@/entities/User";

export const runtime = "nodejs"; // Force Node.js runtime

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const AppDataSource = await getDataSource();
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: session.user.id } });

    // Check if user has any active program enrollment
    const { getUserActiveEnrollments } = await import(
      "@/lib/enrollmentHelpers"
    );
    const activeEnrollments = await getUserActiveEnrollments(session.user.id);

    // Fallback to legacy premium check for backward compatibility
    const hasLegacyPremium =
      user?.isPremium &&
      (!user.premiumExpiresAt || new Date() <= new Date(user.premiumExpiresAt));

    if (activeEnrollments.length === 0 && !hasLegacyPremium) {
      return NextResponse.json(
        { error: "Active program enrollment required to access resources" },
        { status: 403 }
      );
    }

    const resourceRepo = AppDataSource.getRepository(Resource);

    // Support optional query params for filtering and search
    const url = new URL(request.url);
    const type = url.searchParams.get("type"); // free|paid
    const search = url.searchParams.get("search") || "";
    const programCode = url.searchParams.get("program"); // Filter by program

    const qb = resourceRepo
      .createQueryBuilder("resource")
      .leftJoinAndSelect("resource.program", "program");

    // Filter by user's enrolled programs or show free resources
    const enrolledProgramIds = activeEnrollments.map((e: any) => e.programId);

    if (enrolledProgramIds.length > 0) {
      qb.where(
        "(resource.isFree = true OR resource.programId IN (:...programIds) OR resource.isGlobal = true OR resource.programId IS NULL)",
        { programIds: enrolledProgramIds }
      );
    } else {
      // Legacy users see all resources
      qb.where("resource.isFree = true OR resource.programId IS NULL");
    }

    // Apply program filter if specified
    if (programCode && enrolledProgramIds.length > 0) {
      qb.andWhere("program.code = :programCode", { programCode });
    }

    // Apply type filter
    if (type === "free") qb.andWhere("resource.isFree = true");
    else if (type === "paid") qb.andWhere("resource.isFree = false");

    // Apply search
    if (search) {
      const like = `%${search}%`;
      qb.andWhere(
        "(resource.name ILIKE :like OR resource.contentText ILIKE :like)",
        { like }
      );
    }

    const resources = await qb
      .select([
        "resource.id",
        "resource.name",
        "resource.isFree",
        "resource.programId",
        "resource.isGlobal",
        "resource.createdAt",
        "program.id",
        "program.name",
        "program.code",
      ])
      .orderBy("resource.createdAt", "DESC")
      .getMany();

    return NextResponse.json(resources);
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { message: "Error fetching resources" },
      { status: 500 }
    );
  }
}
