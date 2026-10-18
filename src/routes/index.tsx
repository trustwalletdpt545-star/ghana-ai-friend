import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/')({ component: Home })
function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const ask = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
      const data = await res.json()
      console.log('API response', data)
      if (!res.ok) throw new Error(data.error || JSON.stringify(data))
      const reply = data.choices?.[0]?.message?.content || data.reply || JSON.stringify(data)
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (err: any) {
      setMessages(m => [...m, { role: 'assistant', content: '❌ Error: ' + err.message }])
    }
    setLoading(false)
  }
  return (
    <div style={{ maxWidth: 700, margin: '20px auto', padding: 20 }}>
      <h3>🇬🇭 Ghana AI Friend - DEBUG</h3>
      <div style={{ border: '1px solid #ccc', minHeight: 250, padding: 10, marginBottom: 10 }}>
        {messages.map((m,i) => <div key={i} style={{ margin: '8px 0', color: m.role==='user'?'blue':'black' }}><b>{m.role}:</b> {m.content}</div>)}
        {loading && <p>Loading...</p>}
        {messages.length===0 && <p>Ask me anything about Ghana!</p>}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && ask()} style={{ flex:1, padding:10 }} placeholder="Who are you" />
        <button onClick={ask} style={{ padding:'10px 16px', background:'#0a7cff', color:'white', border:0, borderRadius:6 }}>Ask</button>
      </div>
    </div>
  )
}
