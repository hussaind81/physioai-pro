export async function onRequestPut(context) {
  const { DB } = context.env
  const headers = { 'Content-Type': 'application/json' }
  try {
    const id = context.params.id
    const b = await context.request.json()
    await DB.prepare(
      'UPDATE appointments SET status=?, soap_s=?, soap_o=?, soap_a=?, soap_p=?, pain_before=?, pain_after=?, summary=? WHERE id=?'
    ).bind(b.status, b.soap_s, b.soap_o, b.soap_a, b.soap_p, b.pain_before, b.pain_after, b.summary, id).run()
    return new Response(JSON.stringify({ success: true }), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}