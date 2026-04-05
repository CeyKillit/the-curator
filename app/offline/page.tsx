"use client";

import { motion } from "motion/react";
import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#f7f9fb] px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-200 to-gray-300 shadow-lg"
      >
        <WifiOff size={36} className="text-gray-500" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-2"
      >
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Sem conexão</h1>
        <p className="max-w-xs text-sm text-gray-500">
          Você está offline. Verifique sua conexão com a internet e tente novamente.
        </p>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-container active:scale-95"
      >
        <RefreshCw size={15} />
        Tentar novamente
      </motion.button>
    </div>
  );
}
