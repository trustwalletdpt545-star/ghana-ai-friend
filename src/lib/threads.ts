import type { UIMessage } from "ai";

export type Thread = { id: string; title: string; updatedAt: number; messages: UIMessage[] };
const KEY = "comfortable-ai-threads";

export function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}
export function saveThreads(t: Thread[]) {
  localStorage.setItem(KEY, JSON.stringify(t));
  window.dispatchEvent(new Event("threads-changed"));
}
export function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
export function upsertThread(id: string, messages: UIMessage[]) {
  const all = loadThreads();
  const first = messages.find((m) => m.role === "user");
  const text = first?.parts.map((p) => (p.type === "text" ? p.text : "")).join("") || "New chat";
  const existing = all.find((t) => t.id === id);
  const t: Thread = { id, title: text.slice(0, 40), updatedAt: Date.now(), messages };
  saveThreads(existing ? all.map((x) => (x.id === id ? t : x)) : [t, ...all]);
}

export function flagFromLocale(locale?: string) {
  const region = (locale || "").split("-")[1]?.toUpperCase() || "GH";
  if (!/^[A-Z]{2}$/.test(region)) return "🌍";
  return String.fromCodePoint(...[...region].map((c) => 127397 + c.charCodeAt(0)));
}
