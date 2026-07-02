import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import { SPOTIFY_SCOPES } from "./constants";

// ─── Type Augmentation ────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      userId: string;
      spotifyId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    spotifyId?: string | null;
    spotifyData?: Record<string, unknown> | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    spotifyId?: string | null;
  }
}

// ─── NextAuth Configuration ───────────────────────────────────────
const nextAuth = NextAuth({
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: SPOTIFY_SCOPES,
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Store Spotify profile data on the user record when signing in via Spotify
      if (account?.provider === "spotify" && user?.id) {
        try {
          await db.user.update({
            where: { id: user.id },
            data: {
              spotifyId: account.providerAccountId,
              spotifyData: (profile as Record<string, unknown>) ?? null,
            },
          });
        } catch (error) {
          console.error("Failed to persist Spotify identity:", error);
          // Don't block sign-in if the update fails
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // On initial sign-in, `user` and `account` are available
      if (user) {
        token.userId = user.id;
      }

      if (account?.provider === "spotify") {
        token.spotifyId = account.providerAccountId;
      }

      // If spotifyId still missing (e.g. GitHub sign-in), try to resolve from DB
      if (!token.spotifyId && token.userId) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.userId },
            select: { spotifyId: true },
          });
          token.spotifyId = dbUser?.spotifyId ?? null;
        } catch {
          token.spotifyId = null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.userId = (token.userId as string) ?? "";
        session.user.spotifyId = (token.spotifyId as string | null) ?? null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

export const { handlers, auth, signIn, signOut } = nextAuth;
export const { GET, POST } = handlers;
