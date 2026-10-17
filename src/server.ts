import { json } from '@sveltejs/kit';
import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export const POST = async ({ request }) => {
  try {
    const { message } = await request.json();
    
    // Read key from any possible env name
    const GROQ_KEY = privateEnv.GROQ_API_KEY || privateEnv.VITE_GROQ_API_KEY || publicEnv.VITE_GROQ_API_KEY || process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;

    console.log("Groq key exists?", !!GROQ_KEY);

    if (!GROQ_KEY) {
      return json({ reply: "❌ GROQ_API_KEY not found on server. Check Vercel env." });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are Comfortable AI - Ghana AI Friend. You are built by nursecare-gh + comfortable-ai team in Accra, Ghana. You are NOT OpenAI, NOT ChatGPT, NOT Meta AI. You are Ghanaian AI. Current location Accra GMT. Be proud, helpful, friendly. Always say you are Ghana AI Friend.' },
          { role: 'user', content: message || "Who are you?" }
        ],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Groq error:", data);
      return json({ reply: `Groq API Error: ${data.error?.message || 'Failed'}` });
    }

    const reply = data.choices?.[0]?.message?.content || "No reply from Groq";
    return json({ reply });

  } catch (err: any) {
    console.error(err);
    return json({ reply: `Server Error: ${err.message}` });
  }
};

export const GET = async () => {
  return json({ status: 'Ghana AI - Groq API Ready 🇬🇭' });
};
