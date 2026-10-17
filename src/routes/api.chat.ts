import { createServerFileRoute } from '@tanstack/react-start'

export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }) => {
    try {
      const body = await request.json() as any
      const msg = body.message || 'Hello'
      const key = process.env.GROQ_API_KEY
      if (!key) {
        return new Response(JSON.stringify({ reply: 'No GROQ_API_KEY in Vercel settings' }), { headers: { 'Content-Type': 'application/json' } })
      }
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are Ghana AI Friend from Accra, Ghana. Friendly, helpful.' },
            { role: 'user', content: msg }
          ]
        })
      })
      const d = await r.json() as any
      const reply = d.choices?.[0]?.message?.content || 'No reply from AI'
      return new Response(JSON.stringify({ reply }), { headers: { 'Content-Type': 'application/json' } })
    } catch (e:any) {
      return new Response(JSON.stringify({ reply: 'Error: ' + e.message }), { headers: { 'Content-Type': 'application/json' } })
    }
  },
  GET: async () => {
    return new Response(JSON.stringify({ status: 'Ghana AI live' }), { headers: { 'Content-Type': 'application/json' } })
  }
})
