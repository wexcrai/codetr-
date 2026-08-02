import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta gerekli")
    .email("Geçerli bir e-posta giriniz"),
  password: z
    .string()
    .min(1, "Şifre gerekli")
    .min(6, "Şifre en az 6 karakter olmalıdır"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Ad en az 2 karakter olmalıdır")
      .max(50, "Ad en fazla 50 karakter olabilir"),
    email: z
      .string()
      .min(1, "E-posta gerekli")
      .email("Geçerli bir e-posta giriniz"),
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .max(100, "Şifre çok uzun")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "E-posta gerekli")
    .email("Geçerli bir e-posta giriniz"),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Şifre en az 8 karakter olmalıdır")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  username: z
    .string()
    .min(3, "Kullanıcı adı en az 3 karakter olmalıdır")
    .max(30, "Kullanıcı adı en fazla 30 karakter olabilir")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Kullanıcı adı yalnızca harf, rakam ve alt çizgi içerebilir"
    ),
  bio: z.string().max(200, "Biyografi en fazla 200 karakter olabilir").optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
