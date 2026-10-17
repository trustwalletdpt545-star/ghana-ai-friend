export async function getAIResponse(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY || "";
  if (!apiKey) return "I'm offline now, but I'll be back soon!";
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({contents:[{parts:[{text: prompt}]}]})
    });
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Hello! How can I help you today?";
  } catch {
    return "I'm having connection issues, try again!";
  }
}
