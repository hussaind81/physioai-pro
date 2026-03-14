export async function onRequest(context) {
  const url = new URL(context.request.url)

  if (url.pathname === '/api/summary' && context.request.method === 'POST') {
    try {
      const body = await context.request.json()
      const apiKey = context.env.GEMINI_API_KEY

      if (!apiKey) {
        return new Response(JSON.stringify({ summary: 'ERROR: No API key found in environment' }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const prompt = `Write a short 50 word physiotherapy session summary for patient ${body.patientName}. Notes: ${body.notes}. Pain went from ${body.painBefore} to ${body.painAfter} out of 10.`

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }]
        })
      })

      const responseText = await res.text()

      if (!res.ok) {
        return new Response(JSON.stringify({ summary: 'Gemini API Error: ' + responseText }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      const data = JSON.parse(responseText)
      const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text

      if (!summary) {
        return new Response(JSON.stringify({ summary: 'No text in response: ' + responseText }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ summary }), {
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (err) {
      return new Response(JSON.stringify({ summary: 'Exception: ' + err.message }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }

  return context.next()
}