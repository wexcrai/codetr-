"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { toast } from "sonner";
import { Loader2, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
// @ts-ignore - Assumption: these actions exist or will be created
import { loginUser } from "@/lib/actions/auth";
import { signIn } from "next-auth/react";

const loginSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
  password: z.string().min(1, { message: "Şifre zorunludur" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await loginUser(data.email, data.password, "/panel");
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Başarıyla giriş yapıldı!");
        router.push("/panel");
        router.refresh();
      }
    } catch (error) {
      toast.error("Giriş yapılırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderLogin = async (provider: 'github' | 'google' | 'discord') => {
    if (provider === 'github') setIsGithubLoading(true);
    if (provider === 'google') setIsGoogleLoading(true);
    if (provider === 'discord') setIsDiscordLoading(true);
    
    try {
      await signIn(provider, { callbackUrl: "/panel" });
    } catch (error) {
      toast.error(`${provider} ile giriş yapılamadı.`);
      setIsGithubLoading(false);
      setIsGoogleLoading(false);
      setIsDiscordLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl bg-slate-900/80 backdrop-blur-xl w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">CodeTR'ye Tekrar Hoş Geldiniz</h2>
        <p className="text-slate-400 text-sm">Gelişiminize kaldığınız yerden devam edin.</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <button
          type="button"
          onClick={() => handleProviderLogin('github')}
          disabled={isGithubLoading}
          className="flex justify-center items-center py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-colors"
        >
          {isGithubLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleProviderLogin('google')}
          disabled={isGoogleLoading}
          className="flex justify-center items-center py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-colors"
        >
          {isGoogleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleProviderLogin('discord')}
          disabled={isDiscordLoading}
          className="flex justify-center items-center py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white transition-colors"
        >
          {isDiscordLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <svg className="w-5 h-5" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
              <path fill="#5865F2" d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c2.64-27.38-4.51-51.11-19.32-72.15ZM42.68,65.17c-5.15,0-9.38-4.66-9.38-10.37s4.16-10.37,9.38-10.37,9.41,4.67,9.38,10.37c0,5.7-4.16,10.37-9.38,10.37Zm41.74,0c-5.15,0-9.38-4.66-9.38-10.37s4.16-10.37,9.38-10.37,9.41,4.67,9.38,10.37c0,5.7-4.16,10.37-9.38,10.37Z" />
            </svg>
          )}
        </button>
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-900 px-2 text-slate-400">veya e-posta ile devam et</span>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">E-posta</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              {...form.register("email")}
              type="email"
              placeholder="ornek@email.com"
              suppressHydrationWarning
              className={cn(
                "w-full bg-slate-950/50 border rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                form.formState.errors.email ? "border-red-500" : "border-slate-800"
              )}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-red-400 text-xs mt-1">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Şifre</label>
            <Link href="/sifremi-unuttum" className="text-xs text-blue-400 hover:text-blue-300">
              Şifremi Unuttum
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              {...form.register("password")}
              type="password"
              placeholder="••••••••"
              className={cn(
                "w-full bg-slate-950/50 border rounded-lg py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all",
                form.formState.errors.password ? "border-red-500" : "border-slate-800"
              )}
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-red-400 text-xs mt-1">{form.formState.errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium flex items-center justify-center gap-2 mt-6 transition-all hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Giriş Yap"
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-8">
        Hesabın yok mu?{" "}
        <Link href="/kayit" className="text-blue-400 hover:text-blue-300 font-medium">
          Kayıt Ol
        </Link>
      </p>
    </motion.div>
  );
}
