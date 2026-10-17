import { createServerFileRoute } from '@tanstack/react-start'

export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }) => {
    const body = await request.json() as any
    const msg = body.message || 'hi'
    const key = process.env.GROQ_API_KEY
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: 'You are Ghana AI Friend from Accra, Ghana. Friendly and helpful.' }, { role: 'user', content: msg }]
      })
    })
    const d = await r.json() as any
    const reply = d.choices?.[0]?.message?.content || 'Error getting reply'
    return new Response(JSON.stringify({ reply }), { headers: { 'Content-Type': 'application/json' } })
  },
  GET: async () => {
    return new Response(JSON.stringify({ status: 'live' }), { headers: { 'Content-Type': 'application/json' } })
  }
})
