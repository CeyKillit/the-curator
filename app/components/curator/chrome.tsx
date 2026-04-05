"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  Bell,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  Flame,
  LayoutDashboard,
  Library,
  Loader2,
  Send,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAIResponse } from "@/lib/gemini";
import { useCurator } from "@/app/contexts/curator-context";
import type { Notification, Screen } from "./types";

export const Toast = ({
  notifications,
  remove,
}: {
  notifications: Notification[];
  remove: (id: string) => void;
}) => (
  <div className="pointer-events-none fixed inset-x-4 top-20 z-[100] flex flex-col gap-3 sm:left-auto sm:right-6 sm:w-full sm:max-w-sm">
    <AnimatePresence>
      {notifications.map((notification) => (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.9 }}
          className={cn(
            "pointer-events-auto w-full rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:min-w-[280px] sm:max-w-sm",
            notification.type === "success"
              ? "border-emerald-100 bg-emerald-50/90"
              : "border-black/5 bg-white/90"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div
                className={cn(
                  "rounded-xl p-2",
                  notification.type === "success"
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-primary/10 text-primary"
                )}
              >
                {notification.type === "success" ? <CheckCircle2 size={18} /> : <Bell size={18} />}
              </div>
              <div>
                <h4 className="font-headline text-sm font-bold">{notification.title}</h4>
                <p className="mt-1 text-xs text-gray-500">{notification.message}</p>
              </div>
            </div>
            <button
              onClick={() => remove(notification.id)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

export const AIChatModal = ({
  isOpen,
  onClose,
  context,
}: {
  isOpen: boolean;
  onClose: () => void;
  context?: string;
}) => {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    const prompt = context ? `Contexto: ${context}\n\nPergunta: ${userMessage}` : userMessage;
    const response = await getAIResponse(prompt);

    setMessages((prev) => [...prev, { role: "ai", text: response }]);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/20 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex h-[85dvh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:h-[600px] sm:max-w-lg sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-black/5 bg-primary/5 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-emerald-600 shadow-lg">
              <Sparkles size={20} className="fill-white text-white" />
            </div>
            <div>
              <h3 className="font-headline font-bold">Tutor de IA</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">Online</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-black/5">
            <X size={20} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-gray-50/50 p-4 sm:p-6">
          {messages.length === 0 && (
            <div className="space-y-4 py-10 text-center sm:py-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/5">
                <BrainCircuit size={32} className="text-primary" />
              </div>
              <p className="mx-auto max-w-xs text-sm text-gray-500">
                Ola! Sou seu assistente academico. Como posso ajudar com seus estudos hoje?
              </p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm sm:max-w-[80%]",
                  message.role === "user"
                    ? "rounded-tr-none bg-primary text-white"
                    : "rounded-tl-none border border-black/5 bg-white text-gray-800"
                )}
              >
                {message.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-black/5 bg-white p-4">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-xs text-gray-400">Curator esta pensando...</span>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-black/5 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSend()}
              placeholder="Digite sua duvida..."
              className="flex-1 rounded-xl border-none bg-gray-50 px-4 py-3 text-sm transition-all focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white transition-colors hover:bg-primary-container disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const BottomNav = ({
  active,
  onChange,
}: {
  active: Screen;
  onChange: (screen: Screen) => void;
}) => {
  const items: Array<{
    id: Screen;
    label: string;
    icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
    emphasis?: boolean;
  }> = [
    { id: "dashboard", label: "Inicio", icon: LayoutDashboard },
    { id: "plan", label: "Trilhas", icon: Calendar },
    { id: "study", label: "Estudar", icon: Star, emphasis: true },
    { id: "review", label: "Revisao", icon: Library },
    { id: "profile", label: "Perfil", icon: BarChart3 },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around rounded-t-3xl border-t border-black/5 bg-white/85 px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl backdrop-blur-xl sm:px-4 md:left-1/2 md:max-w-2xl md:-translate-x-1/2 lg:max-w-3xl">
      {items.map((item) => {
        const isActive = active === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 transition-all duration-300",
              isActive ? "text-primary" : "text-gray-400 opacity-70 hover:opacity-100",
              item.emphasis && "relative -mt-5"
            )}
          >
            <div
              className={cn(
                "rounded-xl p-2 transition-all",
                isActive && "bg-primary/10",
                item.emphasis &&
                  "rounded-2xl bg-gradient-to-br from-primary to-primary-container p-3 text-white shadow-xl",
                item.emphasis && isActive && "bg-none text-white"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                item.emphasis && "text-primary opacity-100"
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export const Header = () => {
  const { user } = useCurator();
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between bg-surface/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-emerald-600 text-xs font-black text-white shadow-sm">
          TC
        </div>
        <span className="font-headline truncate text-lg font-black tracking-tighter text-primary sm:text-xl">
          The Curator
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1">
          <span className="text-sm">🪙</span>
          <span className="font-headline text-[11px] font-bold text-amber-700 sm:text-xs">
            {user?.coins ?? 0}
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1">
          <Flame size={14} className="fill-orange-500 text-orange-500" />
          <span className="font-headline text-[11px] font-bold text-primary sm:text-xs">
            {user?.streak ?? 0} dias
          </span>
          <span className="text-[10px] text-gray-400">•</span>
          <span className="font-headline text-[11px] font-bold text-primary sm:text-xs">
            {user?.xp ?? 0} XP
          </span>
        </div>
      </div>
    </header>
  );
};
