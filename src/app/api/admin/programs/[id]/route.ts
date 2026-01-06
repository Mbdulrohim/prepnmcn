import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
// Using auth() instead

import { getDataSource } from "@/lib/database";
import { Program } from "@/entities/Program";
import { isSuperAdmin, canManageProgram } from "@/lib/programPermissions";

// PATCH /api/admin/programs/[id] - Update program
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: programId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user can manage this program
    const canManage = await canManageProgram(session.user.id, programId);
    if (!canManage) {
      return NextResponse.json(
        { error: "You don't have permission to manage this program" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, description, price, durationMonths, isActive, metadata } =
      body;

    const dataSource = await getDataSource();
    const programRepo = dataSource.getRepository(Program);

    const program = await programRepo.findOne({ where: { id: programId } });
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Update fields
    if (name !== undefined) program.name = name;
    if (description !== undefined) program.description = description;
    if (price !== undefined) program.price = price;
    if (durationMonths !== undefined) program.durationMonths = durationMonths;
    if (isActive !== undefined) program.isActive = isActive;
    if (metadata !== undefined) program.metadata = metadata;

    await programRepo.save(program);

    return NextResponse.json({
      success: true,
      program,
      message: "Program updated successfully",
    });
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/programs/[id] - Delete program (super admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: programId } = await params;
    const session = await auth();

    const dataSource = await getDataSource();
    const programRepo = dataSource.getRepository(Program);

    const program = await programRepo.findOne({ where: { id: programId } });
    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    // Soft delete - just mark as inactive
    program.isActive = false;
    await programRepo.save(program);

    return NextResponse.json({
      success: true,
      message: "Program deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}
