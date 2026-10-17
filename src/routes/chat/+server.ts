
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
  const body = await request.json();
  const msg = body.message || 'hi';
  const key = process.env.GROQ_API_KEY;
  const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are Ghana AI Friend, built in Ghana, live in Accra' },
        { role: 'user', content: msg }
      ]
    })
  });
  const d = await r.json();
  const reply = d.choices && d.choices[0] ? d.choices[0].message.content : 'Error';
  return json({ reply: reply });
}

export async function GET() {
  return json({ status: 'live' });
}
