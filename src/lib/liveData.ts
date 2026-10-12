// Server-side live data helpers (free sources, no API keys).
const UA = { "User-Agent": "ComfortableAI/1.0 (https://comfortable-ai)" };

async function getJson(url: string, ms = 5000) {
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(String(r.status));
  return r.json();
}

export const getLiveTime = (tz?: string) => {
  const now = new Date();
  const opts: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
  let userLocal = "";
  try { userLocal = tz ? now.toLocaleString("en-GB", { ...opts, timeZone: tz }) : ""; } catch { /* bad tz */ }
  return { ghana: now.toLocaleString("en-GB", { ...opts, timeZone: "Africa/Accra" }), utc: now.toUTCString(), userLocal, timezone: tz || "unknown" };
};

const LIVE_KEYS = ["today","now","latest","current","news","weather","price","score","who is","president","election","war","football","bitcoin","crypto","stock","2026","2025","this week","breaking","live","happening","accra","ghana","nigeria","usa","uk","china","black stars","time"];
export const needsLive = (q: string) => LIVE_KEYS.some((k) => q.toLowerCase().includes(k));

async function googleNews(query: string) {
  const ghana = /ghana|accra|kumasi/i.test(query);
  const q = query.replace(/what'?s happening|news|today|latest|in|\?/gi, " ").trim();
  const url = q.length > 2
    ? `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-GH&gl=GH&ceid=GH:en`
    : `https://news.google.com/rss?hl=en-${ghana ? "GH&gl=GH&ceid=GH:en" : "US&gl=US&ceid=US:en"}`;
  const r = await fetch(url, { headers: UA, signal: AbortSignal.timeout(5000) });
  const xml = await r.text();
  const items = [...xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>/g)].slice(0, 6);
  return items.map((m) => `• ${(m[1] ?? "").replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')} (${m[2]})`).join("\n");
}

export async function liveSearchInternational(query: string) {
  const tasks: Promise<string | null>[] = [
    googleNews(query).then((t) => (t ? `Latest headlines (Google News):\n${t}` : null)).catch(() => null),
    getJson(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`)
      .then((d) => [d.AbstractText, d.RelatedTopics?.[0]?.Text].filter(Boolean).join("\n") ? `DuckDuckGo: ${[d.AbstractText, d.RelatedTopics?.[0]?.Text].filter(Boolean).join("\n")}` : null)
      .catch(() => null),
    getJson(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=2`)
      .then((w) => w.query?.search?.length ? `Wikipedia: ${w.query.search.map((s: any) => `${s.title} — ${s.snippet.replace(/<[^>]*>/g, "")}`).join("\n")}` : null)
      .catch(() => null),
  ];
  if (/tech|\bai\b|software|startup/i.test(query))
    tasks.push(getJson(`https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story`)
      .then((h) => h.hits?.length ? `Tech news: ${h.hits.slice(0, 3).map((x: any) => x.title).join(" | ")}` : null).catch(() => null));
  if (/bitcoin|crypto|btc|ethereum/i.test(query))
    tasks.push(getJson("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd,ghs")
      .then((c) => `Crypto prices: BTC $${c.bitcoin.usd} (GH₵${c.bitcoin.ghs}), ETH $${c.ethereum.usd} (GH₵${c.ethereum.ghs})`).catch(() => null));
  const out = (await Promise.all(tasks)).filter(Boolean);
  return out.join("\n\n") || null;
}

export async function getWeather(city = "Accra") {
  try {
    const data = await getJson(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, 6000);
    const c = data.current_condition?.[0];
    return c ? `${city}: ${c.temp_C}°C, ${c.weatherDesc?.[0]?.value}, Humidity ${c.humidity}%, Wind ${c.windspeedKmph}km/h` : null;
  } catch { return null; }
}

export function detectCity(q: string) {
  const m = q.match(/weather (?:in|for|at)\s+([a-zA-Z\s]+?)(?:\?|$|today|now|tomorrow)/i);
  return m?.[1]?.trim() || "Accra";
}
