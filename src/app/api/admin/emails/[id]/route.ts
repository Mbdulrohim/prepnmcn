import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "@/lib/database";
import { Email } from "@/entities/Email";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dataSource = await getDataSource();
    const emailRepo = dataSource.getRepository(Email);

    const email = await emailRepo.findOne({
      where: { id },
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: email });
  } catch (error) {
    console.error("Error fetching email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const dataSource = await getDataSource();
    const emailRepo = dataSource.getRepository(Email);

    const email = await emailRepo.findOne({
      where: { id },
    });

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    // Update fields
    if (body.isRead !== undefined) email.isRead = body.isRead;
    if (body.isArchived !== undefined) email.isArchived = body.isArchived;
    if (body.folder !== undefined) email.folder = body.folder;

    await emailRepo.save(email);

    return NextResponse.json({ success: true, data: email });
  } catch (error) {
    console.error("Error updating email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const dataSource = await getDataSource();
    const emailRepo = dataSource.getRepository(Email);

    const result = await emailRepo.delete(id);

    if (result.affected === 0) {
      return NextResponse.json({ error: "Email not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
