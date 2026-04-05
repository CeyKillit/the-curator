"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  Bell,
  BrainCircuit,
  CheckCircle2,

  LayoutDashboard,
  Library,
  Loader2,
  Send,
  Sparkles,
  Star,
  X,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CuratorProvider, useCurator } from "@/app/contexts/curator-context";
import { useEffect, useRef, useState } from "react";
import { getAIResponse } from "@/lib/gemini";

// ---- Toast ----

function Toast() {
  const { notifications, removeNotification } = useCurator();
  return (
    <div className="pointer-events-none fixed inset-x-4 top-20 z-[100] flex flex-col gap-3 sm:left-auto sm:right-6 sm:w-full sm:max-w-sm">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={cn(
              "pointer-events-auto w-full rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:min-w-[280px] sm:max-w-sm",
              n.type === "success" ? "border-emerald-100 bg-emerald-50/90" : "border-black/5 bg-white/90"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className={cn("rounded-xl p-2", n.type === "success" ? "bg-emerald-100 text-emerald-600" : "bg-primary/10 text-primary")}>
                  {n.type === "success" ? <CheckCircle2 size={18} /> : <Bell size={18} />}
                </div>
                <div>
                  <h4 className="font-headline text-sm font-bold">{n.title}</h4>
                  <p className="mt-1 text-xs text-gray-500">{n.message}</p>
                </div>
              </div>
              <button onClick={() => removeNotification(n.id)} className="text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ---- BottomNav ----

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  emphasis?: boolean;
};

const navItems: NavItem[] = [
  { href: "/home", label: "Início", icon: LayoutDashboard },
  { href: "/trilhas", label: "Trilhas", icon: Calendar },
  { href: "/sessao", label: "Estudar", icon: Star, emphasis: true },
  { href: "/revisao", label: "Revisão", icon: Library },
  { href: "/perfil", label: "Perfil", icon: BarChart3 },
];

function BottomNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-3xl border-t border-black/5 bg-white/85 px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl backdrop-blur-xl sm:px-4 md:left-1/2 md:max-w-2xl md:-translate-x-1/2 lg:max-w-3xl">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 transition-all duration-300",
              isActive ? "text-primary" : "text-gray-400 opacity-70 hover:opacity-100",
              item.emphasis && "relative -mt-5"
            )}
          >
            <div
              className={cn(
                "rounded-xl p-2 transition-all",
                isActive && !item.emphasis && "bg-primary/10",
                item.emphasis && "rounded-2xl bg-gradient-to-br from-primary to-primary-container p-3 text-white shadow-xl"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={cn("text-[10px] font-bold uppercase tracking-widest", item.emphasis && "text-primary opacity-100")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

// ---- AI Chat Modal ----

const SUGGESTION_CHIPS = [
  "Explique o uso da crase",
  "Como calcular porcentagem?",
  "Dicas para memorizar conteúdo",
  "Monte um plano de estudos",
];

function AIChatButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMock, setIsMock] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/ai")
      .then((r) => r.json() as Promise<{ hasKey?: boolean }>)
      .then((d) => setIsMock(!d.hasKey))
      .catch(() => setIsMock(true));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (text?: string) => {
    const userMsg = text ?? input;
    if (!userMsg.trim() || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    const response = await getAIResponse(userMsg);
    setMessages((prev) => [...prev, { role: "ai", text: response }]);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-container text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 sm:bottom-28 sm:right-6 sm:h-14 sm:w-14"
      >
        <Sparkles size={28} className="fill-white" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/20 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex h-[85dvh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:h-[600px] sm:max-w-lg sm:rounded-3xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 bg-primary/5 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-emerald-600 shadow-lg">
                  <Sparkles size={20} className="fill-white text-white" />
                </div>
                <div>
                  <h3 className="font-headline font-bold">Tutor de IA</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Online</p>
                    {isMock && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700">
                        Modo demonstração
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 transition-colors hover:bg-black/5">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-gray-50/50 p-4 sm:p-6">
              {messages.length === 0 && (
                <div className="space-y-4 py-8 text-center sm:py-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
                    <BrainCircuit size={32} className="text-primary" />
                  </div>
                  <p className="mx-auto max-w-xs text-sm text-gray-500">
                    Olá! Sou seu assistente acadêmico. Como posso ajudar hoje?
                  </p>
                  {isMock && (
                    <p className="mx-auto max-w-xs text-[11px] text-amber-600">
                      Respostas de demonstração ativas. Configure GEMINI_API_KEY para IA completa.
                    </p>
                  )}
                  <div className="flex flex-wrap justify-center gap-2 px-2">
                    {SUGGESTION_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() => void handleSend(chip)}
                        className="rounded-full border border-primary/20 bg-white px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition hover:bg-primary/5 active:scale-95"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm sm:max-w-[80%]",
                    msg.role === "user" ? "rounded-tr-none bg-primary text-white" : "rounded-tl-none border border-black/5 bg-white text-gray-800"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-black/5 bg-white p-4">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="text-xs text-gray-400">Curator está pensando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-black/5 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleSend()}
                  placeholder="Digite sua dúvida..."
                  className="flex-1 rounded-xl border-none bg-gray-50 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-primary/20"
                />
                <button
                  onClick={() => void handleSend()}
                  disabled={loading || !input.trim()}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-container disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// ---- Shell interno (usa o context) ----

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <Toast />
      <main>{children}</main>
      <BottomNav />
      <AIChatButton />
    </div>
  );
}

// ---- Layout exportado ----

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <CuratorProvider>
      <AppShell>{children}</AppShell>
    </CuratorProvider>
  );
}
