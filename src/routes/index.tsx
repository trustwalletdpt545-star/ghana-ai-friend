import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const [input, setInput] = useState('Who are you')
  const [messages, setMessages] = useState<{role:string, content:string}[]>([])
  const [loading, setLoading] = useState(false)

  const ask = async () => {
    if(!input.trim()) return
    const q = input
    setInput('')
    setMessages(m=>[...m, {role:'user', content:q}])
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({message:q})
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || JSON.stringify(data))
      const reply = data.choices?.[0]?.message?.content || data.reply || JSON.stringify(data)
      setMessages(m=>[...m, {role:'assistant', content:reply}])
    } catch(err:any){
      setMessages(m=>[...m, {role:'assistant', content:'❌ ERROR: '+err.message}])
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh', background:'#FFF8EB', padding:20, fontFamily:'sans-serif'}}>
      <div style={{maxWidth:680, margin:'0 auto'}}>
        <div style={{textAlign:'center', marginBottom:20}}>
          <h1 style={{color:'#C8102E', margin:0}}>🇬🇭 Ghana AI Friend</h1>
          <h2 style={{margin:'8px 0'}}>Akwaaba! Welcome!</h2>
          <p style={{color:'#666'}}>Your friend for everything Ghana — culture, food, Twi, history</p>
        </div>
        <div style={{background:'white', border:'2px solid #FCD116', borderRadius:16, padding:16, minHeight:320, boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
          {messages.length===0 && <p style={{color:'#888', textAlign:'center', marginTop:100}}>Ask me anything about Ghana! 🌍</p>}
          {messages.map((m,i)=>(
            <div key={i} style={{background:m.role==='user'?'#006B3F':'#FFF3B0', color:m.role==='user'?'white':'black', padding:'10px 14px', borderRadius:12, margin:'8px 0', maxWidth:'90%'}}>
              <b>{m.role}:</b> {m.content}
            </div>
          ))}
          {loading && <p style={{color:'#C8102E'}}>Thinking... ⏳</p>}
        </div>
        <div style={{display:'flex', gap:8, marginTop:14}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()} style={{flex:1, padding:14, borderRadius:12, border:'2px solid #006B3F'}} />
          <button onClick={ask} style={{padding:'14px 20px', background:'#C8102E', color:'white', border:'none', borderRadius:12, fontWeight:'bold'}}>Ask</button>
        </div>
      </div>
    </div>
  )
}
