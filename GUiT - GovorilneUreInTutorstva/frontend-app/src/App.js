import { useState, useEffect } from 'react'

const API = {
    getOfficeHours: async () => {
        return [
            { id: 1, professorName: "Dr. Novak", subject: "Programiranje", dateTime: "2026-04-15T10:00", location: "Zoom", maxStudents: 5, enrolled: 2 },
            { id: 2, professorName: "Dr. Horvat", subject: "Baze podatkov", dateTime: "2026-04-16T14:00", location: "R2-12", maxStudents: 3, enrolled: 1 },
        ]
    },
    createOfficeHour: async (data) => {
        return { id: Date.now(), ...data }
    },
    updateOfficeHour: async (id, data) => {
        return data
    },
    deleteOfficeHour: async (id) => {
        console.log("Deleted:", id)
    },
    getTutors: async () => {
        return [
            { id: 1, name: "Luka M.", subject: "Programiranje", description: "Pomoč pri Javi", price: 15, email: "luka@student.com" },
            { id: 2, name: "Ana K.", subject: "Matematika", description: "Vsa poglavja", price: 12, email: "ana@student.com" },
        ]
    },
    createTutor: async (data) => {
        return { id: Date.now(), ...data }
    },
    updateTutor: async (id, data) => {
        return data
    },
    deleteTutor: async (id) => {
        console.log("Deleted tutor:", id)
    }
}

function App() {
    const [tab, setTab] = useState('office')
    const [officeHours, setOfficeHours] = useState([])
    const [tutors, setTutors] = useState([])
    const [showOfficeForm, setShowOfficeForm] = useState(false)
    const [showTutorForm, setShowTutorForm] = useState(false)
    const [editingOffice, setEditingOffice] = useState(null)
    const [editingTutor, setEditingTutor] = useState(null)
    const [officeForm, setOfficeForm] = useState({ professorName: '', subject: '', dateTime: '', location: '', maxStudents: 5, enrolled: 0 })
    const [tutorForm, setTutorForm] = useState({ name: '', subject: '', description: '', price: 10, email: '' })

    useEffect(() => {
        loadOfficeHours()
        loadTutors()
    }, [])

    const loadOfficeHours = async () => {
        const data = await API.getOfficeHours()
        setOfficeHours(data)
    }

    const loadTutors = async () => {
        const data = await API.getTutors()
        setTutors(data)
    }

    const handleOfficeSubmit = async (e) => {
        e.preventDefault()
        if (editingOffice) {
            const updated = await API.updateOfficeHour(editingOffice.id, { ...officeForm, id: editingOffice.id })
            setOfficeHours(officeHours.map(o => o.id === editingOffice.id ? updated : o))
            setEditingOffice(null)
        } else {
            const newOffice = await API.createOfficeHour(officeForm)
            setOfficeHours([...officeHours, newOffice])
        }
        setOfficeForm({ professorName: '', subject: '', dateTime: '', location: '', maxStudents: 5, enrolled: 0 })
        setShowOfficeForm(false)
    }

    const handleDeleteOffice = async (id) => {
        if (window.confirm('Izbriši govorilno uro?')) {
            await API.deleteOfficeHour(id)
            setOfficeHours(officeHours.filter(o => o.id !== id))
        }
    }

    const handleTutorSubmit = async (e) => {
        e.preventDefault()
        if (editingTutor) {
            const updated = await API.updateTutor(editingTutor.id, { ...tutorForm, id: editingTutor.id })
            setTutors(tutors.map(t => t.id === editingTutor.id ? updated : t))
            setEditingTutor(null)
        } else {
            const newTutor = await API.createTutor(tutorForm)
            setTutors([...tutors, newTutor])
        }
        setTutorForm({ name: '', subject: '', description: '', price: 10, email: '' })
        setShowTutorForm(false)
    }

    const handleDeleteTutor = async (id) => {
        if (window.confirm('Izbriši tutorja?')) {
            await API.deleteTutor(id)
            setTutors(tutors.filter(t => t.id !== id))
        }
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20, fontFamily: 'Arial' }}>
            <h1 style={{ textAlign: 'center', color: '#2c3e50' }}>📚 Rezervacija govorilnih ur in tutorstvo</h1>

            <div style={{ display: 'flex', gap: 10, marginBottom: 30, justifyContent: 'center' }}>
                <button onClick={() => setTab('office')} style={{ padding: '10px 20px', background: tab === 'office' ? '#3498db' : '#ecf0f1', color: tab === 'office' ? 'white' : '#2c3e50', border: 'none', borderRadius: 8, cursor: 'pointer' }}>🎓 Govorilne ure</button>
                <button onClick={() => setTab('tutor')} style={{ padding: '10px 20px', background: tab === 'tutor' ? '#3498db' : '#ecf0f1', color: tab === 'tutor' ? 'white' : '#2c3e50', border: 'none', borderRadius: 8, cursor: 'pointer' }}>👨‍🏫 Tutorji</button>
            </div>

            {tab === 'office' && (
                <div>
                    <button onClick={() => setShowOfficeForm(true)} style={{ background: '#27ae60', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 20 }}>+ Nova govorilna ura</button>

                    {showOfficeForm && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ background: 'white', padding: 30, borderRadius: 12, width: 450 }}>
                                <h2>{editingOffice ? 'Uredi' : 'Dodaj'} govorilno uro</h2>
                                <form onSubmit={handleOfficeSubmit}>
                                    <input style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 5 }} placeholder="Ime profesorja" value={officeForm.professorName} onChange={e => setOfficeForm({...officeForm, professorName: e.target.value})} required />
                                    <input style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 5 }} placeholder="Predmet" value={officeForm.subject} onChange={e => setOfficeForm({...officeForm, subject: e.target.value})} required />
                                    <input style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 5 }} type="datetime-local" value={officeForm.dateTime} onChange={e => setOfficeForm({...officeForm, dateTime: e.target.value})} required />
                                    <input style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 5 }} placeholder="Lokacija" value={officeForm.location} onChange={e => setOfficeForm({...officeForm, location: e.target.value})} required />
                                    <input style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 5 }} type="number" placeholder="Max študentov" value={officeForm.maxStudents} onChange={e => setOfficeForm({...officeForm, maxStudents: parseInt(e.target.value)})} required />
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button type="submit" style={{ background: '#27ae60', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5, cursor: 'pointer' }}>Shrani</button>
                                        <button type="button" style={{ background: '#95a5a6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5, cursor: 'pointer' }} onClick={() => { setShowOfficeForm(false); setEditingOffice(null); }}>Prekliči</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                        {officeHours.map(oh => (
                            <div key={oh.id} style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 18, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>{oh.subject}</h3>
                                <p><strong>👨‍🏫 Profesor:</strong> {oh.professorName}</p>
                                <p><strong>📅 Datum/čas:</strong> {oh.dateTime}</p>
                                <p><strong>📍 Lokacija:</strong> {oh.location}</p>
                                <p><strong>👥 Prijavljeni:</strong> {oh.enrolled} / {oh.maxStudents}</p>
                                <div style={{ display: 'flex', gap: 8, marginTop: 15 }}>
                                    <button style={{ padding: '6px 12px', background: '#f39c12', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }} onClick={() => { setEditingOffice(oh); setOfficeForm(oh); setShowOfficeForm(true); }}>Uredi</button>
                                    <button style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }} onClick={() => handleDeleteOffice(oh.id)}>Izbriši</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {tab === 'tutor' && (
                <div>
                    <button onClick={() => setShowTutorForm(true)} style={{ background: '#27ae60', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 8, cursor: 'pointer', marginBottom: 20 }}>+ Nov tutor</button>

                    {showTutorForm && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ background: 'white', padding: 30, borderRadius: 12, width: 450 }}>
                                <h2>{editingTutor ? 'Uredi' : 'Dodaj'} tutorja</h2>
                                <form onSubmit={handleTutorSubmit}>
                                    <input style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 5 }} placeholder="Ime" value={tutorForm.name} onChange={e => setTutorForm({...tutorForm, name: e.target.value})} required />
                                    <input style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 5 }} placeholder="Email" value={tutorForm.email} onChange={e => setTutorForm({...tutorForm, email: e.target.value})} required />
                                    <input style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 5 }} placeholder="Predmet" value={tutorForm.subject} onChange={e => setTutorForm({...tutorForm, subject: e.target.value})} required />
                                    <textarea style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 5, minHeight: 80 }} placeholder="Opis" value={tutorForm.description} onChange={e => setTutorForm({...tutorForm, description: e.target.value})} />
                                    <input style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 5 }} type="number" placeholder="Cena/uro (€)" value={tutorForm.price} onChange={e => setTutorForm({...tutorForm, price: parseInt(e.target.value)})} required />
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button type="submit" style={{ background: '#27ae60', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5, cursor: 'pointer' }}>Shrani</button>
                                        <button type="button" style={{ background: '#95a5a6', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 5, cursor: 'pointer' }} onClick={() => { setShowTutorForm(false); setEditingTutor(null); }}>Prekliči</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                        {tutors.map(tutor => (
                            <div key={tutor.id} style={{ border: '1px solid #e0e0e0', borderRadius: 12, padding: 18, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{tutor.name}</h3>
                                <p style={{ color: '#7f8c8d', marginBottom: 10 }}>{tutor.email}</p>
                                <p><strong>📚 Predmet:</strong> {tutor.subject}</p>
                                <p><strong>📝 Opis:</strong> {tutor.description}</p>
                                <p><strong>💰 Cena:</strong> {tutor.price} €/uro</p>
                                <div style={{ display: 'flex', gap: 8, marginTop: 15 }}>
                                    <button style={{ padding: '6px 12px', background: '#f39c12', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }} onClick={() => { setEditingTutor(tutor); setTutorForm(tutor); setShowTutorForm(true); }}>Uredi</button>
                                    <button style={{ padding: '6px 12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }} onClick={() => handleDeleteTutor(tutor.id)}>Izbriši</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default App