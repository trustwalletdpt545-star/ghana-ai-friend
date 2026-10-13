import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { isNewsAnswer, NEWS_REFRESH_MS } from "@/lib/news";

type Options = {
  messages: UIMessage[];
  enabled: boolean;
  busy: boolean;
  fetchNews: () => Promise<{ text: string | null }>;
  setMessages: (update: (messages: UIMessage[]) => UIMessage[]) => void;
};

export function useNewsRefresh(options: Options) {
  const latest = useRef(options);
  latest.current = options;
  useEffect(() => {
    let active = true;
    let pending = false;
    const timer = setInterval(async () => {
      const state = latest.current;
      if (pending || !state.enabled || state.busy || !navigator.onLine) return;
      const ids = new Set(state.messages.filter((message) => message.role === "assistant" && isNewsAnswer(message.parts.map((part) => part.type === "text" ? part.text : "").join(""))).map((message) => message.id));
      if (!ids.size) return;
      pending = true;
      try {
        const { text } = await state.fetchNews();
        if (active && text && latest.current.enabled && !latest.current.busy && navigator.onLine) {
          latest.current.setMessages((messages) => messages.map((message) => ids.has(message.id) ? { ...message, parts: [{ type: "text", text }] } : message));
        }
      } catch { /* Retain the last verified update on temporary failure. */ }
      finally { pending = false; }
    }, NEWS_REFRESH_MS);
    return () => { active = false; clearInterval(timer); };
  }, []);
}