import { useState } from 'react'
import { Users, Calendar, Activity, BookOpen, BarChart2, LogOut, Plus, Search, Phone, Mail, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const initialExercises = [
  { id: 1, name: 'Knee Flexion', condition: 'Knee Pain', difficulty: 'Easy', description: 'Slowly bend and straighten the knee', youtube: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  { id: 2, name: 'Lower Back Stretch', condition: 'Back Pain', difficulty: 'Easy', description: 'Gentle stretch for lower back relief', youtube: '' },
  { id: 3, name: 'Shoulder Rotation', condition: 'Shoulder Pain', difficulty: 'Medium', description: 'Circular shoulder movements for mobility', youtube: '' },
]

export default function PhysioSystem() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [view, setView] = useState('dashboard')
  const [patients, setPatients] = useState([
    { id: 1, name: 'Ahmed Al Mansoori', phone: '0501234567', email: 'ahmed@email.com', age: 35, condition: 'Back Pain', diagnosis: 'Lumbar strain' },
    { id: 2, name: 'Sara Mohammed', phone: '0557654321', email: 'sara@email.com', age: 28, condition: 'Knee Pain', diagnosis: 'Patellofemoral syndrome' },
  ])
  const [appointments, setAppointments] = useState([
    { id: 1, patientId: 1, patientName: 'Ahmed Al Mansoori', date: '2026-03-15', type: 'Clinic', status: 'Scheduled', notes: '', painBefore: '', painAfter: '', summary: '', exercises: [] },
    { id: 2, patientId: 2, patientName: 'Sara Mohammed', date: '2026-03-16', type: 'Home Visit', status: 'Scheduled', notes: '', painBefore: '', painAfter: '', summary: '', exercises: [] },
  ])
  const [exercises, setExercises] = useState(initialExercises)
  const [search, setSearch] = useState('')
  const [expandedAppt, setExpandedAppt] = useState(null)
  const [loadingId, setLoadingId] = useState(null)

  // Patient form
  const [newPatient, setNewPatient] = useState({ name: '', phone: '', email: '', age: '', condition: '', diagnosis: '' })
  // Appointment form
  const [newAppt, setNewAppt] = useState({ patientId: '', date: '', type: 'Clinic' })
  // Exercise form
  const [newExercise, setNewExercise] = useState({ name: '', condition: '', difficulty: 'Easy', description: '', youtube: '' })

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search)
  )

  const stats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'Completed').length,
    upcoming: appointments.filter(a => a.status === 'Scheduled').length,
    patients: patients.length,
  }

  const progressData = [
    { session: 'S1', pain: 8 },
    { session: 'S2', pain: 7 },
    { session: 'S3', pain: 5 },
    { session: 'S4', pain: 4 },
    { session: 'S5', pain: 2 },
  ]

  function addPatient() {
    if (!newPatient.name || !newPatient.phone) return alert('Name and phone required')
    setPatients([...patients, { ...newPatient, id: Date.now() }])
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
      date: newAppt.date, type: newAppt.type, status: 'Scheduled',
      notes: '', painBefore: '', painAfter: '', summary: '', exercises: []
    }])
    setNewAppt({ patientId: '', date: '', type: 'Clinic' })
  }

  function updateAppt(id, field, value) {
    setAppointments(appointments.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  function addExercise() {
    if (!newExercise.name) return alert('Exercise name required')
    setExercises([...exercises, { ...newExercise, id: Date.now() }])
    setNewExercise({ name: '', condition: '', difficulty: 'Easy', description: '', youtube: '' })
  }

  async function generateSummary(appt) {
    setLoadingId(appt.id)
    try {
      const apiKey = 'AIzaSyBlug63an9TkmJ5x28u9xDFOiqwPJE-58s'
      const prompt = `Write a short professional physiotherapy session summary for patient ${appt.patientName}. Notes: ${appt.notes}. Pain went from ${appt.painBefore} to ${appt.painAfter} out of 10. Date: ${appt.date}. Type: ${appt.type}.`

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })
      const data = await res.json()
      const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text
      updateAppt(appt.id, 'summary', summary || 'No summary returned: ' + JSON.stringify(data))
    } catch (err) {
      updateAppt(appt.id, 'summary', 'Error: ' + err.message)
    }
    setLoadingId(null)
  }
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: appt.patientName,
          notes: appt.notes,
          painBefore: appt.painBefore,
          painAfter: appt.painAfter,
          type: appt.type,
          date: appt.date,
        })
      })
      const text = await res.text()
      try {
        const data = JSON.parse(text)
        updateAppt(appt.id, 'summary', data.summary || 'No summary returned: ' + text)
      } catch {
        updateAppt(appt.id, 'summary', 'Raw response: ' + text)
      }
    } catch (err) {
      updateAppt(appt.id, 'summary', 'Fetch error: ' + err.message)
    }
    setLoadingId(null)
  }

  function sendWhatsApp(phone, name, date) {
    const msg = encodeURIComponent(`Hi ${name}, your physiotherapy appointment is on ${date}. Please confirm your attendance.`)
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
  }

  function exportReport(patient) {
    const appts = appointments.filter(a => a.patientId === patient.id)
    const html = `<html><body style="font-family:sans-serif;padding:20px">
      <h1>Patient Report: ${patient.name}</h1>
      <p>Condition: ${patient.condition} | Diagnosis: ${patient.diagnosis}</p>
      <h2>Sessions (${appts.length})</h2>
      ${appts.map(a => `<div style="border:1px solid #ccc;padding:10px;margin:10px 0">
        <b>${a.date}</b> - ${a.type} - ${a.status}<br/>
        Notes: ${a.notes || 'None'}<br/>
        Pain: ${a.painBefore || '?'} → ${a.painAfter || '?'}<br/>
        Summary: ${a.summary || 'None'}
      </div>`).join('')}
    </body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${patient.name}-report.html`
    a.click()
  }

  if (!isLoggedIn) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-sm shadow-xl">
        <h1 className="text-2xl font-bold text-center text-blue-400 mb-2">PhysioAI Pro</h1>
        <p className="text-slate-400 text-center mb-6">Clinic Management System</p>
        <input className="w-full bg-slate-700 rounded-lg px-4 py-2 mb-3 text-white outline-none" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="w-full bg-slate-700 rounded-lg px-4 py-2 mb-4 text-white outline-none" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={() => setIsLoggedIn(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition">Login</button>
        <p className="text-slate-500 text-xs text-center mt-3">Any email & password works for demo</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-16 bg-slate-800 flex flex-col items-center py-4 gap-4 z-10">
        {[
          { id: 'dashboard', icon: BarChart2 },
          { id: 'patients', icon: Users },
          { id: 'appointments', icon: Calendar },
          { id: 'exercises', icon: BookOpen },
          { id: 'reports', icon: Activity },
        ].map(({ id, icon: Icon }) => (
          <button key={id} onClick={() => setView(id)}
            className={`p-3 rounded-xl transition ${view === id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
            <Icon size={20} />
          </button>
        ))}
        <button onClick={() => setIsLoggedIn(false)} className="mt-auto p-3 text-slate-400 hover:text-red-400">
          <LogOut size={20} />
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-16 p-6">

        {/* DASHBOARD */}
        {view === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Sessions', value: stats.total, color: 'blue' },
                { label: 'Completed', value: stats.completed, color: 'green' },
                { label: 'Upcoming', value: stats.upcoming, color: 'yellow' },
                { label: 'Patients', value: stats.patients, color: 'purple' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`bg-slate-800 rounded-xl p-4 border-l-4 border-${color}-500`}>
                  <p className="text-slate-400 text-sm">{label}</p>
                  <p className="text-3xl font-bold">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-4">Sample Pain Progress</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="session" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 10]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                  <Line type="monotone" dataKey="pain" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* PATIENTS */}
        {view === 'patients' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Patients</h2>
            <div className="flex gap-2 mb-4">
              <div className="flex items-center bg-slate-800 rounded-lg px-3 flex-1">
                <Search size={16} className="text-slate-400 mr-2" />
                <input className="bg-transparent py-2 outline-none flex-1 text-white" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            {/* Add Patient Form */}
            <div className="bg-slate-800 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              <h3 className="col-span-full font-semibold text-blue-400">Add New Patient</h3>
              {['name', 'phone', 'email', 'age', 'condition', 'diagnosis'].map(field => (
                <input key={field} className="bg-slate-700 rounded-lg px-3 py-2 text-white outline-none capitalize" placeholder={field}
                  value={newPatient[field]} onChange={e => setNewPatient({ ...newPatient, [field]: e.target.value })} />
              ))}
              <button onClick={addPatient} className="col-span-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Plus size={16} /> Add Patient
              </button>
            </div>
            {/* Patient List */}
            <div className="grid gap-3">
              {filteredPatients.map(p => (
                <div key={p.id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-slate-400 text-sm">{p.condition} | {p.diagnosis}</p>
                    <div className="flex gap-3 mt-1 text-slate-400 text-xs">
                      <span className="flex items-center gap-1"><Phone size={12} />{p.phone}</span>
                      <span className="flex items-center gap-1"><Mail size={12} />{p.email}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => exportReport(p)} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg">Export</button>
                    <button onClick={() => deletePatient(p.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPOINTMENTS */}
        {view === 'appointments' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Appointments</h2>
            {/* Add Appointment */}
            <div className="bg-slate-800 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <h3 className="col-span-full font-semibold text-blue-400">Book Appointment</h3>
              <select className="bg-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                value={newAppt.patientId} onChange={e => setNewAppt({ ...newAppt, patientId: e.target.value })}>
                <option value="">Select Patient</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="date" className="bg-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                value={newAppt.date} onChange={e => setNewAppt({ ...newAppt, date: e.target.value })} />
              <select className="bg-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                value={newAppt.type} onChange={e => setNewAppt({ ...newAppt, type: e.target.value })}>
                <option>Clinic</option>
                <option>Home Visit</option>
              </select>
              <button onClick={addAppointment} className="col-span-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Plus size={16} /> Book Appointment
              </button>
            </div>
            {/* Appointment List */}
            <div className="grid gap-3">
              {appointments.map(appt => (
                <div key={appt.id} className="bg-slate-800 rounded-xl overflow-hidden">
                  <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedAppt(expandedAppt === appt.id ? null : appt.id)}>
                    <div>
                      <p className="font-semibold">{appt.patientName}</p>
                      <p className="text-slate-400 text-sm">{appt.date} | {appt.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${appt.status === 'Completed' ? 'bg-green-900 text-green-300' : appt.status === 'In Progress' ? 'bg-yellow-900 text-yellow-300' : 'bg-blue-900 text-blue-300'}`}>
                        {appt.status}
                      </span>
                      {expandedAppt === appt.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>
                  {expandedAppt === appt.id && (
                    <div className="px-4 pb-4 border-t border-slate-700 pt-4 grid gap-3">
                      <select className="bg-slate-700 rounded-lg px-3 py-2 text-white outline-none w-full"
                        value={appt.status} onChange={e => updateAppt(appt.id, 'status', e.target.value)}>
                        <option>Scheduled</option>
                        <option>Accepted</option>
                        <option>In Progress</option>
                        <option>Completed</option>
                      </select>
                      <div className="grid grid-cols-2 gap-3">
                        <input className="bg-slate-700 rounded-lg px-3 py-2 text-white outline-none" placeholder="Pain before (0-10)"
                          value={appt.painBefore} onChange={e => updateAppt(appt.id, 'painBefore', e.target.value)} />
                        <input className="bg-slate-700 rounded-lg px-3 py-2 text-white outline-none" placeholder="Pain after (0-10)"
                          value={appt.painAfter} onChange={e => updateAppt(appt.id, 'painAfter', e.target.value)} />
                      </div>
                      <textarea className="bg-slate-700 rounded-lg px-3 py-2 text-white outline-none w-full h-24 resize-none" placeholder="Session notes..."
                        value={appt.notes} onChange={e => updateAppt(appt.id, 'notes', e.target.value)} />
                      <div className="flex gap-2">
                        <button onClick={() => generateSummary(appt)} disabled={loadingId === appt.id}
                          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50">
                          {loadingId === appt.id ? 'Generating...' : 'AI Summary'}
                        </button>
                        <button onClick={() => sendWhatsApp(patients.find(p => p.id === appt.patientId)?.phone, appt.patientName, appt.date)}
                          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm font-semibold">
                          WhatsApp
                        </button>
                      </div>
                      {appt.summary && (
                        <div className="bg-slate-900 rounded-lg p-3 text-sm text-slate-300">
                          <p className="text-purple-400 font-semibold mb-1">AI Summary</p>
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
            <h2 className="text-2xl font-bold mb-4">Exercise Library</h2>
            <div className="bg-slate-800 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <h3 className="col-span-full font-semibold text-blue-400">Add Exercise</h3>
              {['name', 'condition', 'description', 'youtube'].map(field => (
                <input key={field} className="bg-slate-700 rounded-lg px-3 py-2 text-white outline-none capitalize"
                  placeholder={field === 'youtube' ? 'YouTube embed URL (optional)' : field}
                  value={newExercise[field]} onChange={e => setNewExercise({ ...newExercise, [field]: e.target.value })} />
              ))}
              <select className="bg-slate-700 rounded-lg px-3 py-2 text-white outline-none"
                value={newExercise.difficulty} onChange={e => setNewExercise({ ...newExercise, difficulty: e.target.value })}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
              <button onClick={addExercise} className="col-span-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <Plus size={16} /> Add Exercise
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {exercises.map(ex => (
                <div key={ex.id} className="bg-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold">{ex.name}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${ex.difficulty === 'Easy' ? 'bg-green-900 text-green-300' : ex.difficulty === 'Medium' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
                      {ex.difficulty}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">{ex.condition}</p>
                  <p className="text-slate-300 text-sm">{ex.description}</p>
                  {ex.youtube && <iframe className="mt-3 w-full rounded-lg" height="150" src={ex.youtube} allowFullScreen />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORTS */}
        {view === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Reports</h2>
            <div className="grid gap-4">
              {patients.map(p => {
                const patientAppts = appointments.filter(a => a.patientId === p.id)
                const painData = patientAppts.filter(a => a.painBefore).map((a, i) => ({ session: `S${i + 1}`, before: parseInt(a.painBefore) || 0, after: parseInt(a.painAfter) || 0 }))
                return (
                  <div key={p.id} className="bg-slate-800 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-slate-400 text-sm">{p.condition} | {patientAppts.length} sessions</p>
                      </div>
                      <button onClick={() => exportReport(p)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-lg text-sm">Export HTML</button>
                    </div>
                    {painData.length > 0 && (
                      <ResponsiveContainer width="100%" height={150}>
                        <LineChart data={painData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="session" stroke="#94a3b8" />
                          <YAxis stroke="#94a3b8" domain={[0, 10]} />
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none' }} />
                          <Line type="monotone" dataKey="before" stroke="#ef4444" strokeWidth={2} name="Pain Before" />
                          <Line type="monotone" dataKey="after" stroke="#22c55e" strokeWidth={2} name="Pain After" />
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