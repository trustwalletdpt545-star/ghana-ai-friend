import { createServerFileRoute } from '@tanstack/react-start'

export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }: any) => {
    try {
      const { message } = await request.json()
      const apiKey = process.env.GROQ_API_KEY
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Missing GROQ_API_KEY' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
      }
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are Ghana AI Friend, helpful assistant about Ghana.' },
            { role: 'user', content: message },
          ],
        }),
      })
      const data = await r.json()
      return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }
  },
})
