import { useState, useEffect, useContext, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import Navbar from '../components/Navbar'
import MessageBox from '../components/MessageBox'
import { TableSkeleton, CardSkeleton } from '../components/Skeleton'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const RISK_COLORS = { Low: '#22c55e', Medium: '#f97316', High: '#ef4444', 'Not Analyzed': '#8891a8' }
const TODAY = new Date().toISOString().slice(0, 10)
// CIE formula: round((ia1 + ia2 + assign) / 110 * 50)
const calcCIE = (ia1, ia2, assign) => Math.round(((Number(ia1) + Number(ia2) + Number(assign)) / 110) * 50)

export default function TeacherDashboard() {
    const { user } = useContext(AuthContext)
    const mySubject = user?.subject || ''

    const [students, setStudents] = useState([])
    const [analytics, setAnalytics] = useState(null)
    const [selected, setSelected] = useState(null)
    const [chatStudent, setChatStudent] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [tab, setTab] = useState('students')
    const [search, setSearch] = useState('')

    // Marks form state
    const [editModules, setEditModules] = useState([1, 2, 3, 4, 5].map(n => ({ moduleNo: n, unitTestMarks: 0 })))
    const [editIa1, setEditIa1] = useState(0)
    const [editIa2, setEditIa2] = useState(0)
    const [editAssignment, setEditAssignment] = useState(0)
    const [editRemarks, setEditRemarks] = useState('')

    // Attendance
    const [attDate, setAttDate] = useState(TODAY)
    const [attMap, setAttMap] = useState({})

    const fetchData = async () => {
        setLoading(true)
        try {
            const [sRes, aRes] = await Promise.all([api.get('/teacher/students'), api.get('/teacher/analytics')])
            setStudents(sRes.data.data || [])
            setAnalytics(aRes.data.analytics)
        } catch { toast.error('Failed to load data') }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [])

    const selectStudent = (s) => {
        setSelected(s)
        const sub = s.performance?.subjects?.find(x => x.name === mySubject)
        if (sub) {
            setEditModules(sub.modules.map(m => ({ moduleNo: m.moduleNo, unitTestMarks: m.unitTestMarks })))
            setEditIa1(sub.ia1 || 0)
            setEditIa2(sub.ia2 || 0)
            setEditAssignment(sub.assignment || 0)
        } else {
            setEditModules([1, 2, 3, 4, 5].map(n => ({ moduleNo: n, unitTestMarks: 0 })))
            setEditIa1(0); setEditIa2(0); setEditAssignment(0)
        }
        setEditRemarks(s.performance?.remarks || '')
    }

    const saveMarks = async () => {
        if (!selected) return
        setSaving(true)
        try {
            await api.put(`/teacher/students/${selected.student.id}`, {
                modules: editModules,
                ia1: Number(editIa1),
                ia2: Number(editIa2),
                assignment: Number(editAssignment),
                remarks: editRemarks,
            })
            toast.success(`✅ Marks saved for ${selected.student.name}`)
            await fetchData()
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to save')
        } finally { setSaving(false) }
    }

    const submitAttendance = async () => {
        setSaving(true)
        let ok = 0
        for (const s of students) {
            try {
                await api.post(`/teacher/students/${s.student.id}/attendance`, {
                    date: attDate,
                    present: attMap[s.student.id] ?? true,
                })
                ok++
            } catch { /* skip */ }
        }
        setSaving(false)
        toast.success(`✅ Attendance saved for ${ok} students on ${attDate}`)
        fetchData()
    }

    const previewCIE = calcCIE(editIa1, editIa2, editAssignment)
    const filtered = students.filter(s =>
        s.student.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.student.usn || '').toLowerCase().includes(search.toLowerCase())
    )

    // Leaderboard: top 5 by CIE for this teacher's subject
    const leaderboard = useMemo(() =>
        [...students]
            .map(s => ({ ...s, subCIE: s.performance?.subjects?.find(x => x.name === mySubject)?.totalCIE ?? 0 }))
            .sort((a, b) => b.subCIE - a.subCIE)
            .slice(0, 5),
        [students, mySubject]
    )

    const pieData = analytics
        ? Object.entries(analytics.riskBreakdown).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
        : []

    // ── Blank panel (no student selected) ──────────────────────────────────────
    const BlankPanel = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card"
            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Welcome banner */}
            <div style={{ background: 'linear-gradient(135deg,rgba(79,142,247,0.12),rgba(155,89,247,0.12))', borderRadius: 14, padding: '1.25rem 1.5rem' }}>
                <p style={{ margin: '0 0 0.2rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    👋 Welcome, {user?.name?.split(' ')[0]}!
                </p>
                <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    You teach <strong style={{ color: 'var(--accent-purple)' }}>{mySubject}</strong>.
                    Select any student from the list to view their marks and edit your subject.
                </p>
            </div>

            {/* Quick stats for my subject */}
            {!loading && (
                <div>
                    <p style={{ margin: '0 0 0.6rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {mySubject} — Class Summary
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.6rem' }}>
                        {[
                            {
                                label: 'Class Avg CIE',
                                value: students.length
                                    ? (students.reduce((a, s) => a + (s.performance?.subjects?.find(x => x.name === mySubject)?.totalCIE || 0), 0) / students.length).toFixed(1)
                                    : '—',
                                unit: '/50', color: '#4f8ef7',
                            },
                            {
                                label: 'Avg Attendance',
                                value: students.length
                                    ? (students.reduce((a, s) => a + (s.performance?.subjects?.find(x => x.name === mySubject)?.attendancePct || 0), 0) / students.length).toFixed(0)
                                    : '—',
                                unit: '%', color: '#22c55e',
                            },
                            {
                                label: 'Below 75% Att',
                                value: students.filter(s => (s.performance?.subjects?.find(x => x.name === mySubject)?.attendancePct || 0) < 75).length,
                                unit: ' stu', color: '#ef4444',
                            },
                        ].map(({ label, value, unit, color }) => (
                            <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.85rem', textAlign: 'center' }}>
                                <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{label}</p>
                                <p style={{ margin: '0.25rem 0 0', fontWeight: 800, fontSize: '1.3rem', color }}>
                                    {value}<span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{unit}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            <div>
                <p style={{ margin: '0 0 0.6rem', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    🏆 Top 5 — {mySubject}
                </p>
                {leaderboard.map((s, i) => (
                    <motion.div key={s.student.id} whileHover={{ x: 3 }} onClick={() => selectStudent(s)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: 10,
                            background: 'var(--bg-secondary)', marginBottom: '0.4rem', cursor: 'pointer',
                            border: '1px solid var(--border)'
                        }}>
                        <span style={{ fontSize: '1rem', width: 24, textAlign: 'center' }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                        </span>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{s.student.name}</p>
                            <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{s.student.usn}</p>
                        </div>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#4f8ef7' }}>{s.subCIE}<span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>/50</span></span>
                    </motion.div>
                ))}
            </div>

            {/* Marks formula card */}
            <div style={{ background: 'rgba(155,89,247,0.08)', border: '1px solid rgba(155,89,247,0.2)', borderRadius: 12, padding: '0.9rem 1.1rem' }}>
                <p style={{ margin: '0 0 0.4rem', fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent-purple)' }}>📐 CIE Calculation Formula</p>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <code style={{ background: 'rgba(155,89,247,0.15)', padding: '1px 5px', borderRadius: 4 }}>CIE = round((IA1 + IA2 + Assignment) ÷ 110 × 50)</code><br />
                    IA1: max <strong>50</strong> &nbsp;|&nbsp; IA2: max <strong>50</strong> &nbsp;|&nbsp; Assignment: max <strong>10</strong> &nbsp;|&nbsp; Total CIE: max <strong>50</strong>
                </p>
            </div>
        </motion.div>
    )

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ maxWidth: 1280, margin: '0 auto', padding: '1.25rem 1rem' }}>

                {/* Header */}
                <div style={{ marginBottom: '1rem' }}>
                    <h1 style={{ margin: 0, fontWeight: 800, fontSize: '1.55rem', color: 'var(--text-primary)' }}>
                        👨‍🏫 <span className="gradient-text">Teacher Dashboard</span>
                    </h1>
                    <p style={{ margin: '0.15rem 0 0', color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                        Subject: <strong style={{ color: 'var(--accent-purple)' }}>{mySubject || 'None assigned'}</strong>
                        &nbsp;— You can view all subjects; edit only your own
                    </p>
                </div>

                {/* Stat cards */}
                {analytics && (
                    <div className="stats-grid">
                        {[
                            { label: 'Total Students', value: analytics.totalStudents, color: '#4f8ef7', icon: '👥' },
                            { label: 'At Risk', value: analytics.atRiskStudents, color: '#ef4444', icon: '🚨' },
                            { label: 'Avg Score', value: analytics.classAvgScore, color: '#22c55e', icon: '📊' },
                            { label: 'Fast Learners', value: analytics.categoryBreakdown['Fast Learner'] || 0, color: '#9b59f7', icon: '🚀' },
                        ].map(({ label, value, color, icon }) => (
                            <div key={label} className="glass-card" style={{ padding: '0.85rem', borderLeft: `3px solid ${color}` }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.15rem' }}>{icon} {label}</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color }}>{value}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {[['students', '👥 Students'], ['attendance', '📅 Attendance'], ['analytics', '📊 Analytics']].map(([key, label]) => (
                        <button key={key} onClick={() => setTab(key)} style={{
                            padding: '0.4rem 0.8rem', borderRadius: '10px',
                            border: `1px solid ${tab === key ? 'transparent' : 'var(--border)'}`,
                            background: tab === key ? 'linear-gradient(135deg,#4f8ef7,#9b59f7)' : 'var(--bg-card)',
                            color: tab === key ? 'white' : 'var(--text-secondary)',
                            fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                        }}>{label}</button>
                    ))}
                </div>

                {/* ─── STUDENTS TAB ─── */}
                {tab === 'students' && (
                    <div className="teacher-grid">

                        {/* Roster */}
                        <div>
                            <input placeholder="🔍 Search name or USN…" value={search} onChange={e => setSearch(e.target.value)}
                                className="ep-input" style={{ marginBottom: '0.65rem' }} />
                            <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', paddingRight: 2 }}>
                                {loading ? <TableSkeleton rows={8} /> : filtered.map(s => {
                                    const sub = s.performance?.subjects?.find(x => x.name === mySubject)
                                    const cie = sub?.totalCIE ?? '–'
                                    const att = sub?.attendancePct ?? '–'
                                    const riskLv = s.performance?.riskLevel || 'Not Analyzed'
                                    return (
                                        <motion.div key={s.student.id} whileHover={{ x: 2 }} onClick={() => selectStudent(s)}
                                            className="glass-card"
                                            style={{
                                                padding: '0.65rem 0.8rem', marginBottom: '0.4rem', cursor: 'pointer',
                                                border: selected?.student.id === s.student.id ? '1px solid var(--accent-purple)' : '1px solid var(--border)'
                                            }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{s.student.name}</p>
                                                    <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{s.student.usn}</p>
                                                </div>
                                                <span style={{
                                                    fontSize: '0.6rem', padding: '1px 5px', borderRadius: 999, flexShrink: 0,
                                                    background: riskLv === 'Low' ? 'rgba(34,197,94,0.1)' : riskLv === 'High' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)',
                                                    color: RISK_COLORS[riskLv]
                                                }}>
                                                    {riskLv}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.2rem' }}>
                                                <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)' }}>CIE: <strong style={{ color: 'var(--accent-blue)' }}>{cie}/50</strong></span>
                                                <span style={{ fontSize: '0.64rem', color: 'var(--text-secondary)' }}>Att: <strong style={{ color: att >= 75 ? '#22c55e' : '#ef4444' }}>{att}%</strong></span>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Right panel: blank state OR student editor */}
                        <AnimatePresence mode="wait">
                            {!selected ? (
                                <BlankPanel key="blank" />
                            ) : (
                                <motion.div key={selected.student.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

                                    {/* Student header */}
                                    <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{selected.student.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>USN: {selected.student.usn}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <button onClick={() => setSelected(null)}
                                                style={{ padding: '0.35rem 0.7rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.75rem' }}>
                                                ← Back
                                            </button>
                                            <button onClick={() => setChatStudent({ id: selected.student.id, name: selected.student.name, role: 'student' })}
                                                style={{ padding: '0.35rem 0.85rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg,#9b59f7,#4f8ef7)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.75rem' }}>
                                                💬 Chat
                                            </button>
                                        </div>
                                    </div>

                                    {/* All-subjects overview (read-only) */}
                                    <div className="glass-card" style={{ padding: '1rem' }}>
                                        <p style={{ margin: '0 0 0.6rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>📋 All Subjects Overview</p>
                                        <div className="vtu-table-container">
                                            <table className="vtu-table">
                                                <thead><tr>
                                                    <th style={{ textAlign: 'left' }}>Subject</th>
                                                    <th>IA1</th><th>IA2</th><th>Asgn</th>
                                                    <th>CIE</th><th>Att%</th>
                                                </tr></thead>
                                                <tbody>
                                                    {(selected.performance?.subjects || []).map(sub => (
                                                        <tr key={sub.code}>
                                                            <td style={{
                                                                textAlign: 'left', fontSize: '0.72rem',
                                                                fontWeight: sub.name === mySubject ? 700 : 400,
                                                                color: sub.name === mySubject ? 'var(--accent-purple)' : 'var(--text-primary)'
                                                            }}>
                                                                {sub.name === mySubject && '✏️ '}{sub.name}
                                                            </td>
                                                            <td>{sub.ia1}</td><td>{sub.ia2}</td><td>{sub.assignment}</td>
                                                            <td style={{ fontWeight: 700, color: sub.totalCIE >= 40 ? '#22c55e' : sub.totalCIE >= 25 ? '#f97316' : '#ef4444' }}>{sub.totalCIE}</td>
                                                            <td style={{ color: sub.attendancePct >= 75 ? '#22c55e' : '#ef4444' }}>{sub.attendancePct}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Edit own subject */}
                                    <div className="glass-card" style={{ padding: '1rem' }}>
                                        <p style={{ margin: '0 0 0.7rem', fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent-purple)' }}>
                                            ✏️ Edit — {mySubject}
                                        </p>

                                        {/* Module unit tests */}
                                        <p style={{ margin: '0 0 0.3rem', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Module Unit Tests (0–20 each)</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                            {editModules.map((m, i) => (
                                                <div key={m.moduleNo}>
                                                    <label style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', textAlign: 'center', marginBottom: 2 }}>M{m.moduleNo}</label>
                                                    <input type="number" min={0} max={20} value={m.unitTestMarks}
                                                        onChange={e => { const n = [...editModules]; n[i] = { ...n[i], unitTestMarks: Number(e.target.value) }; setEditModules(n) }}
                                                        className="ep-input" style={{ textAlign: 'center', padding: '0.35rem 0.2rem', fontSize: '0.78rem' }} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* IA1, IA2, Assignment, CIE preview */}
                                        <p style={{ margin: '0 0 0.3rem', fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>IA Exam & CIE (formula preview → /50)</p>
                                        <div className="cie-grid" style={{ marginBottom: '0.75rem' }}>
                                            {[
                                                { label: 'IA1 / 50', value: editIa1, set: setEditIa1, max: 50, color: '#4f8ef7' },
                                                { label: 'IA2 / 50', value: editIa2, set: setEditIa2, max: 50, color: '#9b59f7' },
                                                { label: 'Asgn / 10', value: editAssignment, set: setEditAssignment, max: 10, color: '#f97316' },
                                                { label: 'CIE / 50', value: previewCIE, readOnly: true, color: previewCIE >= 40 ? '#22c55e' : previewCIE >= 25 ? '#f97316' : '#ef4444' },
                                            ].map(({ label, value, set, max, color, readOnly }) => (
                                                <div key={label}>
                                                    <label style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>{label}</label>
                                                    <input type="number" min={0} max={max} value={value} readOnly={readOnly}
                                                        onChange={set ? e => set(Math.min(max, Math.max(0, Number(e.target.value)))) : undefined}
                                                        className="ep-input"
                                                        style={{ textAlign: 'center', fontWeight: 700, color, background: readOnly ? 'var(--bg-secondary)' : 'var(--input-bg)', padding: '0.45rem', fontSize: '0.85rem' }} />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Formula hint */}
                                        <p style={{ margin: '0 0 0.6rem', fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                                            Formula: ({editIa1}+{editIa2}+{editAssignment})÷110×50 = <strong style={{ color: previewCIE >= 40 ? '#22c55e' : previewCIE >= 25 ? '#f97316' : '#ef4444' }}>{previewCIE}/50</strong>
                                        </p>

                                        {/* Remarks */}
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Remarks</label>
                                        <textarea value={editRemarks} onChange={e => setEditRemarks(e.target.value)}
                                            rows={2} className="ep-input" style={{ resize: 'none', marginTop: 4, fontSize: '0.82rem' }} placeholder="Add remarks…" />

                                        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={saving} onClick={saveMarks}
                                            style={{
                                                marginTop: '0.75rem', width: '100%', padding: '0.65rem', borderRadius: '10px', border: 'none',
                                                background: 'linear-gradient(135deg,#4f8ef7,#9b59f7)', color: 'white', fontWeight: 700,
                                                cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.8 : 1, fontSize: '0.85rem'
                                            }}>
                                            {saving ? '🤖 Saving…' : '💾 Save & AI Analysis'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* ─── ATTENDANCE TAB ─── */}
                {tab === 'attendance' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <p style={{ margin: '0 0 0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                📅 Mark Attendance — <span style={{ color: 'var(--accent-purple)' }}>{mySubject}</span>
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 3 }}>Date</label>
                                    <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)}
                                        className="ep-input" style={{ width: 160, fontSize: '0.8rem' }} />
                                </div>
                                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10, padding: '0.5rem 0.8rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        Marking <strong>{students.length}</strong> students for <strong style={{ color: '#22c55e' }}>{attDate}</strong>
                                    </p>
                                </div>
                            </div>
                            <div className="vtu-table-container">
                                <table className="vtu-table">
                                    <thead><tr>
                                        <th style={{ textAlign: 'left' }}>#</th>
                                        <th style={{ textAlign: 'left' }}>USN</th>
                                        <th style={{ textAlign: 'left' }}>Name</th>
                                        <th>P</th>
                                        <th>A</th>
                                        <th>Att%</th>
                                    </tr></thead>
                                    <tbody>
                                        {students.map((s, idx) => {
                                            const sub = s.performance?.subjects?.find(x => x.name === mySubject)
                                            const isPresent = attMap[s.student.id] ?? true
                                            return (
                                                <tr key={s.student.id}>
                                                    <td style={{ color: 'var(--text-secondary)' }}>{idx + 1}</td>
                                                    <td style={{ textAlign: 'left', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{s.student.usn}</td>
                                                    <td style={{ textAlign: 'left', fontWeight: 600, fontSize: '0.78rem' }}>{s.student.name}</td>
                                                    <td><input type="radio" name={`att-${s.student.id}`} checked={isPresent} onChange={() => setAttMap(m => ({ ...m, [s.student.id]: true }))} /></td>
                                                    <td><input type="radio" name={`att-${s.student.id}`} checked={!isPresent} onChange={() => setAttMap(m => ({ ...m, [s.student.id]: false }))} /></td>
                                                    <td style={{ color: (sub?.attendancePct || 0) >= 75 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{sub?.attendancePct || 0}%</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={saving} onClick={submitAttendance}
                                style={{
                                    marginTop: '1rem', width: '100%', maxWidth: 300, padding: '0.65rem', borderRadius: '10px', border: 'none',
                                    background: 'linear-gradient(135deg,#22c55e,#4f8ef7)', color: 'white', fontWeight: 700,
                                    cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.8 : 1, fontSize: '0.85rem'
                                }}>
                                {saving ? 'Saving…' : '✅ Submit Attendance'}
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* ─── ANALYTICS TAB ─── */}
                {tab === 'analytics' && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="glass-card" style={{ padding: '1.1rem' }}>
                                <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>🎯 Risk Distribution</p>
                                <ResponsiveContainer width="100%" height={210}>
                                    <PieChart>
                                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                                            {pieData.map((e, i) => <Cell key={i} fill={RISK_COLORS[e.name] || '#8891a8'} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 12 }} />
                                        <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="glass-card" style={{ padding: '1.1rem' }}>
                                <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>📚 Learner Categories</p>
                                <ResponsiveContainer width="100%" height={210}>
                                    <BarChart data={analytics ? [
                                        { name: 'Fast', count: analytics.categoryBreakdown['Fast Learner'] || 0 },
                                        { name: 'Average', count: analytics.categoryBreakdown['Average Learner'] || 0 },
                                        { name: 'Slow', count: analytics.categoryBreakdown['Slow Learner'] || 0 },
                                    ] : []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                        <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)' }} />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="var(--accent-blue)" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <p style={{ margin: '0 0 0.75rem', fontWeight: 700, fontSize: '0.84rem', color: '#ef4444' }}>🚨 High Risk Students</p>
                            {students.filter(s => s.performance?.riskLevel === 'High').length === 0
                                ? <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>✅ No high-risk students.</p>
                                : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '0.5rem' }}>
                                    {students.filter(s => s.performance?.riskLevel === 'High').map(s => (
                                        <div key={s.student.id} className="glass-card" style={{ padding: '0.7rem 0.9rem', display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0, fontSize: '0.82rem' }}>
                                                {s.student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.78rem', color: 'var(--text-primary)' }}>{s.student.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.68rem', color: '#ef4444' }}>{s.performance?.performanceScore}pts</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            }
                        </div>
                    </motion.div>
                )}
            </main>

            <AnimatePresence>
                {chatStudent && (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        style={{ position: 'fixed', bottom: '1rem', right: '1rem', width: 'calc(100vw - 2rem)', maxWidth: 380, zIndex: 50 }}>
                        <MessageBox otherUser={chatStudent} onClose={() => setChatStudent(null)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
