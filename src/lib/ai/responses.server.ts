import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, type ModelMessage } from "ai";

export function createResponsesCall(
  request: Request,
  config: { baseURL: string; apiKey: string; model: string },
  messages: ModelMessage[],
  instructions?: string,
) {
  // Use GEMINI_API_KEY from Vercel env - FREE, no Lovable credit needed
  const apiKey = config.apiKey || (process.env as any).GEMINI_API_KEY || "";
  
  const google = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  // Force Gemini model for Ghana AI Friend
  const modelName = config.model?.includes("gemini") ? config.model : "gemini-1.5-flash";
  
  const result = streamText({
    model: google(modelName),
    system: instructions || "You are Comfortable AI, Ghana's helpful AI assistant. You are ALWAYS LIVE. Answer warmly in English with some Ghanaian Pidgin when natural. You are built by a Ghanaian developer.",
    messages,
    abortSignal: request.signal,
  });

  return result;
}
