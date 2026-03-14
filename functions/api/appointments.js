export async function onRequestGet(context) {
  const { DB } = context.env
  const headers = { 'Content-Type': 'application/json' }
  try {
    const result = await DB.prepare('SELECT * FROM appointments ORDER BY date DESC, time DESC').all()
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
      'INSERT INTO appointments (patient_id, patient_name, date, time, type, status) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(b.patientId, b.patientName, b.date, b.time || '09:00', b.type || 'Clinic', 'Scheduled').run()
    const appt = await DB.prepare('SELECT * FROM appointments WHERE id = ?').bind(result.meta.last_row_id).first()
    return new Response(JSON.stringify(appt), { headers })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}