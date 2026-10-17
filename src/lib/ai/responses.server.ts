import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

export function createResponsesCall(
  request: Request,
  config: { baseURL: string; apiKey: string; model: string },
  messages: ModelMessage[],
  instructions?: string,
) {
  const geminiKey = (process.env as any).GEMINI_API_KEY || config.apiKey || "";
  
  const openaiProvider = createOpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: geminiKey,
  });

  return streamText({
    model: openaiProvider("gemini-1.5-flash"),
    system: instructions || "You are Comfortable AI, Ghana's AI assistant. You are ALWAYS ONLINE. Never say you are offline. Be helpful, warm, friendly, use some Ghana Pidgin when appropriate.",
    messages,
    abortSignal: request.signal,
  } as any);
}
