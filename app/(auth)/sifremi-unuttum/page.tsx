"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore
import { toast } from "sonner";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
// @ts-ignore
import { forgotPassword } from "@/lib/actions/auth";

const forgotSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsLoading(true);
    try {
      await forgotPassword(data.email);
      setIsSubmitted(true);
      toast.success("Bağlantı gönderildi!");
    } catch (error) {
      toast.error("İşlem sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl bg-slate-900/80 backdrop-blur-xl w-full text-center"
      >
        <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">E-postanızı Kontrol Edin</h2>
        <p className="text-slate-400 mb-8">
          Sıfırlama bağlantısı <span className="text-white font-medium">{form.getValues().email}</span> adresine gönderildi. 
          Lütfen gelen kutunuzu kontrol edin.
        </p>
        <Link 
          href="/giris" 
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Giriş sayfasına dön
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl bg-slate-900/80 backdrop-blur-xl w-full"
    >
      <div className="mb-8">
        <Link href="/giris" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Geri dön
        </Link>
        <h2 className="text-2xl font-bold text-white mb-2">Şifremi Unuttum</h2>
        <p className="text-slate-400 text-sm">
          E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">E-posta</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              {...form.register("email")}
              type="email"
              placeholder="ornek@email.com"
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Bağlantı Gönder"
          )}
        </button>
      </form>
    </motion.div>
  );
}
