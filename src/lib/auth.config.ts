import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const publicRoutes = ["/", "/auth/signin", "/auth/register"];
      const isPublicRoute = publicRoutes.some(
        (route) => nextUrl.pathname === route
      );

      if (isPublicRoute) {
        if (
          isLoggedIn &&
          (nextUrl.pathname === "/auth/signin" ||
            nextUrl.pathname === "/auth/register")
        ) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false; // Redirect to sign-in page
      }

      return true;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token) {
        // Use data from JWT token - database queries don't work reliably in edge runtime
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
        (session.user as any).email = token.email as string;
        (session.user as any).name = token.name as string;
      }
      return session;
    },
  },
  providers: [], // Add providers with an empty array for now
};
