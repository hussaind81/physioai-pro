import { useState } from 'react'
import { Users, Calendar, Activity, BookOpen, BarChart2, LogOut, Plus, Search, Phone, Mail, Trash2, ChevronDown, ChevronUp, Clock, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY
const ADMIN_USER = 'admin'
const ADMIN_PASS = 'physio123'

const initialExercises = [
  { id: 1, name: 'Knee Flexion', condition: 'Knee Pain', difficulty: 'Easy', sets: 3, reps: 10, description: 'Slowly bend and straighten the knee while seated', youtube: '' },
  { id: 2, name: 'Lower Back Stretch', condition: 'Back Pain', difficulty: 'Easy', sets: 2, reps: 15, description: 'Lie on back, pull knees to chest and hold for 10 seconds', youtube: '' },
  { id: 3, name: 'Shoulder Rotation', condition: 'Shoulder Pain', difficulty: 'Medium', sets: 3, reps: 12, description: 'Stand upright, make slow circular movements with your shoulder', youtube: '' },
  { id: 4, name: 'Calf Raises', condition: 'Ankle Pain', difficulty: 'Easy', sets: 3, reps: 15, description: 'Stand on edge of step, raise and lower heels slowly', youtube: '' },
  { id: 5, name: 'Neck Tilt Stretch', condition: 'Neck Pain', difficulty: 'Easy', sets: 2, reps: 10, description: 'Tilt head slowly side to side, hold 5 seconds each side', youtube: '' },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function PhysioSystem() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginError, setLoginError] = useState('')
  const [view, setView] = useState('dashboard')
  const [calendarDate, setCalendarDate] = useState(new Date())

  const [patients, setPatients] = useState([
    { id: 1, name: 'Ahmed Al Mansoori', phone: '971501234567', email: 'ahmed@email.com', age: 35, condition: 'Back Pain', diagnosis: 'Lumbar strain', assignedExercises: [1, 2] },
    { id: 2, name: 'Sara Mohammed', phone: '971557654321', email: 'sara@email.com', age: 28, condition: 'Knee Pain', diagnosis: 'Patellofemoral syndrome', assignedExercises: [1] },
  ])

  const [appointments, setAppointments] = useState([
    { id: 1, patientId: 1, patientName: 'Ahmed Al Mansoori', date: '2026-03-15', time: '09:00', type: 'Clinic', status: 'Scheduled', soap: { s: '', o: '', a: '', p: '' }, painBefore: '', painAfter: '', summary: '', exercises: [] },
    { id: 2, patientId: 2, patientName: 'Sara Mohammed', date: '2026-03-16', time: '11:00', type: 'Home Visit', status: 'Scheduled', soap: { s: '', o: '', a: '', p: '' }, painBefore: '', painAfter: '', summary: '', exercises: [] },
  ])

  const [exercises, setExercises] = useState(initialExercises)
  const [search, setSearch] = useState('')
  const [expandedAppt, setExpandedAppt] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', email: '', age: '', condition: '', diagnosis: '' })
  const [newAppt, setNewAppt] = useState({ patientId: '', date: '', time: '09:00', type: 'Clinic' })
  const [newExercise, setNewExercise] = useState({ name: '', condition: '', difficulty: 'Easy', sets: 3, reps: 10, description: '', youtube: '' })

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  const todayAppts = appointments.filter(a => a.date === todayStr)
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
  )

  function handleLogin() {
    if (loginUser === ADMIN_USER && loginPass === ADMIN_PASS) {
      setIsLoggedIn(true)
      setLoginError('')
    } else {
      setLoginError('Invalid username or password')
    }
  }

  function addPatient() {
    if (!newPatient.name || !newPatient.phone) return alert('Name and phone required')
    setPatients([...patients, { ...newPatient, id: Date.now(), assignedExercises: [] }])
    setNewPatient({ name: '', phone: '', email: '', age: '', condition: '', diagnosis: '' })
  }

  function deletePatient(id) {
    if (window.confirm('Delete this patient?')) setPatients(patients.filter(p => p.id !== id))
  }

  function addAppointment() {
    if (!newAppt.patientId || !newAppt.date) return alert('Select patient and date')
    const patient = patients.find(p => p.id === parseInt(newAppt.patientId))
    setAppointments([...appointments, {
      id: Date.now(), patientId: patient.id, patientName: patient.name,
      date: newAppt.date, time: newAppt.time, type: newAppt.type, status: 'Scheduled',
      soap: { s: '', o: '', a: '', p: '' }, painBefore: '', painAfter: '', summary: '', exercises: []
    }])
    setNewAppt({ patientId: '', date: '', time: '09:00', type: 'Clinic' })
  }

  function updateAppt(id, field, value) {
    setAppointments(appointments.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  function updateSoap(id, field, value) {
    setAppointments(appointments.map(a => a.id === id ? { ...a, soap: { ...a.soap, [field]: value } } : a))
  }

  function addExercise() {
    if (!newExercise.name) return alert('Exercise name required')
    setExercises([...exercises, { ...newExercise, id: Date.now() }])
    setNewExercise({ name: '', condition: '', difficulty: 'Easy', sets: 3, reps: 10, description: '', youtube: '' })
  }

  function togglePatientExercise(patientId, exerciseId) {
    setPatients(patients.map(p => {
      if (p.id !== patientId) return p
      const has = p.assignedExercises.includes(exerciseId)
      return { ...p, assignedExercises: has ? p.assignedExercises.filter(e => e !== exerciseId) : [...p.assignedExercises, exerciseId] }
    }))
  }

  function shareExercisesWhatsApp(patient) {
    const assigned = exercises.filter(e => patient.assignedExercises.includes(e.id))
    if (assigned.length === 0) return alert('No exercises assigned to this patient')
    const programLines = assigned.map((e, i) =>
      (i + 1) + '. *' + e.name + '* (' + e.difficulty + ')%0A' +
      '   Sets: ' + e.sets + ' | Reps: ' + e.reps + '%0A' +
      '   ' + e.description
    ).join('%0A%0A')
    const msg =
      'Assalamu Alaikum ' + patient.name + ',%0A%0A' +
      'Here is your *Home Exercise Program* from PhysioAI Pro:%0A%0A' +
      programLines + '%0A%0A' +
      '*Instructions:*%0A' +
      '- Perform exercises daily unless advised otherwise%0A' +
      '- Stop if you feel sharp pain%0A' +
      '- Contact us if you have any questions%0A%0A' +
      'Get well soon! 💪%0A' +
      'PhysioAI Pro Clinic'
    window.open('https://wa.me/' + patient.phone + '?text=' + msg, '_blank')
  }

  async function generateSummary(appt) {
    setLoadingId(appt.id)
    try {
      const prompt = 'Write a 100 word professional physiotherapy SOAP session summary for patient ' + appt.patientName + '. Subjective: ' + appt.soap.s + '. Objective: ' + appt.soap.o + '. Assessment: ' + appt.soap.a + '. Plan: ' + appt.soap.p + '. Pain score before: ' + appt.painBefore + '/10, after: ' + appt.painAfter + '/10.'
      const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + GEMINI_KEY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      })
      const data = await res.json()
      const summary = data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text
      updateAppt(appt.id, 'summary', summary || 'Response: ' + JSON.stringify(data))
    } catch (err) {
      updateAppt(appt.id, 'summary', 'Error: ' + err.message)
    }
    setLoadingId(null)
  }

  // Calendar helpers
  function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate()
  }

  function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay()
  }

  function getApptCountForDay(dateStr) {
    return appointments.filter(a => a.date === dateStr).length
  }

  function formatCalendarDate(year, month, day) {
    return year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0')
  }

  function exportReport(patient) {
    const appts = appointments.filter(a => a.patientId === patient.id)
    const html = '<html><body style="font-family:sans-serif;padding:20px"><h1>Patient Report: ' + patient.name + '</h1><p>Condition: ' + patient.condition + '</p>' + appts.map(a => '<div style="border:1px solid #ccc;padding:10px;margin:10px 0"><b>' + a.date + ' ' + a.time + '</b> - ' + a.status + '<br/>S: ' + (a.soap.s || '-') + '<br/>O: ' + (a.soap.o || '-') + '<br/>A: ' + (a.soap.a || '-') + '<br/>P: ' + (a.soap.p || '-') + '<br/>Pain: ' + (a.painBefore || '?') + ' to ' + (a.painAfter || '?') + '</div>').join('') + '</body></html>'
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = patient.name + '-report.html'
    a.click()
  }

  // LOGIN SCREEN
  if (!isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center bg-teal-50">
      <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-xl border border-teal-100">
        <div className="flex items-center justify-center mb-2">
          <div className="bg-teal-500 text-white rounded-xl p-3 mr-3">
            <Activity size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-teal-700">PhysioAI Pro</h1>
            <p className="text-teal-400 text-sm">Clinic Management System</p>
          </div>
        </div>
        <p className="text-center text-gray-400 text-xs mb-6">Default: admin / physio123</p>
        <input
          className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-3 text-gray-800 outline-none focus:border-teal-400"
          placeholder="Username"
          value={loginUser}
          onChange={e => setLoginUser(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        <input
          className="w-full border border-gray-200 rounded-lg px-4 py-2 mb-2 text-gray-800 outline-none focus:border-teal-400"
          type="password"
          placeholder="Password"
          value={loginPass}
          onChange={e => setLoginPass(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
        />
        {loginError && <p className="text-red-500 text-xs mb-2 text-center">{loginError}</p>}
        <button
          onClick={handleLogin}
          className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 rounded-lg transition mt-2"
        >
          Login
        </button>
      </div>
    </div>
  )

  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex">

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-teal-600 flex flex-col items-center py-4 gap-2 z-10 shadow-lg">
        <div className="bg-teal-700 rounded-xl p-2 mb-3">
          <Activity size={22} className="text-white" />
        </div>
        {[
          { id: 'dashboard', icon: BarChart2, label: 'Dashboard' },
          { id: 'patients', icon: Users, label: 'Patients' },
          { id: 'appointments', icon: Calendar, label: 'Appointments' },
          { id: 'exercises', icon: BookOpen, label: 'Exercises' },
          { id: 'reports', icon: Activity, label: 'Reports' },
        ].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => setView(id)} title={label}
            className={'p-3 rounded-xl transition w-12 flex items-center justify-center ' + (view === id ? 'bg-white text-teal-600' : 'text-teal-100 hover:bg-teal-500')}>
            <Icon size={20} />
          </button>
        ))}
        <button onClick={() => setIsLoggedIn(false)} className="mt-auto p-3 text-teal-100 hover:text-red-300" title="Logout">
          <LogOut size={20} />
        </button>
      </div>

      {/* Main */}
      <div className="ml-16 p-6 w-full">

        {/* DASHBOARD */}
        {view === 'dashboard' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-gray-400 text-sm">{today.toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-teal-600">{today.toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-teal-500">
                <p className="text-gray-400 text-sm">Total Patients</p>
                <p className="text-3xl font-bold text-gray-800">{patients.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
                <p className="text-gray-400 text-sm">Today's Appointments</p>
                <p className="text-3xl font-bold text-gray-800">{todayAppts.length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-gray-800">{appointments.filter(a => a.status === 'Completed').length}</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
                <p className="text-gray-400 text-sm">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-800">{appointments.length}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Calendar */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600">&#8249;</button>
                  <h3 className="font-bold text-gray-800">{MONTHS[month]} {year}</h3>
                  <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-gray-100 rounded-lg text-gray-600">&#8250;</button>
                </div>
                <div className="grid grid-cols-7 mb-2">
                  {DAYS.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array(firstDay).fill(null).map((_, i) => <div key={'e' + i} />)}
                  {Array(daysInMonth).fill(null).map((_, i) => {
                    const day = i + 1
                    const dateStr = formatCalendarDate(year, month, day)
                    const count = getApptCountForDay(dateStr)
                    const isToday = dateStr === todayStr
                    return (
                      <div key={day} className={'text-center py-1 rounded-lg text-sm relative cursor-pointer ' + (isToday ? 'bg-teal-500 text-white font-bold' : count > 0 ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-gray-600 hover:bg-gray-50')}>
                        {day}
                        {count > 0 && !isToday && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-500 rounded-full" />}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Today's Schedule */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">Today's Schedule</h3>
                {todayAppts.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <Calendar size={32} className="mx-auto mb-2 opacity-30" />
                    <p>No appointments today</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {todayAppts.sort((a, b) => a.time.localeCompare(b.time)).map(appt => (
                      <div key={appt.id} className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                        <div className="bg-teal-500 text-white rounded-lg px-2 py-1 text-xs font-bold min-w-fit">{appt.time}</div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-800">{appt.patientName}</p>
                          <p className="text-xs text-gray-400">{appt.type}</p>
                        </div>
                        <span className={'text-xs px-2 py-1 rounded-full ' + (appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
                          {appt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PATIENTS */}
        {view === 'patients' && (
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
                      {/* Exercise assignment */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Assigned Exercises:</p>
                        <div className="flex flex-wrap gap-2">
                          {exercises.map(ex => (
                            <button key={ex.id} onClick={() => togglePatientExercise(p.id, ex.id)}
                              className={'text-xs px-2 py-1 rounded-full border transition ' + (p.assignedExercises.includes(ex.id) ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300')}>
                              {ex.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <button onClick={() => shareExercisesWhatsApp(p)} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg flex items-center gap-1">
                        <Phone size={12} /> WhatsApp
                      </button>
                      <button onClick={() => exportReport(p)} className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg">Export</button>
                      <button onClick={() => deletePatient(p.id)} className="text-red-400 hover:text-red-500 p-1 flex items-center justify-center"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {view === 'appointments' && (
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
                <option>Clinic</option>
                <option>Home Visit</option>
              </select>
              <button onClick={addAppointment} className="col-span-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Plus size={16} /> Book Appointment
              </button>
            </div>
            <div className="grid gap-3">
              {appointments.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map(appt => (
                <div key={appt.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedAppt(expandedAppt === appt.id ? null : appt.id)}>
                    <div className="flex items-center gap-3">
                      <div className="bg-teal-50 rounded-lg p-2 text-center min-w-fit">
                        <p className="text-teal-600 font-bold text-sm">{appt.time}</p>
                        <p className="text-gray-400 text-xs">{appt.date}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{appt.patientName}</p>
                        <p className="text-gray-400 text-sm">{appt.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={'text-xs px-2 py-1 rounded-full ' + (appt.status === 'Completed' ? 'bg-green-100 text-green-700' : appt.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700')}>
                        {appt.status}
                      </span>
                      {expandedAppt === appt.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                  </div>

                  {expandedAppt === appt.id && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-4 grid gap-4">
                      <select className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 w-full"
                        value={appt.status} onChange={e => updateAppt(appt.id, 'status', e.target.value)}>
                        <option>Scheduled</option>
                        <option>Accepted</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>

                      {/* Pain Scale */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Pain Before (0-10)</label>
                          <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 w-full" placeholder="0-10"
                            value={appt.painBefore} onChange={e => updateAppt(appt.id, 'painBefore', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 mb-1 block">Pain After (0-10)</label>
                          <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 w-full" placeholder="0-10"
                            value={appt.painAfter} onChange={e => updateAppt(appt.id, 'painAfter', e.target.value)} />
                        </div>
                      </div>

                      {/* SOAP Notes */}
                      <div className="bg-gray-50 rounded-xl p-4 grid gap-3">
                        <p className="font-bold text-teal-600 text-sm">SOAP Notes</p>
                        {[
                          { key: 's', label: 'S - Subjective', placeholder: 'What the patient reports (symptoms, pain, concerns)...' },
                          { key: 'o', label: 'O - Objective', placeholder: 'Observable findings (ROM, strength, posture, tests)...' },
                          { key: 'a', label: 'A - Assessment', placeholder: 'Clinical interpretation and diagnosis...' },
                          { key: 'p', label: 'P - Plan', placeholder: 'Treatment plan, goals, next steps...' },
                        ].map(({ key, label, placeholder }) => (
                          <div key={key}>
                            <label className="text-xs font-semibold text-gray-500 mb-1 block">{label}</label>
                            <textarea
                              className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400 w-full h-16 resize-none text-sm"
                              placeholder={placeholder}
                              value={appt.soap[key]}
                              onChange={e => updateSoap(appt.id, key, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => generateSummary(appt)} disabled={loadingId === appt.id}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                          {loadingId === appt.id ? 'Generating...' : 'AI Summary'}
                        </button>
                        <button onClick={() => {
                          const patient = patients.find(p => p.id === appt.patientId)
                          if (patient) {
                            const msg = 'Assalamu Alaikum ' + appt.patientName + ', your physiotherapy appointment is on ' + appt.date + ' at ' + appt.time + '. Type: ' + appt.type + '. Please confirm your attendance. Thank you, PhysioAI Pro Clinic.'
                            window.open('https://wa.me/' + patient.phone + '?text=' + encodeURIComponent(msg), '_blank')
                          }
                        }} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                          WhatsApp Reminder
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
        {view === 'exercises' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Exercise Library</h2>
            <div className="bg-white rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 shadow-sm">
              <h3 className="col-span-full font-semibold text-teal-600">Add Exercise</h3>
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400" placeholder="Exercise name"
                value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} />
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400" placeholder="Condition (e.g. Back Pain)"
                value={newExercise.condition} onChange={e => setNewExercise({ ...newExercise, condition: e.target.value })} />
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400" placeholder="Description / Instructions"
                value={newExercise.description} onChange={e => setNewExercise({ ...newExercise, description: e.target.value })} />
              <input className="border border-gray-200 rounded-lg px-3 py-2 text-gray-800 outline-none focus:border-teal-400" placeholder="YouTube embed URL (optional)"
                value={newExercise.youtube} onChange={e => setNewExercise({ ...newExercise, youtube: e.target.value })} />
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
                  <div className="flex gap-3 text-xs text-gray-400">
                    <span className="bg-gray-50 px-2 py-1 rounded-lg">Sets: {ex.sets}</span>
                    <span className="bg-gray-50 px-2 py-1 rounded-lg">Reps: {ex.reps}</span>
                  </div>
                  {ex.youtube && <iframe className="mt-3 w-full rounded-lg" height="150" src={ex.youtube} allowFullScreen />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {view === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Reports</h2>
            <div className="grid gap-4">
              {patients.map(p => {
                const patientAppts = appointments.filter(a => a.patientId === p.id)
                const painData = patientAppts.filter(a => a.painBefore).map((a, i) => ({
                  session: 'S' + (i + 1),
                  before: parseInt(a.painBefore) || 0,
                  after: parseInt(a.painAfter) || 0
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
                        <button onClick={() => exportReport(p)} className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded-lg text-sm">Export HTML</button>
                      </div>
                    </div>
                    {painData.length > 0 && (
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