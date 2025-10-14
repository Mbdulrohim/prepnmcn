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
        // Don't create token for new users (they need to complete profile first)
        if ((user as any).newUser) {
          console.log("Skipping JWT creation for new user");
          return token;
        }
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
    signIn: async ({ user, account, profile }) => {
      // Handle NEW_USER case from email-code provider
      if (account?.provider === "email-code" && user && (user as any).newUser) {
        // This is a new user, don't complete signin yet
        // The signin page will handle redirecting to profile completion
        return (
          "/auth/signin?new_user=true&email=" +
          encodeURIComponent(user.email || "")
        );
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
};
