import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PWARegister } from "./components/pwa-register";

export const viewport: Viewport = {
  themeColor: "#004ac6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "The Curator — Estudo Inteligente",
  description:
    "Plataforma de estudos com IA: trilhas personalizadas, flashcards, simulados e revisão espaçada.",
  applicationName: "The Curator",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Curator",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    title: "The Curator — Estudo Inteligente",
    description: "Plataforma de estudos com IA para concursos, vestibulares e muito mais.",
    siteName: "The Curator",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* iOS splash / PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body
        className="font-sans antialiased bg-[#f7f9fb] text-[#191c1e]"
        suppressHydrationWarning
      >
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
