export async function onRequest(context) {
  const headers = { 'Content-Type': 'application/json' }
  if (context.request.method !== 'POST') return new Response('{}', { headers })

  try {
    const b = await context.request.json()
    const apiKey = context.env.VITE_GEMINI_KEY
    if (!apiKey) return new Response(JSON.stringify({ summary: 'No API key configured' }), { headers })

    const prompt = 'Write a 100 word professional physiotherapy SOAP summary for patient ' + b.patientName + '. S: ' + b.soap_s + '. O: ' + b.soap_o + '. A: ' + b.soap_a + '. P: ' + b.soap_p + '. Pain: ' + b.pain_before + ' to ' + b.pain_after + '/10.'

    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    })
    const data = await res.json()
    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not generate: ' + JSON.stringify(data)
    return new Response(JSON.stringify({ summary }), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ summary: 'Error: ' + err.message }), { headers })
  }
}
