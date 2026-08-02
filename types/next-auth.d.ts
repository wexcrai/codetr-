import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      username: string;
      xp: number;
      level: number;
      coins: number;
      currentStreak: number;
    };
  }

  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    username?: string;
    xp?: number;
    level?: number;
    coins?: number;
    currentStreak?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    username?: string;
    xp?: number;
    level?: number;
    coins?: number;
    currentStreak?: number;
  }
}
