export async function onRequestDelete(context) {
  const { DB } = context.env
  const headers = { 'Content-Type': 'application/json' }
  try {
    const id = context.params.id
    await DB.prepare('DELETE FROM patients WHERE id = ?').bind(id).run()
    return new Response(JSON.stringify({ success: true }), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}

export async function onRequestPut(context) {
  const { DB } = context.env
  const headers = { 'Content-Type': 'application/json' }
  try {
    const id = context.params.id
    const b = await context.request.json()
    await DB.prepare('UPDATE patients SET assigned_exercises = ? WHERE id = ?').bind(JSON.stringify(b.assigned_exercises), id).run()
    return new Response(JSON.stringify({ success: true }), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}