export async function onRequest(context) {
  const url = new URL(context.request.url)

  if (url.pathname === '/api/summary' && context.request.method === 'POST') {
    const body = await context.request.json()
    const apiKey = context.env.GEMINI_API_KEY

    const prompt = `You are a professional physiotherapist. Write a SOAP format session summary for:
Patient: ${body.patientName}
Date: ${body.date}
Type: ${body.type}
Notes: ${body.notes}
Pain before: ${body.painBefore}/10
Pain after: ${body.painAfter}/10

Write a professional 150-word clinical summary.`

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })

    const data = await res.json()
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not generate summary.'
    return new Response(JSON.stringify({ summary }), { headers: { 'Content-Type': 'application/json' } })
  }

  return context.next()
}