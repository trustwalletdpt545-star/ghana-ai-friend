import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if (!input.trim()) return
    const userMsg = input
    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })
      const data = await res.json()
      const reply = data.choices?.[0]?.message?.content || data.reply || data.response || JSON.stringify(data)
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: 'Error reaching live server. Check GROQ_API_KEY on Vercel.' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 20, fontFamily: 'system-ui' }}>
      <h1>🇬🇭 Ghana AI Friend</h1>
      <div style={{ minHeight: 300, border: '1px solid #ddd', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        {messages.length === 0 && <p>Ask me anything about Ghana!</p>}
        {messages.map((m, i) => (
          <div key={i} style={{ margin: '12px 0', textAlign: m.role === 'user' ? 'right' : 'left' }}>
            <span style={{ background: m.role === 'user' ? '#007AFF' : '#f1f1f1', color: m.role === 'user' ? 'white' : 'black', padding: '8px 12px', borderRadius: 12, display: 'inline-block' }}>
              {m.content}
            </span>
          </div>
        ))}
        {loading && <p>Thinking...</p>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && ask()} placeholder="Ask..." style={{ flex: 1, padding: 12, borderRadius: 8, border: '1px solid #ccc' }} />
        <button onClick={ask} disabled={loading} style={{ padding: '12px 20px', borderRadius: 8, background: '#007AFF', color: 'white', border: 0 }}>Ask</button>
      </div>
    </div>
  )
}
