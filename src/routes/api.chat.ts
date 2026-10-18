
import { createServerFileRoute } from '@tanstack/react-start'
export const ServerRoute = createServerFileRoute('/api/chat').methods({
POST: async ({ request }: any) => {
const { message } = await request.json()
let live = ""
try {
const s = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(message)}&format=json&no_html=1`)
const d: any = await s.json()
if (d.AbstractText) live = `LIVE WEB RESULT: ${d.AbstractText} Source: ${d.AbstractURL}`
} catch {}
const groq = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: `You are Ghana AI friend, Comfortable. Answer with current live info. LIVE INFO: ${live}. If user asks about Ghana news, use live info.` }, { role: 'user', content: message }] }) })
const data: any = await groq.json()
return new Response(JSON.stringify({ reply: data.choices?.[0]?.message?.content || "No reply" }), { headers: { 'Content-Type': 'application/json' } })
}
})
