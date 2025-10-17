import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getDataSource } from "./database";
import { User } from "../entities/User";
import { EmailCode } from "../entities/EmailCode";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { sendLoginNotificationEmail } from "./email";

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
          where: { email: (credentials.email as string).toLowerCase() },
        });

        if (user) {
          console.log("Existing user found:", {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            permissions: user.permissions,
          });

          // Send login notification email
          try {
            const loginTime = new Date().toLocaleString();
            const userAgent = "Unknown Device"; // Could be enhanced to get actual user agent
            const ipAddress = "Unknown IP"; // Could be enhanced to get actual IP

            await sendLoginNotificationEmail({
              to: user.email,
              subject: "New Login to Your O'Prep Account",
              html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>New Login Notification</title>
                  <style>
                    body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                      line-height: 1.6;
                      color: #333;
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                      background-color: #f8f9fa;
                    }
                    .container {
                      background: white;
                      border-radius: 12px;
                      padding: 40px;
                      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .alert {
                      background: #fff3cd;
                      border: 1px solid #ffeaa7;
                      border-radius: 8px;
                      padding: 20px;
                      margin: 20px 0;
                    }
                    .footer {
                      margin-top: 30px;
                      padding-top: 20px;
                      border-top: 1px solid #e9ecef;
                      font-size: 14px;
                      color: #6c757d;
                      text-align: center;
                    }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h1 style="text-align: center; color: #333; margin-bottom: 10px;">Security Alert</h1>
                    <p style="text-align: center; color: #666; margin-bottom: 30px;">New login to your O'Prep account</p>

                    <div class="alert">
                      <h3 style="margin-top: 0; color: #856404;">New Login Detected</h3>
                      <p><strong>Time:</strong> ${loginTime}</p>
                      <p><strong>Device:</strong> ${userAgent}</p>
                      <p><strong>IP Address:</strong> ${ipAddress}</p>
                    </div>

                    <p>If this was you, no action is needed. If you don't recognize this activity, please secure your account immediately by:</p>
                    <ul>
                      <li>Changing your password</li>
                      <li>Reviewing your account activity</li>
                      <li>Contacting support if needed</li>
                    </ul>

                    <p style="text-align: center; margin: 30px 0;">
                      <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/signin" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Review Account Activity</a>
                    </p>

                    <div class="footer">
                      <p>This is an automated security notification from O'Prep.</p>
                      <p>Questions? Contact us at <a href="mailto:security@prepnmcn.com" style="color: #007bff;">security@prepnmcn.com</a></p>
                      <p style="margin-top: 10px; font-size: 12px; color: #999;">
                        © 2025 O'Prep. All rights reserved.
                      </p>
                    </div>
                  </div>
                </body>
                </html>
              `,
            });
            console.log("Login notification sent to:", user.email);
          } catch (error) {
            console.error("Failed to send login notification:", error);
            // Don't fail authentication if notification fails
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions || [],
          };
        } else {
          // Return a special user object to indicate new user
          // The signIn callback will handle the redirect
          return {
            id: "new_user",
            email: credentials.email as string,
            newUser: true,
          } as any;
        }
      },
    }),
    Credentials({
      id: "profile-completed",
      credentials: {
        email: { label: "Email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const AppDataSource = await getDataSource();
        const userRepo = AppDataSource.getRepository(User);

        const user = await userRepo.findOne({
          where: { email: (credentials.email as string).toLowerCase() },
        });

        if (user) {
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            permissions: user.permissions || [],
          };
        }
        return null;
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
            permissions: user.permissions || [],
          };
        }
        return null;
      },
    }),
  ],
});
