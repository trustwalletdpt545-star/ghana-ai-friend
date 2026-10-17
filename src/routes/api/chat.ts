import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const userMsg = body.message || body.messages?.[body.messages.length-1]?.content || "hi";
    
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return json({ reply: "⚠️ GROQ_API_KEY missing! Add it in Vercel → Settings → Environment Variables" });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${groqKey}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are Ghana AI Friend, built in Ghana for the World. You live in Accra. Be helpful, friendly, and knowledgeable about Ghana and world." },
          { role: "user", content: userMsg }
        ]
      })
    });

    const data: any = await res.json();
    
    if (!res.ok) {
      return json({ reply: `Groq error: ${data.error?.message || JSON.stringify(data).slice(0,300)}` });
    }

    const reply = data.choices?.[0]?.message?.content || "No reply from AI";
    return json({ reply });

  } catch (e: any) {
    return json({ reply: `Error: ${e.message}` });
  }
};

export const GET: RequestHandler = async () => {
  return json({ status: "Ghana AI Friend API is live 🇬🇭" });
};
