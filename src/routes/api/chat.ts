import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { createResponsesCall } from "@/lib/ai/responses.server";

const SYSTEM = `You are Comfortable AI 🌍 — a warm, brilliant international assistant built in Ghana for the world.
You answer EVERYTHING: nursing (NCLEX, RGN, RM, midwifery, pharmacology, care plans), education (BECE, WASSCE, university, math, science), Ghana culture, history, food (jollof, waakye, fufu, banku), current affairs, coding, health, careers (CVs, cover letters), jokes and translations.
You know Ghana deeply: Accra, Kumasi, Tamale, Cape Coast, Takoradi, the 16 regions, Nursing and Midwifery Council (NMC) licensing exams, nursing training colleges, KNUST, UG, UCC, UHAS, GES, WAEC, Ghana cedi, local customs and festivals.
You translate fluently between English, Twi (Akan), Ga, Ewe and French. Do your best on Ga and Ewe and note uncertainty briefly when unsure.
Language rule: {LANG}
For health questions give accurate, practical info and advise seeing a professional for emergencies (Ghana emergency: 112 / ambulance 193).
For recent news, say your knowledge may not include the very latest events.
Use clean Markdown: headings, bold, lists, tables and fenced code blocks. Be friendly, concise and genuinely helpful.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env['LOVABLE_API_KEY'];
        if (!apiKey) return new Response("AI is not configured", { status: 500 });
        let body: { messages?: UIMessage[]; language?: string; live?: boolean; timezone?: string };
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid request", { status: 400 });
        }
        if (!Array.isArray(body.messages)) return new Response("Invalid request", { status: 400 });
        const lang =
          body.language && body.language !== "auto"
            ? `Always reply in ${body.language}.`
            : "Detect the language of the user's latest message and reply in that same language (English, Twi, Ga, Ewe, French, Pidgin or any other).";
        const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
        const q = (lastUser?.parts ?? []).map((p) => (p.type === "text" ? p.text : "")).join(" ").slice(0, 300);
        const t = getLiveTime(body.timezone);
        let live = `\n\nLIVE CONTEXT:\n- Ghana time (Accra, GMT): ${t.ghana}\n- UTC: ${t.utc}\n- User local time: ${t.userLocal || "unknown"} (${t.timezone})`;
        if (body.live !== false && needsLive(q)) {
          const [search, weather] = await Promise.all([
            liveSearchInternational(q),
            /weather|temperature|rain/i.test(q) ? getWeather(detectCity(q)) : Promise.resolve(null),
          ]);
          if (search) live += `\n\nLIVE WEB SEARCH RESULTS for "${q}":\n${search}`;
          if (weather) live += `\n\nLIVE WEATHER: ${weather}`;
          live += search || weather
            ? `\n\nUse the live data above. Start current-info answers with "✅ Live update as of ${t.ghana} (Ghana time)". For news, format as "📰 LIVE NEWS" with 3-5 bullet headlines and dates, then "Source: Live web search".`
            : `\n\nLive search returned nothing. Say "Live search limited, but as of ${t.ghana}..." and answer from knowledge.`;
        }
        const messages = await convertToModelMessages(body.messages.slice(-30));
        return createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          messages,
          SYSTEM.replace("{LANG}", lang) + live,
        ).response();
      },
    },
  },
});
