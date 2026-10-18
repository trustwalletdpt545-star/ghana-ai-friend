import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [msg, setMsg] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<{q:string,a:string}[]>([])

  async function ask() {
    if (!msg.trim()) return
    setLoading(true)
    const q = msg
    setMsg('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q })
      })
      const data = await res.json()
      const ans = data.reply || data.message || 'No reply'
      setReply(ans)
      setHistory(h => [{q, a: ans}, ...h])
    } catch {
      setReply('Error - check API key in Vercel')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh', background:'#FFF8E1', fontFamily:'system-ui'}}>
      <div style={{background:'linear-gradient(90deg,#CE1126,#FCD116,#006B3F)', padding:'2px'}}>
        <div style={{background:'white', padding:'12px 20px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <b style={{fontSize:'20px'}}>🇬🇭 Ghana AI Friend</b>
          <span style={{fontSize:'12px', background:'#006B3F', color:'white', padding:'4px 10px', borderRadius:'20px'}}>LIVE</span>
        </div>
      </div>

      <div style={{maxWidth:720, margin:'0 auto', padding:'20px'}}>
        <div style={{background:'white', borderRadius:'16px', padding:'20px', boxShadow:'0 4px 20px rgba(0,0,0,0.08)', marginBottom:'16px'}}>
          <h1 style={{margin:'0 0 6px', fontSize:'28px'}}>Akwaaba! 👋</h1>
          <p style={{margin:0, color:'#666'}}>Your Ghanaian AI friend. Ask anything — Twi, English, Pidgin, history, food, code...</p>
          <div style={{display:'flex', gap:'8px', marginTop:'14px'}}>
            <input
              value={msg}
              onChange={e=>setMsg(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&ask()}
              placeholder="E.g: How to make jollof? Wo ho te sɛn?"
              style={{flex:1, padding:'14px', borderRadius:'10px', border:'1px solid #ddd', fontSize:'16px'}}
            />
            <button onClick={ask} disabled={loading} style={{background:'#CE1126', color:'white', border:'none', padding:'0 22px', borderRadius:'10px', fontWeight:'bold', cursor:'pointer'}}>
              {loading?'...':'Ask'}
            </button>
          </div>
        </div>

        {reply && (
          <div style={{background:'#006B3F', color:'white', borderRadius:'16px', padding:'18px', marginBottom:'16px', lineHeight:'1.6'}}>
            <div style={{fontSize:'12px', opacity:0.8, marginBottom:'6px'}}>GHANA AI FRIEND SAYS:</div>
            {reply}
          </div>
        )}

        {history.length>0 && (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {history.map((h,i)=>(
              <div key={i} style={{background:'white', borderRadius:'12px', padding:'14px', border:'1px solid #eee'}}>
                <div style={{fontWeight:'bold', fontSize:'13px', color:'#CE1126'}}>You: {h.q}</div>
                <div style={{marginTop:'6px', color:'#222'}}>{h.a}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
