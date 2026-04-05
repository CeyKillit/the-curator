import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Curator",
  description: "A premium academic workspace and AI-powered study assistant.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-[#f7f9fb] text-[#191c1e]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
