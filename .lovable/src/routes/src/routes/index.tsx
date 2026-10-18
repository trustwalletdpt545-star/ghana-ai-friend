import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
export const Route = createFileRoute('/')({ component: Home })
function Home() {
  const [msg, setMsg] = useState(''); const [reply, setReply] = useState(''); const [load, setLoad] = useState(false)
  async function ask() {
    if(!msg) return; setLoad(true); setReply('')
    const r = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg})})
    const d = await r.json(); setReply(d.reply); setLoad(false)
  }
  return (<div style={{padding:20,maxWidth:700,margin:'0 auto',fontFamily:'sans-serif'}}><h1>🇬🇭 Ghana AI Friend LIVE</h1><p>Ask anything - live web search on!</p><textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="What is happening in Ghana today?" style={{width:'100%',padding:12,minHeight:80,border:'1px solid #ccc',borderRadius:8}}/><button onClick={ask} style={{marginTop:10,padding:'12px 20px',background:'black',color:'white',borderRadius:8}}>{load?'Searching live...':'Ask'}</button><div style={{marginTop:20,background:'#f5f5f5',padding:15,borderRadius:8,whiteSpace:'pre-wrap'}}>{reply}</div></div>)
}
