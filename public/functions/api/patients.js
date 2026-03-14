export async function onRequestGet(context) {
  const { DB } = context.env
  const headers = { 'Content-Type': 'application/json' }
  try {
    const result = await DB.prepare('SELECT * FROM patients ORDER BY created_at DESC').all()
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
      'INSERT INTO patients (name, phone, email, age, condition, diagnosis, assigned_exercises) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(b.name, b.phone || '', b.email || '', b.age || '', b.condition || '', b.diagnosis || '', '[]').run()
    const patient = await DB.prepare('SELECT * FROM patients WHERE id = ?').bind(result.meta.last_row_id).first()
    return new Response(JSON.stringify(patient), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}