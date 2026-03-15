import { useState, useEffect, useRef } from 'react'
import { Users, Calendar, Activity, BookOpen, BarChart2, LogOut, Plus, Search, Phone, Mail, Trash2, ChevronDown, ChevronUp, Settings, X, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DEFAULT_USER = 'admin'
const DEFAULT_PASS = 'physio123'

async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch('/api' + path, opts)
  return res.json()
}

// Pain body map component
function BodyPainMap({ painPoints, onAddPoint, onRemovePoint }) {
  const [activeView, setActiveView] = useState('front')
  const svgRef = useRef(null)

  function handleClick(e) {
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width * 200).toFixed(1)
    const y = ((e.clientY - rect.top) / rect.height * 400).toFixed(1)
    onAddPoint({ x: parseFloat(x), y: parseFloat(y), view: activeView, intensity: 5 })
  }

  const viewPoints = painPoints.filter(p => p.view === activeView)

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-800">Pain Map</p>
        <div className="flex gap-2">
          <button onClick={() => setActiveView('front')} className={'text-xs px-3 py-1 rounded-full ' + (activeView === 'front' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600')}>Front</button>
          <button onClick={() => setActiveView('back')} className={'text-xs px-3 py-1 rounded-full ' + (activeView === 'back' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600')}>Back</button>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-3 text-center">Click on the body to mark pain points</p>
      <div className="flex justify-center">
        <svg ref={svgRef} viewBox="0 0 200 400" width="160" height="320"
          onClick={handleClick} className="cursor-crosshair border border-gray-100 rounded-xl bg-gray-50">
          {activeView === 'front' ? (
            <g fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <ellipse cx="100" cy="35" rx="22" ry="28" fill="#e2e8f0" />
              <rect x="72" y="62" width="56" height="70" rx="8" fill="#e2e8f0" />
              <rect x="38" y="65" width="32" height="60" rx="8" fill="#e2e8f0" />
              <rect x="130" y="65" width="32" height="60" rx="8" fill="#e2e8f0" />
              <rect x="78" y="130" width="22" height="80" rx="8" fill="#e2e8f0" />
              <rect x="100" y="130" width="22" height="80" rx="8" fill="#e2e8f0" />
              <rect x="72" y="208" width="24" height="90" rx="8" fill="#e2e8f0" />
              <rect x="104" y="208" width="24" height="90" rx="8" fill="#e2e8f0" />
              <text x="100" y="20" textAnchor="middle" fontSize="8" fill="#94a3b8">FRONT</text>
            </g>
          ) : (
            <g fill="none" stroke="#94a3b8" strokeWidth="1.5">
              <ellipse cx="100" cy="35" rx="22" ry="28" fill="#e2e8f0" />
              <rect x="72" y="62" width="56" height="70" rx="8" fill="#e2e8f0" />
              <rect x="38" y="65" width="32" height="60" rx="8" fill="#e2e8f0" />
              <rect x="130" y="65" width="32" height="60" rx="8" fill="#e2e8f0" />
              <rect x="78" y="130" width="22" height="80" rx="8" fill="#e2e8f0" />
              <rect x="100" y="130" width="22" height="80" rx="8" fill="#e2e8f0" />
              <rect x="72" y="208" width="24" height="90" rx="8" fill="#e2e8f0" />
              <rect x="104" y="208" width="24" height="90" rx="8" fill="#e2e8f0" />
              <text x="100" y="20" textAnchor="middle" fontSize="8" fill="#94a3b8">BACK</text>
            </g>
          )}
          {viewPoints.map((pt, i) => (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r="12"
                fill={'rgba(239,68,68,' + (pt.intensity / 10) + ')'}
                stroke="#ef4444" strokeWidth="1" />
              <circle cx={pt.x} cy={pt.y} r="4" fill="#ef4444" />
              <text x={pt.x} y={pt.y + 1} textAnchor="middle" fontSize="6" fill="white" dominantBaseline="middle">{pt.intensity}</text>
            </g>
          ))}
        </svg>
      </div>
      {viewPoints.length > 0 && (
        <div className="mt-3 grid gap-2">
          {viewPoints.map((pt, i) => (
            <div key={i} className="flex items-center gap-2 bg-red-50 rounded-lg px-3 py-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <span className="text-xs text-gray-600 flex-1">Point {i + 1} — Intensity: {pt.intensity}/10</span>
              <input type="range" min="1" max="10" value={pt.intensity}
                onChange={e => onAddPoint({ ...pt, intensity: parseInt(e.target.value) }, i)}
                className="w-20" />
              <button onClick={() => onRemovePoint(i, activeView)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function exportPDF(patient, appointments, exercises, schedules) {
  const appts = appointments.filter(a => (a.patient_id || a.patientId) === patient.id && !a.cancelled)
  const assignedEx = exercises.filter(e => {
    try { return JSON.parse(patient.assigned_exercises || '[]').includes(e.id) } catch { return false }
  })
  const patientSchedule = schedules.filter(s => s.patient_id === patient.id)

  const html = `<!DOCTYPE html>
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
  .badge { display: inline-block; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 4px 14px; font-size: 12px; margin-top: 10px; }
  .content { padding: 30px; }
  .card { background: white; border-radius: 16px; padding: 24px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); border-left: 5px solid #0d9488; }
  .card h2 { font-size: 16px; font-weight: 700; color: #0d9488; margin-bottom: 16px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .info-item { background: #f0fdfa; border-radius: 10px; padding: 12px; }
  .info-item .label { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
  .info-item .value { font-size: 14px; font-weight: 600; }
  .session { background: white; border-radius: 12px; padding: 20px; margin-bottom: 12px; border: 1px solid #e2e8f0; }
  .session-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
  .session-date { font-weight: 700; color: #0d9488; }
  .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #dcfce7; color: #16a34a; }
  .soap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
  .soap-item { background: #f8fafc; border-radius: 8px; padding: 10px; }
  .soap-label { font-size: 11px; font-weight: 700; color: #0d9488; margin-bottom: 4px; }
  .pain-bar { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
  .pain-label { font-size: 12px; color: #64748b; width: 80px; }
  .pain-track { flex: 1; background: #e2e8f0; border-radius: 10px; height: 8px; }
  .pain-fill-before { background: linear-gradient(90deg, #ef4444, #f97316); border-radius: 10px; height: 8px; }
  .pain-fill-after { background: linear-gradient(90deg, #0d9488, #06b6d4); border-radius: 10px; height: 8px; }
  .exercise { background: #f0fdfa; border-radius: 10px; padding: 14px; margin-bottom: 10px; border: 1px solid #99f6e4; }
  .exercise h4 { color: #0d9488; font-weight: 700; margin-bottom: 6px; }
  .exercise-meta { display: flex; gap: 10px; margin-bottom: 6px; }
  .exercise-tag { background: #0d9488; color: white; border-radius: 6px; padding: 2px 8px; font-size: 11px; }
  .schedule-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; margin-top: 12px; }
  .schedule-day { background: #f0fdfa; border-radius: 8px; padding: 8px; text-align: center; }
  .schedule-day .day-name { font-size: 11px; font-weight: 700; color: #0d9488; margin-bottom: 6px; }
  .schedule-ex { font-size: 10px; background: #0d9488; color: white; border-radius: 4px; padding: 2px 4px; margin-top: 2px; }
  .summary-box { background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 10px; padding: 14px; margin-top: 10px; border: 1px solid #bae6fd; }
  .footer { text-align: center; padding: 30px; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
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
    <h2>👤 Patient Information</h2>
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
    <h2>💪 Home Exercise Program</h2>
    ${assignedEx.map(ex => `
    <div class="exercise">
      <h4>${ex.name}</h4>
      <div class="exercise-meta">
        <span class="exercise-tag">Sets: ${ex.sets}</span>
        <span class="exercise-tag">Reps: ${ex.reps}</span>
        <span class="exercise-tag">${ex.difficulty}</span>
      </div>
      <p style="font-size:13px;color:#475569">${ex.description}</p>
    </div>`).join('')}
    ${patientSchedule.length > 0 ? `
    <h3 style="margin-top:16px;margin-bottom:8px;font-size:14px;color:#0d9488">Weekly Schedule</h3>
    <div class="schedule-grid">
      ${WEEK_DAYS.map(day => {
        const dayExercises = patientSchedule.filter(s => s.day_of_week === day)
        return `<div class="schedule-day">
          <div class="day-name">${day.slice(0,3)}</div>
          ${dayExercises.map(s => {
            const ex = exercises.find(e => e.id === s.exercise_id)
            return ex ? `<div class="schedule-ex">${ex.name.slice(0,8)}</div>` : ''
          }).join('')}
          ${dayExercises.length === 0 ? '<div style="font-size:10px;color:#cbd5e1">Rest</div>' : ''}
        </div>`
      }).join('')}
    </div>` : ''}
  </div>` : ''}
  <div class="card">
    <h2>📋 Session History (${appts.length} Sessions)</h2>
    ${appts.length === 0 ? '<p style="color:#94a3b8">No sessions recorded yet.</p>' : appts.map(a => `
    <div class="session">
      <div class="session-header">
        <div class="session-date">📅 ${a.date} ${a.time ? 'at ' + a.time : ''}</div>
        <span class="status">${a.status}</span>
      </div>
      ${(a.pain_before) ? `
      <div class="pain-bar">
        <span class="pain-label">Pain Before</span>
        <div class="pain-track"><div class="pain-fill-before" style="width:${(parseInt(a.pain_before) || 0) * 10}%"></div></div>
        <span style="font-size:13px;font-weight:700;color:#ef4444">${a.pain_before}/10</span>
      </div>
      <div class="pain-bar">
        <span class="pain-label">Pain After</span>
        <div class="pain-track"><div class="pain-fill-after" style="width:${(parseInt(a.pain_after) || 0) * 10}%"></div></div>
        <span style="font-size:13px;font-weight:700;color:#0d9488">${a.pain_after}/10</span>
      </div>` : ''}
      ${(a.soap_s || a.soap_o) ? `
      <div class="soap-grid">
        ${a.soap_s ? `<div class="soap-item"><div class="soap-label">S - Subjective</div><div style="font-size:13px;color:#475569">${a.soap_s}</div></div>` : ''}
        ${a.soap_o ? `<div class="soap-item"><div class="soap-label">O - Objective</div><div style="font-size:13px;color:#475569">${a.soap_o}</div></div>` : ''}
        ${a.soap_a ? `<div class="soap-item"><div class="soap-label">A - Assessment</div><div style="font-size:13px;color:#475569">${a.soap_a}</div></div>` : ''}
        ${a.soap_p ? `<div class="soap-item"><div class="soap-label">P - Plan</div><div style="font-size:13px;color:#475569">${a.soap_p}</div></div>` : ''}
      </div>` : ''}
      ${a.summary ? `<div class="summary-box"><p>🤖 <strong>AI Summary:</strong> ${a.summary}</p></div>` : ''}
    </div>`).join('')}
  </div>
</div>
<div class="footer">
  <strong style="color:#0d9488">PhysioAI Pro</strong> — Advanced Physiotherapy Clinic Management<br/>
  This report is confidential and intended for medical use only.
</div>
</body></html>`

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
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedAppt, setExpandedAppt] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [saveStatus, setSaveStatus] = useState({})
  const [cancelModal, setCancelModal] = useState(null)
  const [rescheduleModal, setRescheduleModal] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsUser, setSettingsUser] = useState('')
  const [settingsPass, setSettingsPass] = useState('')
  const [settingsConfirm, setSettingsConfirm] = useState('')
  const [credentials, setCredentials] = useState({ user: DEFAULT_USER, pass: DEFAULT_PASS })
  const [cancelReason, setCancelReason] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [expandedPatient, setExpandedPatient] = useState(null)
  const [painPoints, setPainPoints] = useState({})
  const [weekSchedule, setWeekSchedule] = useState({})
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', email: '', age: '', condition: '', diagnosis: '' })
  const [newAppt, setNewAppt] = useState({ patientId: '', date: '', time: '09:00', type: 'Clinic', is_recurring: false, recurring_days: [] })
  const [newExercise, setNewExercise] = useState({ name: '', condition: '', difficulty: 'Easy', sets: 3, reps: 10, description: '', youtube: '' })
  const [editPatient, setEditPatient] = useState(null)
  const [editExercise, setEditExercise] = useState(null)
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()

  // Auto logout after 30 minutes
  const logoutTimer = useRef(null)
  function resetTimer() {
    clearTimeout(logoutTimer.current)
    logoutTimer.current = setTimeout(() => {
      setIsLoggedIn(false)
      alert('You have been logged out due to inactivity.')
    }, 30 * 60 * 1000)
  }

  useEffect(() => {
    if (isLoggedIn) {
      loadAll()
      resetTimer()
      window.addEventListener('mousemove', resetTimer)
      window.addEventListener('keypress', resetTimer)
      return () => {
        window.removeEventListener('mousemove', resetTimer)
        window.removeEventListener('keypress', resetTimer)
        clearTimeout(logoutTimer.current)
      }
    }
  }, [isLoggedIn])

  async function loadAll() {
    setLoading(true)
    try {
      const [p, a, e, s] = await Promise.all([
        api('/patients'), api('/appointments'), api('/exercises'), api('/schedules')
      ])
      setPatients(Array.isArray(p) ? p.map(x => ({ ...x, assignedExercises: JSON.parse(x.assigned_exercises || '[]') })) : [])
      setAppointments(Array.isArray(a) ? a.map(x => ({ ...x, soap: { s: x.soap_s || '', o: x.soap_o || '', a: x.soap_a || '', p: x.soap_p || '' } })) : [])
      setExercises(Array.isArray(e) ? e : [])
      setSchedules(Array.isArray(s) ? s : [])
    } catch (err) {
      console.error('Load error:', err)
      setPatients([])
      setAppointments([])
      setExercises([])
      setSchedules([])
    }
    setLoading(false)
  }

  function handleLogin() {
    if (loginUser === credentials.user && loginPass === credentials.pass) {
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('Invalid username or password')
    }
  }

  function saveSettings() {
    if (!settingsUser || !settingsPass) return alert('Username and password required')
    if (settingsPass !== settingsConfirm) return alert('Passwords do not match')
    setCredentials({ user: settingsUser, pass: settingsPass })
    setSettingsUser('')
    setSettingsPass('')
    setSettingsConfirm('')
    setShowSettings(false)
    alert('Credentials updated successfully!')
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
  async function saveEditPatient() {
    if (!editPatient.name || !editPatient.phone) return alert('Name and phone required')
    await api('/patients/' + editPatient.id, 'PUT', editPatient)
    setPatients(patients.map(p => p.id === editPatient.id ? { ...editPatient, assignedExercises: p.assignedExercises } : p))
    setEditPatient(null)
  }

  async function saveEditExercise() {
    if (!editExercise.name) return alert('Exercise name required')
    await api('/exercises/' + editExercise.id, 'PUT', editExercise)
    setExercises(exercises.map(e => e.id === editExercise.id ? editExercise : e))
    setEditExercise(null)
  }

  async function deleteExercise(id) {
    if (!window.confirm('Delete this exercise?')) return
    await api('/exercises/' + id, 'DELETE')
    setExercises(exercises.filter(e => e.id !== id))
  }

  async function addAppointment() {
    if (!newAppt.patientId || !newAppt.date) return alert('Select patient and date')
    const patient = patients.find(p => p.id === parseInt(newAppt.patientId))
    const a = await api('/appointments', 'POST', {
      ...newAppt, patientName: patient.name,
      is_recurring: newAppt.is_recurring ? 1 : 0,
      recurring_days: newAppt.recurring_days.join(',')
    })
    setAppointments([{ ...a, soap: { s: '', o: '', a: '', p: '' } }, ...appointments])
    setNewAppt({ patientId: '', date: '', time: '09:00', type: 'Clinic', is_recurring: false, recurring_days: [] })
  }

  async function cancelAppointment() {
    if (!cancelModal) return
    const appt = appointments.find(a => a.id === cancelModal)
    const updated = { ...appt, status: 'Cancelled', cancelled: 1, cancel_reason: cancelReason, soap_s: appt.soap.s, soap_o: appt.soap.o, soap_a: appt.soap.a, soap_p: appt.soap.p, pain_before: appt.pain_before || '', pain_after: appt.pain_after || '', summary: appt.summary || '' }
    await api('/appointments/' + cancelModal, 'PUT', updated)
    setAppointments(appointments.map(a => a.id === cancelModal ? { ...a, status: 'Cancelled', cancelled: 1, cancel_reason: cancelReason } : a))
    setCancelModal(null)
    setCancelReason('')
  }

  async function rescheduleAppointment() {
    if (!rescheduleModal || !rescheduleDate) return alert('Please select a new date')
    const appt = appointments.find(a => a.id === rescheduleModal)
    const updated = { ...appt, status: 'Scheduled', soap_s: appt.soap.s, soap_o: appt.soap.o, soap_a: appt.soap.a, soap_p: appt.soap.p, pain_before: appt.pain_before || '', pain_after: appt.pain_after || '', summary: appt.summary || '' }
    await api('/appointments/' + rescheduleModal, 'PUT', { ...updated, date: rescheduleDate, time: rescheduleTime || appt.time })
    setAppointments(appointments.map(a => a.id === rescheduleModal ? { ...a, date: rescheduleDate, time: rescheduleTime || a.time, status: 'Scheduled' } : a))
    setRescheduleModal(null)
    setRescheduleDate('')
    setRescheduleTime('')
  }

  async function saveAppt(appt) {
    setSaveStatus(s => ({ ...s, [appt.id]: 'saving' }))
    await api('/appointments/' + appt.id, 'PUT', {
      status: appt.status,
      soap_s: appt.soap.s, soap_o: appt.soap.o, soap_a: appt.soap.a, soap_p: appt.soap.p,
      pain_before: appt.painBefore || appt.pain_before || '',
      pain_after: appt.painAfter || appt.pain_after || '',
      summary: appt.summary || '',
      cancelled: appt.cancelled || 0,
      cancel_reason: appt.cancel_reason || ''
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

  async function saveWeekSchedule(patientId) {
    const schedule = []
    const ws = weekSchedule[patientId] || {}
    WEEK_DAYS.forEach(day => {
      (ws[day] || []).forEach(exId => schedule.push({ exercise_id: exId, day }))
    })
    await api('/schedules', 'POST', { patient_id: patientId, schedule })
    const newSchedules = schedules.filter(s => s.patient_id !== patientId)
    schedule.forEach(s => newSchedules.push({ patient_id: patientId, exercise_id: s.exercise_id, day_of_week: s.day }))
    setSchedules(newSchedules)
    alert('Weekly schedule saved!')
  }

  function toggleScheduleExercise(patientId, day, exerciseId) {
    const ws = { ...weekSchedule }
    if (!ws[patientId]) ws[patientId] = {}
    if (!ws[patientId][day]) ws[patientId][day] = []
    const has = ws[patientId][day].includes(exerciseId)
    ws[patientId][day] = has ? ws[patientId][day].filter(e => e !== exerciseId) : [...ws[patientId][day], exerciseId]
    setWeekSchedule(ws)
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
      soap_s: appt.soap.s, soap_o: appt.soap.o, soap_a: appt.soap.a, soap_p: appt.soap.p,
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
    const patientSchedule = schedules.filter(s => s.patient_id === patient.id)
    const lines = assigned.map((e, i) =>
      (i + 1) + '. *' + e.name + '* (' + e.difficulty + ')%0A' +
      '   Sets: ' + e.sets + ' | Reps: ' + e.reps + '%0A' +
      '   ' + e.description
    ).join('%0A%0A')
    const scheduleLines = patientSchedule.length > 0 ? '%0A%0A*Weekly Schedule:*%0A' +
      WEEK_DAYS.map(day => {
        const dayEx = patientSchedule.filter(s => s.day_of_week === day)
        if (dayEx.length === 0) return day.slice(0, 3) + ': Rest'
        return day.slice(0, 3) + ': ' + dayEx.map(s => { const ex = exercises.find(e => e.id === s.exercise_id); return ex ? ex.name : '' }).join(', ')
      }).join('%0A') : ''
    const msg = 'Assalamu Alaikum ' + patient.name + ',%0A%0AHere is your *Home Exercise Program*:%0A%0A' + lines + scheduleLines + '%0A%0A- Stop if you feel sharp pain%0AGet well soon! 💪%0APhysioAI Pro Clinic'
    window.open('https://wa.me/' + patient.phone + '?text=' + msg, '_blank')
  }

  function handlePainPoint(patientId, point, index) {
    setPainPoints(prev => {
      const pts = [...(prev[patientId] || [])]
      if (index !== undefined) { pts[index] = point } else { pts.push(point) }
      return { ...prev, [patientId]: pts }
    })
  }

  function removePainPoint(patientId, index, view) {
    setPainPoints(prev => {
      const pts = (prev[patientId] || []).filter((p, i) => !(i === index && p.view === view))
      return { ...prev, [patientId]: pts }
    })
  }

  function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
  function getFirstDay(y, m) { return new Date(y, m, 1).getDay() }
  function fmtDate(y, m, d) { return y + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0') }
  function apptCountForDay(ds) { return appointments.filter(a => a.date === ds && !a.cancelled).length }

  const todayAppts = appointments.filter(a => a.date === todayStr && !a.cancelled)
  const activeAppts = appointments.filter(a => !a.cancelled)
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
        <input className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 text-gray-800 outline-none focus:border-teal-400 mt-6"
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
{/* Edit Patient Modal */}
      {editPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Edit Patient</h3>
              <button onClick={() => setEditPatient(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['name', 'phone', 'email', 'age', 'condition', 'diagnosis'].map(field => (
                <input key={field} className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 capitalize"
                  placeholder={field} value={editPatient[field] || ''}
                  onChange={e => setEditPatient({ ...editPatient, [field]: e.target.value })} />
              ))}
            </div>
            <button onClick={saveEditPatient} className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold mt-4">
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Edit Exercise Modal */}
      {editExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Edit Exercise</h3>
              <button onClick={() => setEditExercise(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400" placeholder="Exercise name"
                value={editExercise.name} onChange={e => setEditExercise({ ...editExercise, name: e.target.value })} />
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400" placeholder="Condition"
                value={editExercise.condition} onChange={e => setEditExercise({ ...editExercise, condition: e.target.value })} />
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 col-span-2" placeholder="Description"
                value={editExercise.description} onChange={e => setEditExercise({ ...editExercise, description: e.target.value })} />
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 col-span-2" placeholder="YouTube URL"
                value={editExercise.youtube || ''} onChange={e => setEditExercise({ ...editExercise, youtube: e.target.value })} />
              <input type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400" placeholder="Sets"
                value={editExercise.sets} onChange={e => setEditExercise({ ...editExercise, sets: e.target.value })} />
              <input type="number" className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400" placeholder="Reps"
                value={editExercise.reps} onChange={e => setEditExercise({ ...editExercise, reps: e.target.value })} />
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 col-span-2"
                value={editExercise.difficulty} onChange={e => setEditExercise({ ...editExercise, difficulty: e.target.value })}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <button onClick={saveEditExercise} className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold mt-4">
              Save Changes
            </button>
          </div>
        </div>
      )}
      {/* Cancel Modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-800 mb-4">Cancel Appointment</h3>
            <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none h-24 resize-none mb-4"
              placeholder="Reason for cancellation (optional)..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setCancelModal(null)} className="flex-1 border border-gray-200 py-2 rounded-lg text-gray-600 hover:bg-gray-50">Keep</button>
              <button onClick={cancelAppointment} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-semibold">Cancel Appointment</button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-gray-800 mb-4">Reschedule Appointment</h3>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none mb-3"
              value={rescheduleDate} onChange={e => setRescheduleDate(e.target.value)} />
            <input type="time" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none mb-4"
              value={rescheduleTime} onChange={e => setRescheduleTime(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={() => setRescheduleModal(null)} className="flex-1 border border-gray-200 py-2 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={rescheduleAppointment} className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold">Reschedule</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Change Login Credentials</h3>
              <button onClick={() => setShowSettings(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none mb-3"
              placeholder="New username" value={settingsUser} onChange={e => setSettingsUser(e.target.value)} />
            <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none mb-3"
              placeholder="New password" value={settingsPass} onChange={e => setSettingsPass(e.target.value)} />
            <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none mb-4"
              placeholder="Confirm new password" value={settingsConfirm} onChange={e => setSettingsConfirm(e.target.value)} />
            <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg mb-4">⚠️ Note: credentials reset on page refresh. For permanent change, update the code.</p>
            <button onClick={saveSettings} className="w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold">Save Credentials</button>
          </div>
        </div>
      )}

      {/* Sidebar */}
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
        <button onClick={() => setShowSettings(true)} className="p-3 text-teal-100 hover:bg-teal-500 rounded-xl" title="Settings"><Settings size={20} /></button>
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
                { label: 'Completed', value: activeAppts.filter(a => a.status === 'Completed').length, color: 'green' },
                { label: 'Total Appointments', value: activeAppts.length, color: 'purple' },
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
                <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{p.name}</p>
                      <p className="text-gray-400 text-sm">{p.condition} | {p.diagnosis}</p>
                      <div className="flex gap-3 mt-1 text-gray-400 text-xs">
                        <span className="flex items-center gap-1"><Phone size={12} />{p.phone}</span>
                        <span className="flex items-center gap-1"><Mail size={12} />{p.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button onClick={() => shareExercisesWhatsApp(p)} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg">WhatsApp</button>
                      <button onClick={() => exportPDF(p, appointments, exercises, schedules)} className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg">Export PDF</button>
                      <button onClick={() => setEditPatient({ ...p })} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg">Edit</button>
                      <button onClick={() => setExpandedPatient(expandedPatient === p.id ? null : p.id)} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-lg">
                        {expandedPatient === p.id ? 'Less' : 'More'}
                      </button>
                      <button onClick={() => deletePatient(p.id)} className="text-red-400 hover:text-red-500 p-1 flex items-center justify-center"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  {expandedPatient === p.id && (
                    <div className="border-t border-gray-100 p-4 grid gap-4">
                      {/* Exercise Assignment */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Assign Exercises:</p>
                        <div className="flex flex-wrap gap-2">
                          {exercises.map(ex => (
                            <button key={ex.id} onClick={() => togglePatientExercise(p.id, ex.id)}
                              className={'text-xs px-3 py-1 rounded-full border transition font-medium ' + (p.assignedExercises.includes(ex.id) ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300')}>
                              {p.assignedExercises.includes(ex.id) ? '✓ ' : '+ '}{ex.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Weekly Schedule */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mb-2">Weekly Exercise Schedule:</p>
                        <div className="grid grid-cols-7 gap-1 mb-3">
                          {WEEK_DAYS.map(day => (
                            <div key={day} className="text-center">
                              <p className="text-xs font-semibold text-teal-600 mb-1">{day.slice(0, 3)}</p>
                              {p.assignedExercises.map(exId => {
                                const ex = exercises.find(e => e.id === exId)
                                if (!ex) return null
                                const ws = weekSchedule[p.id] || {}
                                const isScheduled = (ws[day] || []).includes(exId) ||
                                  schedules.some(s => s.patient_id === p.id && s.exercise_id === exId && s.day_of_week === day)
                                return (
                                  <button key={exId} onClick={() => toggleScheduleExercise(p.id, day, exId)}
                                    className={'text-xs w-full mb-1 px-1 py-1 rounded border transition ' + (isScheduled ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-400 border-gray-200 hover:border-teal-300')}
                                    title={ex.name}>
                                    {ex.name.slice(0, 4)}
                                  </button>
                                )
                              })}
                            </div>
                          ))}
                        </div>
                        <button onClick={() => saveWeekSchedule(p.id)} className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-4 py-1 rounded-lg">Save Schedule</button>
                      </div>

                      {/* Pain Map */}
                      <BodyPainMap
                        painPoints={painPoints[p.id] || []}
                        onAddPoint={(pt, idx) => handlePainPoint(p.id, pt, idx)}
                        onRemovePoint={(idx, view) => removePainPoint(p.id, idx, view)}
                      />
                    </div>
                  )}
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
              <div className="col-span-full flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newAppt.is_recurring} onChange={e => setNewAppt({ ...newAppt, is_recurring: e.target.checked })} className="w-4 h-4 accent-teal-500" />
                  <span className="text-sm text-gray-600">Recurring appointment</span>
                </label>
              </div>
              {newAppt.is_recurring && (
                <div className="col-span-full">
                  <p className="text-xs text-gray-500 mb-2">Repeat on:</p>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map(day => (
                      <button key={day} onClick={() => {
                        const has = newAppt.recurring_days.includes(day)
                        setNewAppt({ ...newAppt, recurring_days: has ? newAppt.recurring_days.filter(d => d !== day) : [...newAppt.recurring_days, day] })
                      }} className={'text-xs px-3 py-1 rounded-full border transition ' + (newAppt.recurring_days.includes(day) ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-500 border-gray-200')}>
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={addAppointment} className="col-span-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Plus size={16} /> Book Appointment
              </button>
            </div>

            {/* Cancelled appointments toggle */}
            <div className="grid gap-3">
              {appointments.sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''))).map(appt => (
                <div key={appt.id} className={'bg-white rounded-xl overflow-hidden shadow-sm border ' + (appt.cancelled ? 'border-red-100 opacity-60' : 'border-gray-100')}>
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedAppt(expandedAppt === appt.id ? null : appt.id)}>
                    <div className="flex items-center gap-3">
                      <div className={'rounded-lg p-2 text-center min-w-fit ' + (appt.cancelled ? 'bg-red-50' : 'bg-teal-50')}>
                        <p className={'font-bold text-sm ' + (appt.cancelled ? 'text-red-400' : 'text-teal-600')}>{appt.time}</p>
                        <p className="text-gray-400 text-xs">{appt.date}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{appt.patient_name || appt.patientName}</p>
                        <p className="text-gray-400 text-sm">{appt.type} {appt.is_recurring ? '🔄' : ''}</p>
                        {appt.cancelled && appt.cancel_reason && <p className="text-red-400 text-xs">Reason: {appt.cancel_reason}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!appt.cancelled && (
                        <>
                          <button onClick={e => { e.stopPropagation(); setRescheduleModal(appt.id) }}
                            className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 py-1 rounded-lg flex items-center gap-1">
                            <RefreshCw size={12} /> Reschedule
                          </button>
                          <button onClick={e => { e.stopPropagation(); setCancelModal(appt.id) }}
                            className="text-xs bg-red-50 hover:bg-red-100 text-red-500 px-2 py-1 rounded-lg flex items-center gap-1">
                            <X size={12} /> Cancel
                          </button>
                        </>
                      )}
                      {saveStatus[appt.id] === 'saving' && <span className="text-xs text-yellow-500">Saving...</span>}
                      {saveStatus[appt.id] === 'saved' && <span className="text-xs text-green-500">✓ Saved</span>}
                      <span className={'text-xs px-2 py-1 rounded-full ' + (appt.cancelled ? 'bg-red-100 text-red-600' : appt.status === 'Completed' ? 'bg-green-100 text-green-700' : appt.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700')}>
                        {appt.cancelled ? 'Cancelled' : appt.status}
                      </span>
                      {expandedAppt === appt.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>
                  {expandedAppt === appt.id && !appt.cancelled && (
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
                        <button onClick={() => saveAppt(appt)} className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Save Notes</button>
                        <button onClick={() => {
                          const patient = patients.find(p => p.id === (appt.patient_id || appt.patientId))
                          if (patient) {
                            const msg = 'Assalamu Alaikum ' + (appt.patient_name || appt.patientName) + ', your physiotherapy appointment is on ' + appt.date + ' at ' + appt.time + '. Type: ' + appt.type + '. Please confirm. Thank you, PhysioAI Pro Clinic.'
                            window.open('https://wa.me/' + patient.phone + '?text=' + encodeURIComponent(msg), '_blank')
                          }
                        }} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">WhatsApp</button>
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
                  <div className="flex gap-3 text-xs mt-2 items-center">
                    <span className="bg-gray-50 px-2 py-1 rounded-lg text-gray-500">Sets: {ex.sets}</span>
                     <span className="bg-gray-50 px-2 py-1 rounded-lg text-gray-500">Reps: {ex.reps}</span>
                     <button onClick={() => setEditExercise({ ...ex })} className="ml-auto bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg">Edit</button>
                     <button onClick={() => deleteExercise(ex.id)} className="bg-red-50 hover:bg-red-100 text-red-500 px-2 py-1 rounded-lg"><Trash2 size={12} /></button>
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
                const patientAppts = appointments.filter(a => (a.patient_id || a.patientId) === p.id && !a.cancelled)
                const painData = patientAppts.filter(a => a.pain_before).map((a, i) => ({
                  session: 'S' + (i + 1),
                  before: parseInt(a.pain_before) || 0,
                  after: parseInt(a.pain_after) || 0
                }))
                return (
                  <div key={p.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-gray-400 text-sm">{p.condition} | {patientAppts.length} sessions</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => shareExercisesWhatsApp(p)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs">WhatsApp</button>
                        <button onClick={() => exportPDF(p, appointments, exercises, schedules)} className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg text-sm">Export PDF</button>
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