import { createServerFileRoute } from '@tanstack/react-start'
export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }: any) => {
    const { message } = await request.json()
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.GROQ_API_KEY}`},
      body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'user',content:message}]})
    })
    const d:any = await r.json()
    return new Response(JSON.stringify({reply:d.choices?.[0]?.message?.content}),{headers:{'Content-Type':'application/json'}})
  }
})
