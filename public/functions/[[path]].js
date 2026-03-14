export async function onRequest(context) {
  const url = new URL(context.request.url)
  const { DB } = context.env

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  try {
    // GET /api/patients
    if (url.pathname === '/api/patients' && context.request.method === 'GET') {
      const result = await DB.prepare('SELECT * FROM patients ORDER BY created_at DESC').all()
      return new Response(JSON.stringify(result.results), { headers })
    }

    // POST /api/patients
    if (url.pathname === '/api/patients' && context.request.method === 'POST') {
      const b = await context.request.json()
      const result = await DB.prepare(
        'INSERT INTO patients (name, phone, email, age, condition, diagnosis, assigned_exercises) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(b.name, b.phone, b.email, b.age, b.condition, b.diagnosis, '[]').run()
      const patient = await DB.prepare('SELECT * FROM patients WHERE id = ?').bind(result.meta.last_row_id).first()
      return new Response(JSON.stringify(patient), { headers })
    }

    // DELETE /api/patients/:id
    if (url.pathname.startsWith('/api/patients/') && context.request.method === 'DELETE') {
      const id = url.pathname.split('/')[3]
      await DB.prepare('DELETE FROM patients WHERE id = ?').bind(id).run()
      return new Response(JSON.stringify({ success: true }), { headers })
    }

    // PUT /api/patients/:id/exercises
    if (url.pathname.startsWith('/api/patients/') && url.pathname.endsWith('/exercises') && context.request.method === 'PUT') {
      const id = url.pathname.split('/')[3]
      const b = await context.request.json()
      await DB.prepare('UPDATE patients SET assigned_exercises = ? WHERE id = ?').bind(JSON.stringify(b.assigned_exercises), id).run()
      return new Response(JSON.stringify({ success: true }), { headers })
    }

    // GET /api/appointments
    if (url.pathname === '/api/appointments' && context.request.method === 'GET') {
      const result = await DB.prepare('SELECT * FROM appointments ORDER BY date DESC, time DESC').all()
      return new Response(JSON.stringify(result.results), { headers })
    }

    // POST /api/appointments
    if (url.pathname === '/api/appointments' && context.request.method === 'POST') {
      const b = await context.request.json()
      const result = await DB.prepare(
        'INSERT INTO appointments (patient_id, patient_name, date, time, type, status) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(b.patientId, b.patientName, b.date, b.time, b.type, 'Scheduled').run()
      const appt = await DB.prepare('SELECT * FROM appointments WHERE id = ?').bind(result.meta.last_row_id).first()
      return new Response(JSON.stringify(appt), { headers })
    }

    // PUT /api/appointments/:id
    if (url.pathname.startsWith('/api/appointments/') && context.request.method === 'PUT') {
      const id = url.pathname.split('/')[3]
      const b = await context.request.json()
      await DB.prepare(
        'UPDATE appointments SET status=?, soap_s=?, soap_o=?, soap_a=?, soap_p=?, pain_before=?, pain_after=?, summary=? WHERE id=?'
      ).bind(b.status, b.soap_s, b.soap_o, b.soap_a, b.soap_p, b.pain_before, b.pain_after, b.summary, id).run()
      return new Response(JSON.stringify({ success: true }), { headers })
    }

    // GET /api/exercises
    if (url.pathname === '/api/exercises' && context.request.method === 'GET') {
      const result = await DB.prepare('SELECT * FROM exercises ORDER BY id').all()
      return new Response(JSON.stringify(result.results), { headers })
    }

    // POST /api/exercises
    if (url.pathname === '/api/exercises' && context.request.method === 'POST') {
      const b = await context.request.json()
      const result = await DB.prepare(
        'INSERT INTO exercises (name, condition, difficulty, sets, reps, description, youtube) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(b.name, b.condition, b.difficulty, b.sets, b.reps, b.description, b.youtube || '').run()
      const ex = await DB.prepare('SELECT * FROM exercises WHERE id = ?').bind(result.meta.last_row_id).first()
      return new Response(JSON.stringify(ex), { headers })
    }

    // POST /api/summary (AI)
    if (url.pathname === '/api/summary' && context.request.method === 'POST') {
      const b = await context.request.json()
      const apiKey = context.env.VITE_GEMINI_KEY
      if (!apiKey) return new Response(JSON.stringify({ summary: 'No API key configured' }), { headers })
      const prompt = 'Write a 100 word professional physiotherapy SOAP session summary for patient ' + b.patientName + '. S: ' + b.soap_s + '. O: ' + b.soap_o + '. A: ' + b.soap_a + '. P: ' + b.soap_p + '. Pain: ' + b.pain_before + ' to ' + b.pain_after + '/10.'
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      })
      const data = await res.json()
      const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not generate: ' + JSON.stringify(data)
      return new Response(JSON.stringify({ summary }), { headers })
    }

    return context.next()

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers })
  }
}
return context.next()
