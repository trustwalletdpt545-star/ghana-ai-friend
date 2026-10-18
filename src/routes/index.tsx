import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{role:'user'|'assistant', content:string}[]>([])
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    const text = input.trim()
    if (!text) return
    setInput('')
    setMessages(m => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || JSON.stringify(data).slice(0,200))
      const reply = data.choices?.[0]?.message?.content || data.error || 'No reply'
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (e:any) {
      setMessages(m => [...m, { role: 'assistant', content: '❌ '+ e.message + ' — Check Vercel Logs for /api/chat' }])
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#FFF8F0', padding:'20px', fontFamily:'system-ui' }}>
      <div style={{ maxWidth:700, margin:'0 auto' }}>
        <h1 style={{ textAlign:'center', color:'#CE1126', fontSize:28 }}>🇬🇭 Ghana AI Friend</h1>
        <h2 style={{ textAlign:'center', color:'#333' }}>Akwaaba!</h2>
        <p style={{ textAlign:'center', color:'#666' }}>Your friendly AI about Ghana - Culture, Food, History, Twi & more</p>
        
        <div style={{ background:'white', borderRadius:16, padding:16, minHeight:350, boxShadow:'0 4px 12px rgba(0,0,0,0.08)', border:'1px solid #FCD116' }}>
          {messages.length===0 && <p style={{ color:'#888', textAlign:'center', marginTop:80 }}>Ask me anything about Ghana! 🌍</p>}
          {messages.map((m,i) => (
            <div key={i} style={{ 
              background: m.role==='user' ? '#006B3F' : '#FFF3CD', 
              color: m.role==='user' ? 'white' : '#333',
              padding:'10px 14px', borderRadius:12, margin:'10px 0',
              alignSelf: m.role==='user' ? 'flex-end' : 'flex-start',
              maxWidth:'85%'
            }}>
              {m.content}
            </div>
          ))}
          {loading && <p style={{ color:'#CE1126' }}>Ghana AI is thinking... ⏳</p>}
        </div>

        <div style={{ display:'flex', gap:10, marginTop:16 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && ask()}
            placeholder="Ask about Ghana..." 
            style={{ flex:1, padding:'14px', borderRadius:12, border:'2px solid #FCD116', outline:'none' }} />
          <button onClick={ask} disabled={loading}
            style={{ padding:'14px 22px', background:'#CE1126', color:'white', border:'none', borderRadius:12, fontWeight:'bold', cursor:'pointer' }}>
            Ask
          </button>
        </div>
      </div>
    </div>
  )
}
