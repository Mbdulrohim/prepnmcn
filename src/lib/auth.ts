import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDataSource } from "./database";
import { User } from "../entities/User";
import { EmailCode } from "../entities/EmailCode";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

export const runtime = "nodejs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "email-code",
      credentials: {
        email: { label: "Email" },
        code: { label: "Code" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) return null;

        const AppDataSource = await getDataSource();
        const emailCodeRepo = AppDataSource.getRepository(EmailCode);
        const userRepo = AppDataSource.getRepository(User);

        const emailCodeRecord = await emailCodeRepo.findOne({
          where: {
            email: credentials.email as string,
            code: credentials.code as string,
            used: false,
          },
          order: { createdAt: "DESC" },
        });

        if (!emailCodeRecord || new Date() > emailCodeRecord.expiresAt) {
          return null; // Invalid or expired code
        }

        emailCodeRecord.used = true;
        await emailCodeRepo.save(emailCodeRecord);

        const user = await userRepo.findOne({
          where: { email: credentials.email as string },
        });

        if (user) {
          return user;
        } else {
          throw new Error("NEW_USER");
        }
      },
    }),
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email" },
        password: { label: "Password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const AppDataSource = await getDataSource();
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({
          where: { email: credentials.email as string },
        });

        if (
          user &&
          user.password &&
          (await bcrypt.compare(credentials.password as string, user.password))
        ) {
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
        return null;
      },
    }),
  ],
});
