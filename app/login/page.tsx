"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Eye, EyeOff, Loader2, Mail, Lock, User, Sparkles, AlertCircle } from "lucide-react";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type Tab = "login" | "register";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createBrowserSupabase();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (tab === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/home";
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        });
        if (error) throw error;
        setSuccess("Cadastro realizado! Verifique seu e-mail para confirmar a conta.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ocorreu um erro.";
      if (msg.includes("Invalid login credentials")) {
        setError("E-mail ou senha incorretos.");
      } else if (msg.includes("User already registered")) {
        setError("Este e-mail já está cadastrado. Faça login.");
      } else if (msg.includes("Password should be at least")) {
        setError("A senha deve ter pelo menos 6 caracteres.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError("Falha ao conectar com o Google. Tente novamente.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-white to-primary/10 p-4">
      {/* Blobs decorativos */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-primary-container shadow-xl shadow-primary/20">
            <BookOpen size={32} className="text-white" />
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">The Curator</h1>
          <p className="mt-1 text-sm text-gray-500">Sua plataforma de estudos inteligente</p>
        </div>

        {/* Card principal */}
        <div className="overflow-hidden rounded-3xl border border-black/5 bg-white shadow-2xl shadow-black/5">
          {/* Tabs */}
          <div className="flex border-b border-black/5">
            {(["login", "register"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null); setSuccess(null); }}
                className={cn(
                  "flex-1 py-4 text-sm font-bold transition-colors",
                  tab === t
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-400 hover:text-gray-600"
                )}
              >
                {t === "login" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {/* Google */}
            <button
              onClick={() => void handleGoogle()}
              disabled={googleLoading || loading}
              className="mb-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md active:scale-[0.98] disabled:opacity-60"
            >
              {googleLoading ? <Loader2 size={20} className="animate-spin" /> : <GoogleIcon />}
              {googleLoading ? "Redirecionando..." : "Continuar com Google"}
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/8" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  ou
                </span>
              </div>
            </div>

            {/* Formulário */}
            <form onSubmit={(e) => void handleEmailAuth(e)} className="space-y-4">
              <AnimatePresence mode="wait">
                {tab === "register" && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        required={tab === "register"}
                        className="w-full rounded-2xl border border-black/10 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full rounded-2xl border border-black/10 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/10"
                />
              </div>

              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha"
                  required
                  className="w-full rounded-2xl border border-black/10 bg-gray-50 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Error / Success */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3"
                  >
                    <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-500" />
                    <p className="text-sm text-rose-700">{error}</p>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3"
                  >
                    <Sparkles size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                    <p className="text-sm text-emerald-700">{success}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-container py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Aguarde...</>
                ) : tab === "login" ? (
                  "Entrar"
                ) : (
                  "Criar conta"
                )}
              </button>
            </form>

            {tab === "login" && (
              <p className="mt-4 text-center text-xs text-gray-400">
                Não tem conta?{" "}
                <button
                  onClick={() => setTab("register")}
                  className="font-bold text-primary hover:underline"
                >
                  Cadastre-se
                </button>
              </p>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-gray-400">
          Ao continuar, você concorda com nossos termos de uso.
        </p>
      </motion.div>
    </div>
  );
}
