import { json } from '@sveltejs/kit';

export async function POST({ request }: any) {
  try {
    const body = await request.json();
    const userMsg = body.message || body.messages?.[body.messages.length-1]?.content || "hi";
    
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return json({ reply: "GROQ_API_KEY missing in Vercel env!" });
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
          { role: "system", content: "You are Ghana AI Friend, built in Ghana for the World. Helpful and friendly." },
          { role: "user", content: userMsg }
        ]
      })
    });

    const data: any = await res.json();
    
    if (!res.ok) {
      return json({ reply: `Groq error: ${data.error?.message || JSON.stringify(data).slice(0,400)}` });
    }

    return json({ reply: data.choices?.[0]?.message?.content || "No reply" });

  } catch (e: any) {
    return json({ reply: `Error: ${e.message}` });
  }
}

export async function GET() {
  return json({ status: "Ghana AI Friend API live 🇬🇭" });
}
