import { createServerFileRoute } from '@tanstack/react-start'

export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }: any) => {
    try {
      const { message } = await request.json()
      
      const apiKey = process.env.GROQ_API_KEY || process.env.GROQ_A || ''
      
      if (!apiKey) {
        return new Response(JSON.stringify({ reply: 'Missing GROQ_API_KEY in Vercel settings' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are Ghana AI Friend - friendly, helpful, speak English, Twi, Pidgin. Akwaaba spirit!' },
            { role: 'user', content: message }
          ]
        })
      })

      const d: any = await r.json()
      const reply = d.choices?.[0]?.message?.content || d.error?.message || 'No reply from Groq'

      return new Response(JSON.stringify({ reply }), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (e: any) {
      return new Response(JSON.stringify({ reply: 'Error: ' + e.message }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
})
