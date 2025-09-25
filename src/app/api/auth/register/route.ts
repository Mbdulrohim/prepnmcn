import { NextRequest, NextResponse } from "next/server";
import { AppDataSource } from "../../../../lib/database";
import { User } from "../../../../entities/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  const { name, email, password, institution } = await request.json();

  // Validate institution name
  if (!institution || !/^[A-Z\s]+$/.test(institution)) {
    return NextResponse.json(
      { error: "Institution name must be in full uppercase letters." },
      { status: 400 }
    );
  }

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  const userRepo = AppDataSource.getRepository(User);

  const existingUser = await userRepo.findOne({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = userRepo.create({
    name,
    email,
    password: hashedPassword,
    institution,
  });
  await userRepo.save(user);

  return NextResponse.json({ message: "User registered successfully" });
}
