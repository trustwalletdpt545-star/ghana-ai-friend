import { createServerFn } from "@tanstack/react-start";

export const refreshLiveNews = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env['TAVILY_API_KEY'];
  if (!key) return { text: null };
  try {
    const { tavilyNews, getLiveTime } = await import("@/lib/liveData");
    const news = await tavilyNews(key);
    return { text: `✅ Live update as of ${getLiveTime().ghana} (Ghana time)\n\n${news}` };
  } catch { return { text: null }; }
});