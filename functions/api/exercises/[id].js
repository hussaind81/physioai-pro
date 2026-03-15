export async function onRequestPut(context) {
  const { DB } = context.env
  const headers = { 'Content-Type': 'application/json' }
  try {
    const id = context.params.id
    const b = await context.request.json()
    await DB.prepare('UPDATE exercises SET name=?, condition=?, difficulty=?, sets=?, reps=?, description=?, youtube=? WHERE id=?')
      .bind(b.name, b.condition, b.difficulty, b.sets, b.reps, b.description, b.youtube || '', id).run()
    return new Response(JSON.stringify({ success: true }), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}

export async function onRequestDelete(context) {
  const { DB } = context.env
  const headers = { 'Content-Type': 'application/json' }
  try {
    const id = context.params.id
    await DB.prepare('DELETE FROM exercises WHERE id = ?').bind(id).run()
    return new Response(JSON.stringify({ success: true }), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}