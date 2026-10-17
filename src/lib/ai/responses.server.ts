import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

export function createResponsesCall(
  request: Request,
  config: { baseURL: string; apiKey: string; model: string },
  messages: ModelMessage[],
  instructions?: string,
) {
  const apiKey = (process.env as any).GEMINI_API_KEY || config.apiKey;

  const provider = createOpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: apiKey,
  });

  return streamText({
    model: provider("gemini-1.5-flash"),
    system: instructions,
    messages,
    abortSignal: request.signal,
  } as any);
}
