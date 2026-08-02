"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema, type RegisterInput } from "@/lib/validations/auth";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

// ─── Register ────────────────────────────────────────────────────────────────

export async function registerUser(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Geçersiz veri" };
  }

  const { name, email, password } = parsed.data;

  try {
    // Check if email already exists
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "Bu e-posta adresi zaten kullanılıyor" };
    }

    // Generate unique username
    const baseUsername = name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    let username = baseUsername;
    let counter = 1;
    while (await db.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter++}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        lastLoginDate: new Date(),
        currentStreak: 1,
        longestStreak: 1,
      },
    });

    // Award first login achievement
    const firstLoginAchievement = await db.achievement.findUnique({
      where: { key: "first_login" },
    });
    if (firstLoginAchievement) {
      await db.userAchievement.create({
        data: { userId: user.id, achievementId: firstLoginAchievement.id },
      });
    }

    // Create welcome notification
    await db.notification.create({
      data: {
        userId: user.id,
        type: "SYSTEM",
        title: "CodeTR'ye Hoş Geldiniz! 🎉",
        message: "Öğrenme yolculuğunuza başlamak için bir kursa kaydolun.",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Register error:", error);
    return { error: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin." };
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string,
  callbackUrl?: string
) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl ?? "/panel",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "E-posta veya şifre hatalı" };
        default:
          return { error: "Giriş yapılırken bir hata oluştu" };
      }
    }
    throw error;
  }
}

// ─── OAuth Sign In ────────────────────────────────────────────────────────────

export async function signInWithProvider(
  provider: "github" | "google" | "discord",
  callbackUrl?: string
) {
  await signIn(provider, { redirectTo: callbackUrl ?? "/panel" });
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function logoutUser() {
  await signOut({ redirectTo: "/" });
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPassword(email: string) {
  try {
    const user = await db.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true };
    }

    // Delete existing tokens
    await db.passwordResetToken.deleteMany({ where: { email } });

    // Create new token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await db.passwordResetToken.create({
      data: { email, token, expires },
    });

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sifre-sifirla?token=${token}`;
    // await sendPasswordResetEmail(email, resetUrl);

    return { success: true };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "Bir hata oluştu. Lütfen tekrar deneyin." };
  }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPassword(token: string, newPassword: string) {
  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.used || resetToken.expires < new Date()) {
      return { error: "Geçersiz veya süresi dolmuş bağlantı" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });

    await db.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Şifre sıfırlanırken bir hata oluştu." };
  }
}
