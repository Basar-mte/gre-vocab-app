import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible slice of the NextAuth config, used directly by
 * `middleware.ts`. Deliberately has NO providers here — the Credentials
 * provider pulls in bcryptjs + Prisma, which are Node-only and blow past
 * Vercel's Edge Function size limit if bundled into middleware.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: "ADMIN" | "STUDENT" }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "STUDENT";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
