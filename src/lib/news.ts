export const NEWS_REFRESH_MS = 5 * 60 * 1000;

export type NewsItem = { title: string; url: string; content?: string; published_date?: string; image?: string; image_url?: string };
export type NewsImage = { url: string; description?: string };
export type NewsResult = { answer?: string; results?: NewsItem[]; images?: (string | NewsImage)[] };

export function safeNewsUrl(value?: string) {
  try {
    const url = new URL(value || "");
    return url.protocol === "https:" ? url.href : null;
  } catch { return null; }
}

export function filterNews(items: NewsItem[], domains: string[]) {
  const urls = new Set<string>();
  const titles = new Set<string>();
  return items.filter((item) => {
    const safe = safeNewsUrl(item.url);
    if (!safe || !item.title?.trim()) return false;
    const url = new URL(safe);
    const host = url.hostname.replace(/^www\./, "");
    if (!domains.some((domain) => host === domain || host.endsWith(`.${domain}`))) return false;
    const title = item.title.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    if (/^(?:(?:ap|bbc|cnn|reuters|world|ghana)\s+)*(?:top stories|top headlines|breaking news|latest news|news headlines|news roundup|news briefing|world news|ghana news)\b/i.test(title)) return false;
    if (/\/(?:hub|news|world|latest|live|video)\/?$/i.test(url.pathname) || /^\/$/.test(url.pathname)) return false;
    if (/top[-_]?stories|news[-_]?roundup|news[-_]?briefing/i.test(url.pathname)) return false;
    const canonical = `${host}${url.pathname.replace(/\/$/, "")}`;
    if (urls.has(canonical) || titles.has(title)) return false;
    urls.add(canonical);
    titles.add(title);
    return true;
  });
}

const escapeMarkdown = (text: string) => text.replace(/[\\`*_[\]<>]/g, "\\$&").replace(/[\r\n]+/g, " ");
const linkUrl = (url: string) => url.replace(/\(/g, "%28").replace(/\)/g, "%29");

export function formatNewsSection(title: string, result: NewsResult | null, domains: string[]) {
  const items = filterNews(result?.results ?? [], domains);
  if (!items.length) return `## ${title}\n\nNo verified news right now`;
  const images = (result?.images ?? []).map((image) => typeof image === "string" ? { url: image } : image)
    .filter((image) => safeNewsUrl(image.url)).filter((image, index, all) => all.findIndex((other) => other.url === image.url) === index).slice(0, 2);
  const photos = images.map((image) => `![${escapeMarkdown(image.description || `${title} photo`)}](${linkUrl(image.url)})`).join("\n\n");
  const headlines = items.map((item) => {
    const host = new URL(item.url).hostname.replace(/^www\./, "");
    const names: Record<string, string> = { "bbc.com": "BBC", "reuters.com": "Reuters", "apnews.com": "AP", "cnn.com": "CNN", "aljazeera.com": "Al Jazeera", "myjoyonline.com": "MyJoyOnline", "citinewsroom.com": "Citi Newsroom", "graphic.com.gh": "Graphic Online" };
    const source = Object.entries(names).find(([domain]) => host === domain || host.endsWith(`.${domain}`))?.[1] || host;
    const image = safeNewsUrl(item.image || item.image_url);
    return `- ${escapeMarkdown(item.title)} — [Source: ${source}](${linkUrl(item.url)})${image ? `\n\n  ![${escapeMarkdown(item.title)}](${linkUrl(image)})` : ""}`;
  }).join("\n");
  return `## ${title}\n\n${photos ? `${photos}\n\n` : ""}${headlines}`;
}

export const isNewsAnswer = (text: string) => text.includes("🌍 WORLD NEWS") && text.includes("🇬🇭 GHANA NEWS");