import { createServerFileRoute } from '@tanstack/react-start'
export const ServerRoute = createServerFileRoute('/api/chat').methods({
  POST: async ({ request }: any) => {
    const { message } = await request.json()
    let liveInfo = ""
    try {
      const s = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(message)}&format=json&no_html=1`)
      const j: any = await s.json()
      if (j.AbstractText) liveInfo = `LIVE FACT: ${j.AbstractText} Source:${j.AbstractURL}`
    } catch {}
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json', Authorization:`Bearer ${process.env.GROQ_API_KEY}`},
      body: JSON.stringify({ model:'llama-3.3-70b-versatile', messages:[{role:'system',content:`You are Ghana AI Friend. Use this LIVE data if relevant: ${liveInfo}. Be helpful, friendly, use Ghana pidgin small.`},{role:'user',content:message}], temperature:0.7 })
    })
    const data: any = await groqRes.json()
    return new Response(JSON.stringify({ reply: data.choices?.[0]?.message?.content || "Try again bro" }),{headers:{'Content-Type':'application/json'}})
  }
})
