import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/giris",
    error: "/giris",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-posta", type: "email" },
        password: { label: "Şifre", type: "password" },
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            image: true,
            password: true,
            role: true,
            xp: true,
            level: true,
            coins: true,
            currentStreak: true,
            isActive: true,
          },
        });

        if (!user || !user.password) return null;
        if (!user.isActive) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username ?? undefined,
          image: user.image,
          role: user.role,
          xp: user.xp,
          level: user.level,
          coins: user.coins,
          currentStreak: user.currentStreak,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.username = (user as any).username;
        token.xp = (user as any).xp ?? 0;
        token.level = (user as any).level ?? 1;
        token.coins = (user as any).coins ?? 0;
        token.currentStreak = (user as any).currentStreak ?? 0;
      }

      if (trigger === "update" && session) {
        // Refresh user data from DB on session update
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            xp: true,
            level: true,
            coins: true,
            currentStreak: true,
            name: true,
            image: true,
            username: true,
          },
        });
        if (dbUser) {
          token.xp = dbUser.xp;
          token.level = dbUser.level;
          token.coins = dbUser.coins;
          token.currentStreak = dbUser.currentStreak;
          token.name = dbUser.name;
          token.picture = dbUser.image;
          token.username = dbUser.username;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.xp = token.xp as number;
        session.user.level = token.level as number;
        session.user.coins = token.coins as number;
        session.user.currentStreak = token.currentStreak as number;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser && user.id) {
        // Set username from name or email
        const username =
          user.name?.toLowerCase().replace(/\s+/g, "_") ??
          user.email?.split("@")[0] ??
          `user_${Date.now()}`;

        await db.user.update({
          where: { id: user.id },
          data: {
            username: username,
            lastLoginDate: new Date(),
          },
        });
      }

      if (user.id) {
        // Update last login and handle streak
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { lastLoginDate: true, currentStreak: true, longestStreak: true },
        });

        if (dbUser) {
          const now = new Date();
          const lastLogin = dbUser.lastLoginDate;
          let newStreak = dbUser.currentStreak;

          if (lastLogin) {
            const diffDays = Math.floor(
              (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays === 1) {
              newStreak += 1;
            } else if (diffDays > 1) {
              newStreak = 1;
            }
          } else {
            newStreak = 1;
          }

          await db.user.update({
            where: { id: user.id },
            data: {
              lastLoginDate: now,
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, dbUser.longestStreak),
            },
          });
        }
      }
    },
  },
});
