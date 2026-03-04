import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../lib/auth";
import { getDataSource } from "../../../../../lib/database";
import { Resource } from "../../../../../entities/Resource";
import { In } from "typeorm";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (
    !session ||
    !["admin", "super_admin"].includes((session.user as any)?.role)
  ) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { resourceIds, isHidden } = body as {
      resourceIds: number[];
      isHidden: boolean;
    };

    if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
      return NextResponse.json(
        { message: "resourceIds must be a non-empty array" },
        { status: 400 }
      );
    }

    if (typeof isHidden !== "boolean") {
      return NextResponse.json(
        { message: "isHidden must be a boolean" },
        { status: 400 }
      );
    }

    const AppDataSource = await getDataSource();
    const resourceRepo = AppDataSource.getRepository(Resource);

    const result = await resourceRepo.update(
      { id: In(resourceIds) },
      { isHidden }
    );

    return NextResponse.json({
      message: `${result.affected || 0} resource(s) ${isHidden ? "hidden" : "unhidden"} successfully`,
      affected: result.affected || 0,
    });
  } catch (error) {
    console.error("Error bulk updating resource visibility:", error);
    return NextResponse.json(
      { message: "Failed to update resource visibility" },
      { status: 500 }
    );
  }
}
