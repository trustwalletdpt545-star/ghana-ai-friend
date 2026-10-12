import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast, Toaster } from "sonner";
import {
  Copy, Check, ThumbsUp, ThumbsDown, RefreshCw, Mic, MicOff, ArrowUp, Square,
  Plus, Trash2, Menu, X, MessageSquare, Globe2, WifiOff,
} from "lucide-react";
import { loadThreads, saveThreads, upsertThread, newId, flagFromLocale, type Thread } from "@/lib/threads";
import { offlineAnswer } from "@/lib/offline";
import { needsLive } from "@/lib/liveData";

function LiveClock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Accra" }));
    f();
    const i = setInterval(f, 1000);
    return () => clearInterval(i);
  }, []);
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
      <span className="live-dot" /> LIVE • Accra: <span className="tabular-nums">{t || "--:--:--"}</span> • GMT
    </span>
  );
}

function useLiveSetting() {
  const [on, setOn] = useState(true);
  useEffect(() => { setOn(localStorage.getItem("cai-live") !== "off"); }, []);
  const set = (v: boolean) => { setOn(v); localStorage.setItem("cai-live", v ? "on" : "off"); window.dispatchEvent(new Event("live-changed")); };
  return [on, set] as const;
}

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Chat — Comfortable AI 🌍" },
      { name: "description", content: "Chat with Comfortable AI: answers in English, Twi, Ga, Ewe and French." },
      { property: "og:title", content: "Chat — Comfortable AI 🌍" },
      { property: "og:description", content: "Ask me anything — built in Ghana for the World." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

const LANGS = ["auto", "English", "Twi", "Ga", "Ewe", "French"];
const EXAMPLES = [
  { e: "🩺", t: "Explain nursing in Twi" },
  { e: "🍛", t: "How to cook jollof?" },
  { e: "➗", t: "Teach me math" },
  { e: "🇬🇭", t: "What's happening in Ghana?" },
  { e: "📄", t: "Write CV for me" },
];

function ChatPage() {
  const { threadId } = Route.useParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loaded, setLoaded] = useState<UIMessage[] | null>(null);
  const [sidebar, setSidebar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const sync = () => setThreads(loadThreads().sort((a, b) => b.updatedAt - a.updatedAt));
    sync();
    window.addEventListener("threads-changed", sync);
    return () => window.removeEventListener("threads-changed", sync);
  }, []);
  useEffect(() => {
    setLoaded(loadThreads().find((t) => t.id === threadId)?.messages ?? []);
    setSidebar(false);
  }, [threadId]);

  const newChat = () => navigate({ to: "/chat/$threadId", params: { threadId: newId() } });
  const clearAll = () => {
    if (!confirm("Clear all chat history?")) return;
    saveThreads([]);
    newChat();
  };
  const remove = (id: string) => {
    saveThreads(loadThreads().filter((t) => t.id !== id));
    if (id === threadId) newChat();
  };

  return (
    <div className="flex h-dvh bg-background text-foreground">
      <Toaster theme="dark" position="top-center" />
      {sidebar && <div className="fixed inset-0 z-30 bg-background/70 md:hidden" onClick={() => setSidebar(false)} />}
      <aside className={`fixed z-40 flex h-full w-72 flex-col border-r border-border bg-sidebar transition-transform md:static md:translate-x-0 ${sidebar ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-3">
          <span className="font-display text-lg font-bold">Comfortable <span className="text-gradient-gh">AI</span></span>
          <button className="md:hidden p-1" onClick={() => setSidebar(false)} aria-label="Close menu"><X className="size-5" /></button>
        </div>
        <button onClick={newChat} className="mx-3 flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent">
          <Plus className="size-4" /> New Chat
        </button>
        <p className="px-4 pt-5 pb-2 text-xs uppercase tracking-wider text-muted-foreground">Chat History</p>
        <nav className="flex-1 overflow-y-auto px-2">
          {threads.length === 0 && <p className="px-2 text-sm text-muted-foreground">No chats yet</p>}
          {threads.map((t) => (
            <div key={t.id} className={`group flex items-center rounded-lg ${t.id === threadId ? "bg-sidebar-accent" : "hover:bg-sidebar-accent/60"}`}>
              <Link to="/chat/$threadId" params={{ threadId: t.id }} className="flex flex-1 items-center gap-2 truncate px-2 py-2 text-sm">
                <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{t.title}</span>
              </Link>
              <button onClick={() => remove(t.id)} className="p-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive" aria-label="Delete chat">
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </nav>
        <LiveSettings />
        <button onClick={clearAll} className="m-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-destructive">
          <Trash2 className="size-4" /> Clear history
        </button>
        <div className="kente-bar h-1" />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-border px-3 py-3">
          <button className="md:hidden p-1" onClick={() => setSidebar(true)} aria-label="Open menu"><Menu className="size-5" /></button>
          <h1 className="font-display truncate text-base font-semibold md:text-lg">
            Comfortable AI 🌍 <span className="text-muted-foreground font-normal hidden sm:inline">— Ask Me Anything International</span>
          </h1>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="hidden lg:inline rounded-full border border-border px-2 py-1 text-xs">🌍 International Live</span>
            <span className="hidden lg:inline rounded-full border border-border px-2 py-1 text-xs">📰 Live News</span>
            <LiveClock />
          </div>
        </header>
        {loaded && <ChatWindow key={threadId} threadId={threadId} initial={loaded} />}
      </main>
    </div>
  );
}

function textOf(m: UIMessage) {
  return m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
}

function ChatWindow({ threadId, initial }: { threadId: string; initial: UIMessage[] }) {
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("auto");
  const [flag, setFlag] = useState("🌍");
  const [listening, setListening] = useState(false);
  const [online, setOnline] = useState(true);
  const [searching, setSearching] = useState(false);
  const recRef = useRef<any>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const langRef = useRef(lang);
  langRef.current = lang;

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: () => ({ conversationId: threadId, language: langRef.current, live: localStorage.getItem("cai-live") !== "off", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }) }),
    [threadId],
  );
  const { messages, sendMessage, status, stop, regenerate, setMessages } = useChat({
    id: threadId,
    messages: initial,
    transport,
    onError: (e) => {
      const msg = e.message || "";
      if (msg.includes("429")) toast.error("Too many requests — please wait a moment.");
      else if (msg.includes("402")) toast.error("AI credits are used up for now.");
      else toast.error("Couldn't reach the AI. Showing an offline answer.");
      setMessages((ms) => {
        const lastUser = [...ms].reverse().find((m) => m.role === "user");
        return [...ms, { id: newId(), role: "assistant", parts: [{ type: "text", text: offlineAnswer(lastUser ? textOf(lastUser) : "") }] }];
      });
    },
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    setFlag(flagFromLocale(navigator.language));
    setOnline(navigator.onLine);
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    taRef.current?.focus();
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  useEffect(() => {
    if (status === "ready" || status === "error") {
      if (messages.length) upsertThread(threadId, messages);
      taRef.current?.focus();
    }
  }, [status, messages, threadId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, status]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setInput("");
    if (!navigator.onLine) {
      const ms: UIMessage[] = [
        ...messages,
        { id: newId(), role: "user", parts: [{ type: "text", text: t }] },
        { id: newId(), role: "assistant", parts: [{ type: "text", text: offlineAnswer(t) }] },
      ];
      setMessages(ms);
      upsertThread(threadId, ms);
      return;
    }
    setSearching(localStorage.getItem("cai-live") !== "off" && needsLive(t));
    sendMessage({ text: t });
  };

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Voice input isn't supported in this browser. Try Chrome."); return; }
    if (listening) { recRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = lang === "French" ? "fr-FR" : navigator.language || "en-GH";
    rec.interimResults = true;
    rec.onresult = (e: any) => setInput(Array.from(e.results).map((r: any) => r[0].transcript).join(""));
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center px-4 text-center">
            <div className="glow-orb mb-6 grid size-16 place-items-center rounded-2xl text-3xl">🌍</div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Akwaaba! <span className="text-gradient-gh">Ask me anything.</span></h2>
            <p className="mt-3 text-muted-foreground">Nursing, school, Ghana, coding, health, jokes — in English, Twi, Ga, Ewe or French.</p>
            <div className="mt-8 grid w-full gap-2 sm:grid-cols-2">
              {EXAMPLES.map((x) => (
                <button key={x.t} onClick={() => send(x.t)} className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition hover:border-primary/60 hover:bg-secondary">
                  <span className="mr-2">{x.e}</span>{x.t}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {messages.map((m, i) => (
              <Bubble key={m.id} m={m} flag={flag} isLast={i === messages.length - 1} busy={busy} onRegenerate={() => regenerate()} />
            ))}
            {status === "submitted" && (
              <div className="flex gap-3"><Avatar />{searching ? <p className="animate-pulse pt-1.5 text-sm text-accent">🔍 Searching live international web…</p> : <div className="typing flex gap-1 pt-3"><span /><span /><span /></div>}</div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div className="px-3 pb-2">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-2 shadow-composer">
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            rows={1}
            placeholder={listening ? "Listening…" : "Message Comfortable AI…"}
            className="max-h-40 w-full resize-none bg-transparent px-2 py-2 outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-muted-foreground">
              <Globe2 className="size-3.5" />
              <select value={lang} onChange={(e) => setLang(e.target.value)} className="bg-transparent outline-none text-foreground" aria-label="Answer language">
                {LANGS.map((l) => <option key={l} value={l} className="bg-card">{l === "auto" ? "Auto-detect" : l}</option>)}
              </select>
            </label>
            {!online && <span className="flex items-center gap-1 text-xs text-accent"><WifiOff className="size-3.5" />Offline mode</span>}
            <div className="ml-auto flex gap-1.5">
              <button type="button" onClick={toggleMic} aria-label="Voice input" className={`grid size-9 place-items-center rounded-full ${listening ? "bg-destructive text-destructive-foreground animate-pulse" : "hover:bg-secondary text-muted-foreground"}`}>
                {listening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>
              {busy ? (
                <button type="button" onClick={() => stop()} aria-label="Stop" className="grid size-9 place-items-center rounded-full bg-foreground text-background"><Square className="size-3.5 fill-current" /></button>
              ) : (
                <button type="submit" disabled={!input.trim()} aria-label="Send" className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"><ArrowUp className="size-4" /></button>
              )}
            </div>
          </div>
        </form>
        <p className="mt-2 text-center text-xs text-muted-foreground">Live international data • Updates every second • Built in Ghana for the World 🇬🇭🌍 — nursecare-gh + comfortable-ai</p>
      </div>
    </>
  );
}

function Avatar() {
  return <div className="glow-orb grid size-8 shrink-0 place-items-center rounded-lg text-sm">🌍</div>;
}

function Bubble({ m, flag, isLast, busy, onRegenerate }: { m: UIMessage; flag: string; isLast: boolean; busy: boolean; onRegenerate: () => void }) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const text = textOf(m);
  if (m.role === "user") {
    return (
      <div className="flex justify-end gap-2">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-secondary px-4 py-2.5">{text}</div>
        <span className="pt-2 text-lg" title="Your location">{flag}</span>
      </div>
    );
  }
  const reasoning = m.parts.filter((p) => p.type === "reasoning").map((p: any) => p.text).join("");
  return (
    <div className="flex gap-3">
      <Avatar />
      <div className="min-w-0 flex-1">
        {reasoning && !text && <p className="mb-2 text-sm italic text-muted-foreground line-clamp-3">Thinking… {reasoning}</p>}
        <div className="prose-chat"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown></div>
        {!(isLast && busy) && text && (
          <div className="mt-2 flex gap-1 text-muted-foreground">
            <IconBtn label="Copy" onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </IconBtn>
            <IconBtn label="Good answer" active={vote === "up"} onClick={() => { setVote("up"); toast.success("Thanks for the feedback! Medaase 🙏"); }}><ThumbsUp className="size-4" /></IconBtn>
            <IconBtn label="Bad answer" active={vote === "down"} onClick={() => { setVote("down"); toast("Thanks — we'll do better."); }}><ThumbsDown className="size-4" /></IconBtn>
            {isLast && <IconBtn label="Regenerate" onClick={onRegenerate}><RefreshCw className="size-4" /></IconBtn>}
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={`rounded-md p-1.5 hover:bg-secondary hover:text-foreground ${active ? "text-primary" : ""}`}>
      {children}
    </button>
  );
}

function LiveSettings() {
  const [on, set] = useLiveSetting();
  return (
    <div className="mx-3 mt-2 rounded-xl border border-border p-3 text-xs">
      <p className="mb-2 font-semibold uppercase tracking-wider text-muted-foreground">Settings</p>
      <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
        Enable Live International Search
        <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="size-4 accent-[var(--primary)]" />
      </label>
      <p className="mt-2 text-muted-foreground">Free sources: Google News, DuckDuckGo, Wikipedia, wttr.in weather — no key needed.</p>
    </div>
  );
}
