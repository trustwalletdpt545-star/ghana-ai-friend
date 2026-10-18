import { createServerFileRoute } from '@tanstack/react-start'
export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }: any) => {
    const { message } = await request.json()
    const groq = await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.GROQ_API_KEY}`},
      body: JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'system',content:'You are Ghana AI Friend - friendly Ghanaian AI helper'},{role:'user',content:message}]})
    })
    const data:any = await groq.json()
    return new Response(JSON.stringify({reply: data.choices?.[0]?.message?.content || "Error, try again"}),{headers:{'Content-Type':'application/json'}})
  }
})
