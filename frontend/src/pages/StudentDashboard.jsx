import { useState, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import Navbar from '../components/Navbar'
import MessageBox from '../components/MessageBox'
import { CardSkeleton } from '../components/Skeleton'
import { AuthContext } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

const SUBJECT_COLORS = ['#4f8ef7', '#9b59f7', '#22c55e', '#f97316', '#ef4444']
const riskStyle = r =>
    r === 'Low'
        ? { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' }
        : r === 'High'
            ? { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' }
            : { bg: 'rgba(249,115,22,0.12)', color: '#f97316' }

export default function StudentDashboard() {
    const { user } = useContext(AuthContext)
    const [data, setData] = useState(null)
    const [teachers, setTeachers] = useState([])
    const [chatTeacher, setChatTeacher] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeSubject, setActiveSubject] = useState(0)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [dRes, tRes] = await Promise.all([
                api.get('/student/performance'),
                api.get('/student/teachers'),
            ])
            setData(dRes.data.data)
            setTeachers(tRes.data.data || [])
        } catch { toast.error('Failed to load data') }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [])

    if (loading) return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                </div>
                <CardSkeleton />
            </main>
        </div>
    )

    const subjects = data?.subjects || []
    const avgCIE = subjects.length ? (subjects.reduce((a, s) => a + s.totalCIE, 0) / subjects.length).toFixed(1) : 0
    const avgAtt = subjects.length ? (subjects.reduce((a, s) => a + s.attendancePct, 0) / subjects.length).toFixed(1) : 0
    const risk = data?.riskLevel || 'Not Analyzed'
    const rs = riskStyle(risk)
    const radarData = subjects.map(s => ({ subject: s.name.split(' ').slice(0, 2).join(' '), CIE: s.totalCIE }))

    const activeSub = subjects[activeSubject]

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' }}>

                {/* Welcome */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '1.25rem' }}>
                    <h1 style={{ margin: 0, fontWeight: 800, fontSize: '1.7rem', color: 'var(--text-primary)' }}>
                        🎓 Hello, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!
                    </h1>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                        VTU 6th Sem CSE — PESITM 2025-26
                    </p>
                </motion.div>

                {/* Stat cards */}
                <div className="stats-grid">
                    {[
                        { label: 'Performance Score', value: data?.performanceScore ?? '—', color: '#4f8ef7', icon: '📊' },
                        { label: 'Avg CIE (out of 50)', value: avgCIE, color: '#9b59f7', icon: '📝' },
                        { label: 'Avg Attendance', value: `${avgAtt}%`, color: '#22c55e', icon: '📅' },
                        { label: 'Risk Level', value: risk, color: rs.color, icon: '🎯', bg: rs.bg },
                    ].map(({ label, value, color, icon, bg }) => (
                        <motion.div key={label} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                            className="glass-card" style={{ padding: '0.85rem', background: bg || 'var(--bg-card)', borderLeft: `3px solid ${color}` }}>
                            <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{icon} {label}</p>
                            <p style={{ margin: '0.2rem 0 0', fontWeight: 800, fontSize: '1.2rem', color }}>{value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main grid */}
                <div className="dashboard-grid">

                    {/* Subjects panel */}
                    <div className="glass-card" style={{ padding: '1.25rem' }}>
                        <p style={{ margin: '0 0 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>📋 Subject Performance (CIE / 50)</p>

                        {/* Subject pill tabs */}
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            {subjects.map((s, i) => (
                                <button key={s.code} onClick={() => setActiveSubject(i)} style={{
                                    padding: '0.3rem 0.75rem', borderRadius: '999px',
                                    border: `1px solid ${activeSubject === i ? 'transparent' : 'var(--border)'}`,
                                    background: activeSubject === i ? SUBJECT_COLORS[i] : 'var(--bg-secondary)',
                                    color: activeSubject === i ? 'white' : 'var(--text-secondary)',
                                    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                }}>
                                    {s.name.split(' ').slice(0, 1).join(' ')}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeSub && (
                                <motion.div key={activeSubject} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                                    {/* Subject header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: SUBJECT_COLORS[activeSubject] }}>{activeSub.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                                {activeSub.code} | {activeSub.teacher}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>CIE Total</p>
                                            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.4rem', color: SUBJECT_COLORS[activeSubject] }}>
                                                {activeSub.totalCIE}<span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>/50</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Module unit test table */}
                                    <div className="vtu-table-container">
                                        <table className="vtu-table">
                                            <thead>
                                                <tr>
                                                    <th>Module</th>
                                                    <th>UT (/20)</th>
                                                    <th>IA</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(activeSub.modules || []).map(m => (
                                                    <tr key={m.moduleNo}>
                                                        <td style={{ fontWeight: 600, color: SUBJECT_COLORS[activeSubject] }}>M{m.moduleNo}</td>
                                                        <td style={{ fontWeight: 700 }}>{m.unitTestMarks}</td>
                                                        <td style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                                                            {m.moduleNo <= 2 ? 'IA1' : m.moduleNo === 3 ? 'IA1/2' : 'IA2'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* CIE Breakdown cards */}
                                    <div className="cie-grid">
                                        {[
                                            { label: 'IA1', value: activeSub.ia1 ?? 0, max: 20, color: '#4f8ef7' },
                                            { label: 'IA2', value: activeSub.ia2 ?? 0, max: 20, color: '#9b59f7' },
                                            { label: 'Asgn', value: activeSub.assignment ?? 0, max: 10, color: '#f97316' },
                                            { label: 'CIE', value: activeSub.totalCIE ?? 0, max: 50, color: SUBJECT_COLORS[activeSubject] },
                                        ].map(({ label, value, max, color }) => (
                                            <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.5rem', textAlign: 'center' }}>
                                                <p style={{ margin: 0, fontSize: '0.64rem', color: 'var(--text-secondary)' }}>{label}</p>
                                                <p style={{ margin: '0.1rem 0 0', fontWeight: 800, fontSize: '1rem', color }}>
                                                    {value}<span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>/{max}</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Attendance */}
                                    <div style={{ marginTop: '1rem', background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>📅 Attendance</span>
                                            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: (activeSub.attendancePct || 0) >= 75 ? '#22c55e' : '#ef4444' }}>
                                                {activeSub.attendancePct || 0}%
                                            </span>
                                        </div>
                                        <div style={{ marginTop: '0.4rem', height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                                            <div style={{ width: `${activeSub.attendancePct || 0}%`, height: '100%', background: (activeSub.attendancePct || 0) >= 75 ? '#22c55e' : '#ef4444', borderRadius: 999, transition: 'width 0.5s' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                                            {(activeSub.attendance || []).slice(-6).map((a, i) => (
                                                <span key={i} style={{
                                                    fontSize: '0.62rem', padding: '1px 5px', borderRadius: 999,
                                                    background: a.present ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                                    color: a.present ? '#22c55e' : '#ef4444'
                                                }}>
                                                    {a.date.slice(5)} {a.present ? '✓' : '✗'}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                        {/* Radar */}
                        <div className="glass-card" style={{ padding: '0.75rem' }}>
                            <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>📡 CIE Radar</p>
                            <ResponsiveContainer width="100%" height={160}>
                                <RadarChart data={radarData} outerRadius="70%">
                                    <PolarGrid stroke="var(--border)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 9 }} />
                                    <Radar name="CIE" dataKey="CIE" stroke="#4f8ef7" fill="#4f8ef7" fillOpacity={0.25} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 11 }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* AI Insight */}
                        <div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-purple)' }}>
                            <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>🤖 AI Insight</p>
                            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                                <span style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: 999, background: 'rgba(155,89,247,0.12)', color: '#9b59f7' }}>{data?.learnerCategory || '—'}</span>
                                <span style={{ fontSize: '0.7rem', padding: '1px 8px', borderRadius: 999, ...riskStyle(risk) }}>{risk}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                                {data?.recommendation || 'Ask your teacher to update your marks to get AI insights.'}
                            </p>
                        </div>

                        {/* Message Teachers */}
                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <p style={{ margin: '0 0 0.6rem', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>📨 Message Teacher</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }} className="lg:block">
                                {teachers.map(t => (
                                    <button key={t.id} onClick={() => setChatTeacher({ id: t.id, name: t.name, role: 'teacher' })}
                                        style={{
                                            width: '100%', marginBottom: '0.2rem', padding: '0.4rem 0.6rem',
                                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                            borderRadius: 8, cursor: 'pointer', color: 'var(--text-primary)'
                                        }}>
                                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'linear-gradient(135deg,#9b59f7,#4f8ef7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.65rem', flexShrink: 0 }}>
                                            {t.name.charAt(0)}
                                        </div>
                                        <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                                            <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name.split(' ')[0]}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Chat overlay */}
            <AnimatePresence>
                {chatTeacher && (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        style={{ position: 'fixed', bottom: '1rem', right: '1rem', width: 'calc(100vw - 2rem)', maxWidth: 380, zIndex: 50 }}>
                        <MessageBox otherUser={chatTeacher} onClose={() => setChatTeacher(null)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
