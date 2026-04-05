"use client";

import { motion } from "motion/react";
import { BookOpen, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/10 px-4 text-center">
      {/* Blobs */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-primary/8 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-emerald-400/8 blur-3xl" />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-lg">
          <BookOpen size={20} className="text-white" />
        </div>
        <span className="font-headline text-lg font-extrabold text-on-surface">The Curator</span>
      </motion.div>

      {/* 404 animado */}
      <div className="relative mb-6 flex items-center justify-center">
        {["4", "0", "4"].map((digit, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 40, rotate: i === 0 ? -15 : i === 2 ? 15 : 0 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1, type: "spring", stiffness: 200, damping: 15 }}
            className="font-headline text-[120px] font-black leading-none tracking-tight sm:text-[160px]"
            style={i === 1 ? {
              background: "linear-gradient(135deg, var(--color-primary), #34d399)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            } : { color: "var(--color-on-surface)" }}
          >
            {digit}
          </motion.span>
        ))}

        {/* Estrelinhas pulsantes */}
        {[
          { x: -70, y: -50, size: 8, delay: 0.4 },
          { x: 70, y: -40, size: 6, delay: 0.6 },
          { x: -90, y: 20, size: 5, delay: 0.8 },
          { x: 100, y: 10, size: 7, delay: 0.5 },
          { x: 0, y: -70, size: 6, delay: 0.7 },
        ].map((star, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0.6, 1], scale: [0, 1.2, 0.9, 1], y: [0, -8, 0, -4, 0] }}
            transition={{ duration: 3, delay: star.delay, repeat: Infinity, repeatType: "loop" }}
            className="pointer-events-none absolute rounded-full bg-primary"
            style={{
              width: star.size,
              height: star.size,
              left: `calc(50% + ${star.x}px)`,
              top: `calc(50% + ${star.y}px)`,
            }}
          />
        ))}
      </div>

      {/* Mensagem */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mb-10 max-w-sm"
      >
        <h2 className="font-headline text-2xl font-extrabold text-on-surface">
          Página não encontrada
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">
          Parece que essa página foi para uma trilha diferente. Volte para o início e continue seus estudos.
        </p>
      </motion.div>

      {/* Botões */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <Link
          href="/home"
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-95"
        >
          <Home size={16} />
          Ir para o Início
        </Link>
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white px-6 py-3 text-sm font-bold text-gray-600 shadow-sm transition hover:bg-gray-50 active:scale-95"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      </motion.div>
    </div>
  );
}
