import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
export const Route = createFileRoute('/')({ component: Home })
function Home() {
  const [msg, setMsg] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  async function send() {
    if(!msg) return
    setLoading(true)
    setReply('')
    const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: msg }) })
    const j = await r.json()
    setReply(j.reply)
    setLoading(false)
  }
  return (
    <div style={{padding:20, maxWidth:700, margin:'0 auto', fontFamily:'sans-serif'}}>
      <h1>🇬🇭 Ghana AI Friend</h1>
      <p>Live web search enabled!</p>
      <textarea style={{width:'100%', padding:12, minHeight:80, border:'1px solid #ccc', borderRadius:8}} value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Ask e.g. What is happening in Ghana today?" />
      <button onClick={send} style={{marginTop:10, padding:'12px 20px', background:'black', color:'white', borderRadius:8}}>{loading ? 'Searching live web...' : 'Ask'}</button>
      <div style={{marginTop:20, whiteSpace:'pre-wrap', background:'#f5f5f5', padding:15, borderRadius:8}}>{reply}</div>
    </div>
  )
}
