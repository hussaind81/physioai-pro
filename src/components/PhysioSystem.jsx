import { useState, useEffect } from 'react'
import { Users, Calendar, Activity, BookOpen, BarChart2, LogOut, Plus, Search, Phone, Mail, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ADMIN_USER = 'admin'
const ADMIN_PASS = 'physio123'
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch('/api' + path, opts)
  return res.json()
}

function exportPDF(patient, appointments, exercises) {
  const appts = appointments.filter(a => (a.patient_id || a.patientId) === patient.id)
  const assignedEx = exercises.filter(e => {
    try {
      const ids = JSON.parse(patient.assigned_exercises || '[]')
      return ids.includes(e.id)
    } catch { return false }
  })

  const html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Patient Report - ${patient.name}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', sans-serif; background: #f8fafc; color: #1e293b; }
  .header { background: linear-gradient(135deg, #0d9488, #0891b2); color: white; padding: 40px; border-radius: 0 0 30px 30px; }
  .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
  .header p { opacity: 0.85; font-size: 14px; }
  .badge { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 14px; font-size: 12px; margin-top: 10px; }
  .content { padding: 30px; }
  .card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); border-left: 5px solid #0d9488; }
  .card h2 { font-size: 16px; font-weight: 700; color: #0d9488; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .card h2::before { content: ''; display: inline-block; width: 8px; height: 8px; background: #0d9488; border-radius: 50%; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .info-item { background: #f0fdfa; border-radius: 10px; padding: 12px; }
  .info-item .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .info-item .value { font-size: 14px; font-weight: 600; color: #0f172a; }
  .session { background: white; border-radius: 12px; padding: 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
  .session-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .session-date { font-weight: 700; color: #0d9488; font-size: 15px; }
  .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .status.completed { background: #dcfce7; color: #16a34a; }
  .status.scheduled { background: #dbeafe; color: #2563eb; }
  .soap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
  .soap-item { background: #f8fafc; border-radius: 8px; padding: 10px; }
  .soap-label { font-size: 11px; font-weight: 700; color: #0d9488; margin-bottom: 4px; }
  .soap-text { font-size: 13px; color: #475569; }
  .pain-bar { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
  .pain-label { font-size: 12px; color: #64748b; width: 80px; }
  .pain-track { flex: 1; background: #e2e8f0; border-radius: 10px; height: 8px; }
  .pain-fill-before { background: linear-gradient(90deg, #ef4444, #f97316); border-radius: 10px; height: 8px; }
  .pain-fill-after { background: linear-gradient(90deg, #0d9488, #06b6d4); border-radius: 10px; height: 8px; }
  .exercise { background: #f0fdfa; border-radius: 10px; padding: 14px; margin-bottom: 10px; border: 1px solid #99f6e4; }
  .exercise h4 { color: #0d9488; font-weight: 700; margin-bottom: 6px; }
  .exercise-meta { display: flex; gap: 10px; margin-bottom: 6px; }
  .exercise-tag { background: #0d9488; color: white; border-radius: 6px; padding: 2px 8px; font-size: 11px; }
  .exercise p { font-size: 13px; color: #475569; }
  .summary-box { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 10px; padding: 14px; margin-top: 10px; border: 1px solid #bae6fd; }
  .summary-box p { font-size: 13px; color: #0c4a6e; line-height: 1.6; }
  .footer { text-align: center; padding: 30px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
  .footer strong { color: #0d9488; }
</style>
</head>
<body>
<div class="header">
  <h1>🏥 PhysioAI Pro</h1>
  <p>Patient Clinical Report</p>
  <div class="badge">Generated: ${new Date().toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
</div>
<div class="content">
  <div class="card">
    <h2>Patient Information</h2>
    <div class="info-grid">
      <div class="info-item"><div class="label">Full Name</div><div class="value">${patient.name}</div></div>
      <div class="info-item"><div class="label">Age</div><div class="value">${patient.age || 'N/A'}</div></div>
      <div class="info-item"><div class="label">Phone</div><div class="value">${patient.phone || 'N/A'}</div></div>
      <div class="info-item"><div class="label">Email</div><div class="value">${patient.email || 'N/A'}</div></div>
      <div class="info-item"><div class="label">Condition</div><div class="value">${patient.condition || 'N/A'}</div></div>
      <div class="info-item"><div class="label">Diagnosis</div><div class="value">${patient.diagnosis || 'N/A'}</div></div>
    </div>
  </div>

  ${assignedEx.length > 0 ? `
  <div class="card">
    <h2>Home Exercise Program</h2>
    ${assignedEx.map(ex => `
    <div class="exercise">
      <h4>${ex.name}</h4>
      <div class="exercise-meta">
        <span class="exercise-tag">Sets: ${ex.sets}</span>
        <span class="exercise-tag">Reps: ${ex.reps}</span>
        <span class="exercise-tag">${ex.difficulty}</span>
      </div>
      <p>${ex.description}</p>
    </div>`).join('')}
  </div>` : ''}

  <div class="card">
    <h2>Session History (${appts.length} Sessions)</h2>
    ${appts.length === 0 ? '<p style="color:#94a3b8">No sessions recorded yet.</p>' : appts.map(a => `
    <div class="session">
      <div class="session-header">
        <div class="session-date">📅 ${a.date} ${a.time ? 'at ' + a.time : ''}</div>
        <span class="status ${a.status === 'Completed' ? 'completed' : 'scheduled'}">${a.status}</span>
      </div>
      ${(a.pain_before || a.painBefore) ? `
      <div class="pain-bar">
        <span class="pain-label">Pain Before</span>
        <div class="pain-track"><div class="pain-fill-before" style="width:${(parseInt(a.pain_before || a.painBefore) || 0) * 10}%"></div></div>
        <span style="font-size:13px;font-weight:700;color:#ef4444">${a.pain_before || a.painBefore}/10</span>
      </div>
      <div class="pain-bar">
        <span class="pain-label">Pain After</span>
        <div class="pain-track"><div class="pain-fill-after" style="width:${(parseInt(a.pain_after || a.painAfter) || 0) * 10}%"></div></div>
        <span style="font-size:13px;font-weight:700;color:#0d9488">${a.pain_after || a.painAfter}/10</span>
      </div>` : ''}
      ${(a.soap_s || a.soap_o || a.soap_a || a.soap_p) ? `
      <div class="soap-grid">
        ${a.soap_s ? `<div class="soap-item"><div class="soap-label">S - Subjective</div><div class="soap-text">${a.soap_s}</div></div>` : ''}
        ${a.soap_o ? `<div class="soap-item"><div class="soap-label">O - Objective</div><div class="soap-text">${a.soap_o}</div></div>` : ''}
        ${a.soap_a ? `<div class="soap-item"><div class="soap-label">A - Assessment</div><div class="soap-text">${a.soap_a}</div></div>` : ''}
        ${a.soap_p ? `<div class="soap-item"><div class="soap-label">P - Plan</div><div class="soap-text">${a.soap_p}</div></div>` : ''}
      </div>` : ''}
      ${a.summary ? `<div class="summary-box"><p>🤖 <strong>AI Summary:</strong> ${a.summary}</p></div>` : ''}
    </div>`).join('')}
  </div>
</div>
<div class="footer">
  <strong>PhysioAI Pro</strong> — Advanced Physiotherapy Clinic Management System<br/>
  This report is confidential and intended for medical use only.
</div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = patient.name.replace(/ /g, '-') + '-report.html'
  a.click()
  URL.revokeObjectURL(url)
}

export default function PhysioSystem() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [view, setView] = useState('dashboard')
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedAppt, setExpandedAppt] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [saveStatus, setSaveStatus] = useState({})
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', email: '', age: '', condition: '', diagnosis: '' })
  const [newAppt, setNewAppt] = useState({ patientId: '', date: '', time: '09:00', type: 'Clinic' })
  const [newExercise, setNewExercise] = useState({ name: '', condition: '', difficulty: 'Easy', sets: 3, reps: 10, description: '', youtube: '' })

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()

  useEffect(() => { if (isLoggedIn) loadAll() }, [isLoggedIn])

  async function loadAll() {
    setLoading(true)
    try {
      const [p, a, e] = await Promise.all([api('/patients'), api('/appointments'), api('/exercises')])
      setPatients(Array.isArray(p) ? p.map(x => ({ ...x, assignedExercises: JSON.parse(x.assigned_exercises || '[]') })) : [])
      setAppointments(Array.isArray(a) ? a.map(x => ({ ...x, soap: { s: x.soap_s || '', o: x.soap_o || '', a: x.soap_a || '', p: x.soap_p || '' } })) : [])
      setExercises(Array.isArray(e) ? e : [])
    } catch (err) {
      console.error('Load error:', err)
      setPatients([])
      setAppointments([])
      setExercises([])
    }
    setLoading(false)
  }

  function handleLogin() {
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('Invalid username or password')
    }
  }

  async function addPatient() {
    if (!newPatient.name || !newPatient.phone) return alert('Name and phone required')
    const p = await api('/patients', 'POST', newPatient)
    setPatients([{ ...p, assignedExercises: [] }, ...patients])
    setNewPatient({ name: '', phone: '', email: '', age: '', condition: '', diagnosis: '' })
  }

  async function deletePatient(id) {
    if (!window.confirm('Delete this patient?')) return
    await api('/patients/' + id, 'DELETE')
    setPatients(patients.filter(p => p.id !== id))
  }

  async function addAppointment() {
    if (!newAppt.patientId || !newAppt.date) return alert('Select patient and date')
    const patient = patients.find(p => p.id === parseInt(newAppt.patientId))
    const a = await api('/appointments', 'POST', { ...newAppt, patientName: patient.name })
    setAppointments([{ ...a, soap: { s: '', o: '', a: '', p: '' } }, ...appointments])
    setNewAppt({ patientId: '', date: '', time: '09:00', type: 'Clinic' })
  }

  async function saveAppt(appt) {
    setSaveStatus(s => ({ ...s, [appt.id]: 'saving' }))
    await api('/appointments/' + appt.id, 'PUT', {
      status: appt.status,
      soap_s: appt.soap.s,
      soap_o: appt.soap.o,
      soap_a: appt.soap.a,
      soap_p: appt.soap.p,
      pain_before: appt.painBefore || appt.pain_before || '',
      pain_after: appt.painAfter || appt.pain_after || '',
      summary: appt.summary || '',
    })
    setSaveStatus(s => ({ ...s, [appt.id]: 'saved' }))
    setTimeout(() => setSaveStatus(s => ({ ...s, [appt.id]: '' })), 2000)
  }

  function updateApptLocal(id, field, value) {
    setAppointments(appointments.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  function updateSoapLocal(id, field, value) {
    setAppointments(appointments.map(a => a.id === id ? { ...a, soap: { ...a.soap, [field]: value } } : a))
  }

  async function togglePatientExercise(patientId, exerciseId) {
    const patient = patients.find(p => p.id === patientId)
    const has = patient.assignedExercises.includes(exerciseId)
    const updated = has ? patient.assignedExercises.filter(e => e !== exerciseId) : [...patient.assignedExercises, exerciseId]
    setPatients(patients.map(p => p.id === patientId ? { ...p, assignedExercises: updated } : p))
    await api('/patients/' + patientId, 'PUT', { assigned_exercises: updated })
  }

  async function addExercise() {
    if (!newExercise.name) return alert('Exercise name required')
    const e = await api('/exercises', 'POST', newExercise)
    setExercises([...exercises, e])
    setNewExercise({ name: '', condition: '', difficulty: 'Easy', sets: 3, reps: 10, description: '', youtube: '' })
  }

  async function generateSummary(appt) {
    setLoadingId(appt.id)
    const data = await api('/summary', 'POST', {
      patientName: appt.patient_name || appt.patientName,
      soap_s: appt.soap.s,
      soap_o: appt.soap.o,
      soap_a: appt.soap.a,
      soap_p: appt.soap.p,
      pain_before: appt.painBefore || appt.pain_before || '',
      pain_after: appt.painAfter || appt.pain_after || '',
    })
    const updated = appointments.map(a => a.id === appt.id ? { ...a, summary: data.summary } : a)
    setAppointments(updated)
    const updatedAppt = updated.find(a => a.id === appt.id)
    if (updatedAppt) await saveAppt(updatedAppt)
    setLoadingId(null)
  }

  function shareExercisesWhatsApp(patient) {
    const assigned = exercises.filter(e => patient.assignedExercises.includes(e.id))
    if (assigned.length === 0) return alert('No exercises assigned to this patient')
    const lines = assigned.map((e, i) =>
      (i + 1) + '. *' + e.name + '* (' + e.difficulty + ')%0A' +
      '   Sets: ' + e.sets + ' | Reps: ' + e.reps + '%0A' +
      '   ' + e.description
    ).join('%0A%0A')
    const msg =
      'Assalamu Alaikum ' + patient.name + ',%0A%0A' +
      'Here is your *Home Exercise Program* from PhysioAI Pro:%0A%0A' +
      lines + '%0A%0A' +
      '*Instructions:*%0A' +
      '- Perform exercises daily unless advised otherwise%0A' +
      '- Stop if you feel sharp pain%0A' +
      'Get well soon! 💪%0A' +
      'PhysioAI Pro Clinic'
    window.open('https://wa.me/' + patient.phone + '?text=' + msg, '_blank')
  }

  function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
  function getFirstDay(y, m) { return new Date(y, m, 1).getDay() }
  function fmtDate(y, m, d) { return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0') }
  function apptCountForDay(ds) { return appointments.filter(a => a.date === ds).length }

  const todayAppts = appointments.filter(a => a.date === todayStr)
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || (p.phone || '').includes(search)
  )

  if (!isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-xl border border-teal-100">
        <div className="flex items-center justify-center mb-2">
          <div className="bg-teal-500 text-white rounded-xl p-3 mr-3"><Activity size={28} /></div>
          <div>
            <h1 className="text-2xl font-bold text-teal-700">PhysioAI Pro</h1>
            <p className="text-teal-400 text-sm">Clinic Management System</p>
          </div>
        </div>
        <p className="text-center text-gray-400 text-xs mb-6">Login: admin / physio123</p>
        <input className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 text-gray-800 outline-none focus:border-teal-400"
          placeholder="Username" value={loginUser} onChange={e => setLoginUser(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        <input className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-2 text-gray-800 outline-none focus:border-teal-400"
          type="password" placeholder="Password" value={loginPass} onChange={e => setLoginPass(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        {loginError && <p className="text-red-500 text-xs mb-2 text-center">{loginError}</p>}
        <button onClick={handleLogin} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg transition mt-2">Login</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex">
      <div className="fixed left-0 top-0 h-full w-16 bg-teal-600 flex flex-col items-center py-4 gap-2 z-10 shadow-lg">
        <div className="bg-teal-700 rounded-xl p-2 mb-3"><Activity size={22} className="text-white" /></div>
        {[
          { id: 'dashboard', icon: BarChart2 },
          { id: 'patients', icon: Users },
          { id: 'appointments', icon: Calendar },
          { id: 'exercises', icon: BookOpen },
          { id: 'reports', icon: Activity },
        ].map(({ id, icon: Icon }) => (
          <button key={id} onClick={() => setView(id)}
            className={'p-3 rounded-xl transition w-12 flex items-center justify-center ' + (view === id ? 'bg-white text-teal-600' : 'text-teal-100 hover:bg-teal-500')}>
            <Icon size={20} />
          </button>
        ))}
        <button onClick={() => setIsLoggedIn(false)} className="mt-auto p-3 text-teal-100 hover:text-red-300"><LogOut size={20} /></button>
      </div>

      <div className="ml-16 p-6 w-full">
        {loading && <div className="text-center py-20 text-teal-500 font-semibold">Loading...</div>}

        {/* DASHBOARD */}
        {!loading && view === 'dashboard' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-gray-400 text-sm">{today.toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Patients', value: patients.length, color: 'teal' },
                { label: "Today's Appointments", value: todayAppts.length, color: 'blue' },
                { label: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, color: 'green' },
                { label: 'Total Appointments', value: appointments.length, color: 'purple' },
              ].map(({ label, value, color }) => (
                <div key={label} className={'bg-white rounded-xl p-4 shadow-sm border-l-4 border-' + color + '-500'}>
                  <p className="text-gray-400 text-sm">{label}</p>
                  <p className="text-3xl font-bold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 text-xl">&#8249;</button>
                  <h3 className="font-bold text-gray-800">{MONTHS[month]} {year}</h3>
                  <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600 text-xl">&#8250;</button>
                </div>
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array(getFirstDay(year, month)).fill(null).map((_, i) => <div key={'e' + i} />)}
                  {Array(getDaysInMonth(year, month)).fill(null).map((_, i) => {
                    const day = i + 1
                    const ds = fmtDate(year, month, day)
                    const count = apptCountForDay(ds)
                    const isToday = ds === todayStr
                    return (
                      <div key={day} className={'text-center py-1 rounded-lg text-sm relative ' + (isToday ? 'bg-teal-500 text-white font-bold' : count > 0 ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-600 hover:bg-gray-50')}>
                        {day}
                        {count > 0 && !isToday && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-400 rounded-full" />}
                      </div>
                    )
                  })}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Today's Schedule</h3>
                {todayAppts.length === 0 ? (
                  <div className="text-center text-gray-400 py-8"><Calendar size={32} className="mx-auto mb-2 opacity-30" /><p>No appointments today</p></div>
                ) : (
                  <div className="grid gap-2">
                    {todayAppts.sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(appt => (
                      <div key={appt.id} className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                        <div className="bg-teal-500 text-white rounded-lg px-2 py-1 text-xs font-bold">{appt.time}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-800">{appt.patient_name || appt.patientName}</p>
                          <p className="text-xs text-gray-400">{appt.type}</p>
                        </div>
                        <span className={'text-xs px-2 py-1 rounded-full ' + (appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>{appt.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PATIENTS */}
        {!loading && view === 'patients' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Patients</h2>
            <div className="flex items-center bg-white rounded-lg px-3 mb-4 shadow-sm border border-gray-100">
              <Search size={16} className="text-gray-400 mr-2" />
              <input className="bg-transparent py-2 outline-none flex-1 text-gray-800" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="bg-white rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-3 gap-3 shadow-sm">
              <h3 className="col-span-full font-semibold text-teal-600">Add New Patient</h3>
              {['name', 'phone', 'email', 'age', 'condition', 'diagnosis'].map(field => (
                <input key={field} className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 capitalize" placeholder={field}
                  value={newPatient[field]} onChange={e => setNewPatient({ ...newPatient, [field]: e.target.value })} />
              ))}
              <button onClick={addPatient} className="col-span-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Plus size={16} /> Add Patient
              </button>
            </div>
            <div className="grid gap-3">
              {filteredPatients.map(p => (
                <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{p.name}</p>
                      <p className="text-gray-400 text-sm">{p.condition} | {p.diagnosis}</p>
                      <div className="flex gap-3 mt-1 text-gray-400 text-xs">
                        <span className="flex items-center gap-1"><Phone size={12} />{p.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={12} />{p.email}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Assign Exercises (click to toggle):</p>
                        <div className="flex flex-wrap gap-2">
                          {exercises.map(ex => (
                            <button key={ex.id} onClick={() => togglePatientExercise(p.id, ex.id)}
                              className={'text-xs px-3 py-1 rounded-full border transition font-medium ' + (p.assignedExercises.includes(ex.id) ? 'bg-teal-500 text-white border-teal-500 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300 hover:text-teal-500')}>
                              {p.assignedExercises.includes(ex.id) ? '✓ ' : '+ '}{ex.name}
                            </button>
                          ))}
                        </div>
                        {p.assignedExercises.length > 0 && (
                          <p className="text-xs text-teal-500 mt-2">{p.assignedExercises.length} exercise(s) assigned</p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button onClick={() => shareExercisesWhatsApp(p)} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg">WhatsApp</button>
                      <button onClick={() => exportPDF(p, appointments, exercises)} className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg">Export PDF</button>
                      <button onClick={() => deletePatient(p.id)} className="text-red-400 hover:text-red-500 p-1 flex items-center justify-center"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {!loading && view === 'appointments' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Appointments</h2>
            <div className="bg-white rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3 shadow-sm">
              <h3 className="col-span-full font-semibold text-teal-600">Book Appointment</h3>
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400"
                value={newAppt.patientId} onChange={e => setNewAppt({ ...newAppt, patientId: e.target.value })}>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="date" className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400"
                value={newAppt.date} onChange={e => setNewAppt({ ...newAppt, date: e.target.value })} />
              <input type="time" className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400"
                value={newAppt.time} onChange={e => setNewAppt({ ...newAppt, time: e.target.value })} />
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400"
                value={newAppt.type} onChange={e => setNewAppt({ ...newAppt, type: e.target.value })}>
                <option>Clinic</option><option>Home Visit</option>
              </select>
              <button onClick={addAppointment} className="col-span-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Plus size={16} /> Book Appointment
              </button>
            </div>
            <div className="grid gap-3">
              {appointments.sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))).map(appt => (
                <div key={appt.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedAppt(expandedAppt === appt.id ? null : appt.id)}>
                    <div className="flex items-center gap-3">
                      <div className="bg-teal-50 rounded-lg p-2 text-center min-w-fit">
                        <p className="text-teal-600 font-bold text-sm">{appt.time}</p>
                        <p className="text-gray-400 text-xs">{appt.date}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{appt.patient_name || appt.patientName}</p>
                        <p className="text-gray-400 text-sm">{appt.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {saveStatus[appt.id] === 'saving' && <span className="text-xs text-yellow-500">Saving...</span>}
                      {saveStatus[appt.id] === 'saved' && <span className="text-xs text-green-500">✓ Saved</span>}
                      <span className={'text-xs px-2 py-1 rounded-full ' + (appt.status === 'Completed' ? 'bg-green-100 text-green-700' : appt.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700')}>
                        {appt.status}
                      </span>
                      {expandedAppt === appt.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                  {expandedAppt === appt.id && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-4 grid gap-4">
                      <select className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 w-full"
                        value={appt.status} onChange={e => { updateApptLocal(appt.id, 'status', e.target.value); saveAppt({ ...appt, status: e.target.value }) }}>
                        <option>Scheduled</option><option>Accepted</option><option>In Progress</option><option>Completed</option>
                      </select>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Pain Before (0-10)</label>
                          <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 w-full"
                            value={appt.painBefore || appt.pain_before || ''} onChange={e => updateApptLocal(appt.id, 'painBefore', e.target.value)}
                            onBlur={() => saveAppt(appt)} placeholder="0-10" />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Pain After (0-10)</label>
                          <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 w-full"
                            value={appt.painAfter || appt.pain_after || ''} onChange={e => updateApptLocal(appt.id, 'painAfter', e.target.value)}
                            onBlur={() => saveAppt(appt)} placeholder="0-10" />
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 grid gap-3">
                        <p className="font-bold text-teal-600 text-sm">SOAP Notes</p>
                        {[
                          { key: 's', label: 'S - Subjective', placeholder: 'What the patient reports...' },
                          { key: 'o', label: 'O - Objective', placeholder: 'Observable findings...' },
                          { key: 'a', label: 'A - Assessment', placeholder: 'Clinical interpretation...' },
                          { key: 'p', label: 'P - Plan', placeholder: 'Treatment plan and next steps...' },
                        ].map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                            <textarea className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 w-full h-16 resize-none text-sm"
                              placeholder={placeholder} value={appt.soap[key]}
                              onChange={e => updateSoapLocal(appt.id, key, e.target.value)}
                              onBlur={() => saveAppt(appt)} />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => generateSummary(appt)} disabled={loadingId === appt.id}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                          {loadingId === appt.id ? 'Generating...' : 'AI Summary'}
                        </button>
                        <button onClick={() => saveAppt(appt)}
                          className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                          Save Notes
                        </button>
                        <button onClick={() => {
                          const patient = patients.find(p => p.id === (appt.patient_id || appt.patientId))
                          if (patient) {
                            const msg = 'Assalamu Alaikum ' + (appt.patient_name || appt.patientName) + ', your physiotherapy appointment is on ' + appt.date + ' at ' + appt.time + '. Type: ' + appt.type + '. Please confirm. Thank you, PhysioAI Pro Clinic.'
                            window.open('https://wa.me/' + patient.phone + '?text=' + encodeURIComponent(msg), '_blank')
                          }
                        }} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                          WhatsApp
                        </button>
                      </div>
                      {appt.summary && (
                        <div className="bg-purple-50 rounded-lg p-3 text-sm text-gray-700 border border-purple-100">
                          <p className="text-purple-600 font-semibold mb-1">AI Summary</p>
                          {appt.summary}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXERCISES */}
        {!loading && view === 'exercises' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Exercise Library</h2>
            <div className="bg-white rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 shadow-sm">
              <h3 className="col-span-full font-semibold text-teal-600">Add Exercise</h3>
              {[
                { field: 'name', placeholder: 'Exercise name' },
                { field: 'condition', placeholder: 'Condition (e.g. Back Pain)' },
                { field: 'description', placeholder: 'Instructions' },
                { field: 'youtube', placeholder: 'YouTube embed URL (optional)' },
              ].map(({ field, placeholder }) => (
                <input key={field} className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400" placeholder={placeholder}
                  value={newExercise[field]} onChange={e => setNewExercise({ ...newExercise, [field]: e.target.value })} />
              ))}
              <input type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400" placeholder="Sets"
                value={newExercise.sets} onChange={e => setNewExercise({ ...newExercise, sets: e.target.value })} />
              <input type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400" placeholder="Reps"
                value={newExercise.reps} onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })} />
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400"
                value={newExercise.difficulty} onChange={e => setNewExercise({ ...newExercise, difficulty: e.target.value })}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
              <button onClick={addExercise} className="col-span-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Plus size={16} /> Add Exercise
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {exercises.map(ex => (
                <div key={ex.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-800">{ex.name}</p>
                    <span className={'text-xs px-2 py-1 rounded-full ' + (ex.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : ex.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
                      {ex.difficulty}
                    </span>
                  </div>
                  <p className="text-teal-600 text-xs font-semibold mb-1">{ex.condition}</p>
                  <p className="text-gray-500 text-sm mb-2">{ex.description}</p>
                  <div className="flex gap-3 text-xs">
                    <span className="bg-gray-50 px-2 py-1 rounded-lg text-gray-500">Sets: {ex.sets}</span>
                    <span className="bg-gray-50 px-2 py-1 rounded-lg text-gray-500">Reps: {ex.reps}</span>
                  </div>
                  {ex.youtube && <iframe className="mt-3 w-full rounded-lg" height="150" src={ex.youtube} allowFullScreen />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {!loading && view === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Reports</h2>
            <div className="grid gap-4">
              {patients.map(p => {
                const patientAppts = appointments.filter(a => (a.patient_id || a.patientId) === p.id)
                const painData = patientAppts.filter(a => a.pain_before || a.painBefore).map((a, i) => ({
                  session: 'S' + (i + 1),
                  before: parseInt(a.pain_before || a.painBefore) || 0,
                  after: parseInt(a.pain_after || a.painAfter) || 0
                }))
                return (
                  <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-gray-400 text-sm">{p.condition} | {patientAppts.length} sessions</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => shareExercisesWhatsApp(p)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs">WhatsApp Program</button>
                        <button onClick={() => exportPDF(p, appointments, exercises)} className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg text-sm">Export PDF</button>
                      </div>
                    </div>
                    {painData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={painData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="session" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" domain={[0, 10]} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }} />
                          <Line type="monotone" dataKey="before" stroke="#ef4444" strokeWidth={2} name="Pain Before" />
                          <Line type="monotone" dataKey="after" stroke="#14b8a6" strokeWidth={2} name="Pain After" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-gray-400 text-sm text-center py-4">No pain data recorded yet</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}