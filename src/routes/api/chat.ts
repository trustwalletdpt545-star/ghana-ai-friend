import { createServerFileRoute } from '@tanstack/react-start'

export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }) => {
    try {
      const { message } = await request.json() as { message: string }
      const GROQ_KEY = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY

      if (!GROQ_KEY) {
        return new Response(JSON.stringify({ reply: "❌ GROQ_API_KEY missing in Vercel" }), { status: 200, headers: { 'Content-Type': 'application/json' } })
      }

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are Comfortable AI - Ghana AI Friend. Built by nursecare-gh + comfortable-ai in Accra, Ghana. You are NOT OpenAI, NOT ChatGPT. You are Ghanaian AI Friend. Be proud Ghanaian, helpful.' },
            { role: 'user', content: message }
          ]
        })
      })

      const data = await groqRes.json()
      const reply = data.choices?.[0]?.message?.content || "Groq error"
      return new Response(JSON.stringify({ reply }), { headers: { 'Content-Type': 'application/json' } })

    } catch (e: any) {
      return new Response(JSON.stringify({ reply: "Server Error: " + e.message }), { headers: { 'Content-Type': 'application/json' } })
    }
  },
  GET: async () => {
    return new Response(JSON.stringify({ status: 'Ghana AI Live 🇬🇭' }), { headers: { 'Content-Type': 'application/json' } })
  }
})
