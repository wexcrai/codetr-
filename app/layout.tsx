import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | CodeTR",
    default: "CodeTR - Türkiye'nin En İyi Kod Öğrenme Platformu",
  },
  description:
    "CodeTR ile programlamayı Türkçe öğrenin. Python, JavaScript, TypeScript ve daha fazlası için interaktif dersler, zorluklar ve ödüller.",
  keywords: [
    "kodlama öğren",
    "programlama",
    "python öğren",
    "javascript öğren",
    "türkçe programlama",
    "online kodlama kursu",
    "codetr",
  ],
  authors: [{ name: "CodeTR Team" }],
  creator: "CodeTR",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "CodeTR - Türkiye'nin En İyi Kod Öğrenme Platformu",
    description:
      "CodeTR ile programlamayı Türkçe öğrenin. Eğlenceli ve interaktif derslerle kodlamayı keşfedin.",
    siteName: "CodeTR",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeTR - Türkiye'nin En İyi Kod Öğrenme Platformu",
    description: "CodeTR ile programlamayı Türkçe öğrenin.",
    creator: "@codetr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0F1E" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  color: "hsl(var(--foreground))",
                },
              }}
              richColors
            />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
