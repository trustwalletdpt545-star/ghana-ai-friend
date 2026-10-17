import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

export function createResponsesCall(
  request: Request,
  config: { baseURL: string; apiKey: string; model: string },
  messages: ModelMessage[],
  instructions?: string,
) {
  // Use GEMINI API key from env - FREE
  const geminiKey = (config.apiKey && config.apiKey.startsWith("AIza") ? config.apiKey : null) 
    || (process.env as any).GEMINI_API_KEY 
    || config.apiKey;

  // Use Gemini's OpenAI-compatible endpoint - works with existing SDK
  const provider = createOpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: geminiKey,
  });

  const modelName = config.model?.includes("gemini") ? config.model : "gemini-1.5-flash";

  const result = streamText({
    model: provider.responses(modelName),
    ...(instructions ? { instructions } : {}),
    messages,
    abortSignal: request.signal,
  });

  return result;
}
