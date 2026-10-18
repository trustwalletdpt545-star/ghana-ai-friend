import { createServerFileRoute } from '@tanstack/react-start'
export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }) => {
    try {
      const { message } = await request.json()
      const key = process.env.GROQ_API_KEY
      if (!key) return new Response(JSON.stringify({error:'GROQ_API_KEY is missing in Vercel Env'}), {status:500})
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method:'POST',
        headers:{'Content-Type':'application/json', Authorization:`Bearer ${key}`},
        body: JSON.stringify({
          model:'llama-3.1-8b-instant',
          messages:[
            {role:'system', content:'You are Ghana AI Friend. Warm Ghanaian AI, help with Ghana culture, food, Twi, history, tourism. Say Akwaaba sometimes. Keep answers friendly.'},
            {role:'user', content:message}
          ]
        })
      })
      const data = await r.json()
      if(!r.ok) return new Response(JSON.stringify({error:data.error?.message||JSON.stringify(data)}), {status:500})
      return new Response(JSON.stringify(data), {headers:{'Content-Type':'application/json'}})
    } catch(e:any){
      return new Response(JSON.stringify({error:e.message}), {status:500})
    }
  }
})
