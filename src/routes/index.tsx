import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
export const Route = createFileRoute('/')({ component: Home })
function Home() {
  const [m,setM]=useState('');const [r,setR]=useState('');const [l,setL]=useState(false)
  async function ask(){if(!m) return; setL(true); const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:m})}); const d=await res.json(); setR(d.reply); setL(false)}
  return <div style={{padding:24,maxWidth:720,margin:'0 auto',fontFamily:'sans-serif'}}><h1>🇬🇭 Ghana AI Friend LIVE</h1><textarea value={m} onChange={e=>setM(e.target.value)} style={{width:'100%',padding:14,height:90,border:'1px solid #ccc',borderRadius:12}} placeholder="Ask anything"/><button onClick={ask} style={{marginTop:12,padding:'14px',background:'black',color:'white',borderRadius:12,width:'100%'}}>{l?'Searching...':'Ask'}</button><div style={{marginTop:20,background:'#f5f5f5',padding:16,borderRadius:12,whiteSpace:'pre-wrap'}}>{r}</div></div>
}
