export async function onRequestGet(context) {
  const { DB } = context.env
  const headers = { 'Content-Type': 'application/json' }
  try {
    const result = await DB.prepare('SELECT * FROM exercises ORDER BY id').all()
    return new Response(JSON.stringify(result.results), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}

export async function onRequestPost(context) {
  const { DB } = context.env
  const headers = { 'Content-Type': 'application/json' }
  try {
    const b = await context.request.json()
    const result = await DB.prepare(
      'INSERT INTO exercises (name, condition, difficulty, sets, reps, description, youtube) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(b.name, b.condition || '', b.difficulty || 'Easy', b.sets || 3, b.reps || 10, b.description || '', b.youtube || '').run()
    const ex = await DB.prepare('SELECT * FROM exercises WHERE id = ?').bind(result.meta.last_row_id).first()
    return new Response(JSON.stringify(ex), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}