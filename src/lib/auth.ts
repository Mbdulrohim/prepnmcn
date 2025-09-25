/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { AppDataSource } from './database';
import { User } from '../entities/User';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

export interface UserPayload {
  userId: string;
  email: string;
  role: string;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email' },
        password: { label: 'Password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { email: credentials.email as string } });

        if (user && await bcrypt.compare(credentials.password as string, user.password)) {
          // Check institution compliance
          if (!user.institution || !/^[A-Z\s]+$/.test(user.institution)) {
            throw new Error('Institution name must be in full uppercase letters.');
          }
          return { id: user.id.toString(), email: user.email, name: user.name, role: user.role };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.role = (user as any).role;
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) (session.user as any).role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});

export function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}
