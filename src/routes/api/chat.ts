import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { message } = await request.json();
  
  // Simple Ghana AI response - will work without external APIs
  const reply = `Hello! You said: "${message}". I'm Ghana AI Friend, live in Accra! 🇬🇭 Time now: ${new Date().toLocaleString('en-US', {timeZone: 'Africa/Accra'})}. How can I help you?`;

  return json({ reply, message });
};

export const GET: RequestHandler = async () => {
  return json({ status: "Ghana AI Friend API is live 🇬🇭" });
};
