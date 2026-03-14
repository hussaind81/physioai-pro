export async function onRequestGet(context) {
  const { DB } = context.env
  const headers = { 'Content-Type': 'application/json' }
  try {
    const result = await DB.prepare('SELECT * FROM exercise_schedules').all()
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
    await DB.prepare('DELETE FROM exercise_schedules WHERE patient_id = ?').bind(b.patient_id).run()
    for (const entry of b.schedule) {
      await DB.prepare('INSERT INTO exercise_schedules (patient_id, exercise_id, day_of_week) VALUES (?, ?, ?)')
        .bind(b.patient_id, entry.exercise_id, entry.day).run()
    }
    return new Response(JSON.stringify({ success: true }), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}