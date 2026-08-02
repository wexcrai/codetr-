"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card max-w-md w-full p-10 text-center space-y-6"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center"
        >
          <AlertTriangle className="h-16 w-16 text-orange-400" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Bir Hata Oluştu
          </h1>
          <p className="text-muted-foreground">
            Üzgünüz, beklenmedik bir hata meydana geldi. Lütfen tekrar deneyin.
          </p>
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-red-400 font-mono mt-2 p-2 bg-red-500/10 rounded-lg">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gradient-bg gap-2">
            <RefreshCcw className="h-4 w-4" />
            Tekrar Dene
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="gap-2">
              <Home className="h-4 w-4" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
