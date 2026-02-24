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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                    {[
                        { label: 'Performance Score', value: data?.performanceScore ?? '—', color: '#4f8ef7', icon: '📊' },
                        { label: 'Avg CIE (out of 50)', value: avgCIE, color: '#9b59f7', icon: '📝' },
                        { label: 'Avg Attendance', value: `${avgAtt}%`, color: '#22c55e', icon: '📅' },
                        { label: 'Risk Level', value: risk, color: rs.color, icon: '🎯', bg: rs.bg },
                    ].map(({ label, value, color, icon, bg }) => (
                        <motion.div key={label} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                            className="glass-card" style={{ padding: '1rem', background: bg || 'var(--bg-card)', borderLeft: `3px solid ${color}` }}>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{icon} {label}</p>
                            <p style={{ margin: '0.3rem 0 0', fontWeight: 800, fontSize: '1.35rem', color }}>{value}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', marginBottom: '1.25rem' }}>

                    {/* Subjects panel */}
                    <div className="glass-card" style={{ padding: '1.25rem' }}>
                        <p style={{ margin: '0 0 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>📋 Subject-wise Performance (CIE / 50)</p>

                        {/* Subject pill tabs */}
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            {subjects.map((s, i) => (
                                <button key={s.code} onClick={() => setActiveSubject(i)} style={{
                                    padding: '0.35rem 0.85rem', borderRadius: '999px',
                                    border: `1px solid ${activeSubject === i ? 'transparent' : 'var(--border)'}`,
                                    background: activeSubject === i ? SUBJECT_COLORS[i] : 'var(--bg-secondary)',
                                    color: activeSubject === i ? 'white' : 'var(--text-secondary)',
                                    fontSize: '0.76rem', fontWeight: 600, cursor: 'pointer',
                                }}>
                                    {s.name.split(' ').slice(0, 2).join(' ')}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {activeSub && (
                                <motion.div key={activeSubject} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

                                    {/* Subject header */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                        <div>
                                            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: SUBJECT_COLORS[activeSubject] }}>{activeSub.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                Code: {activeSub.code} &nbsp;|&nbsp; Teacher: {activeSub.teacher}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>CIE Total</p>
                                            <p style={{ margin: 0, fontWeight: 800, fontSize: '1.6rem', color: SUBJECT_COLORS[activeSubject] }}>
                                                {activeSub.totalCIE}<span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/50</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Module unit test table */}
                                    <table className="vtu-table">
                                        <thead>
                                            <tr>
                                                <th>Module</th>
                                                <th>Unit Test (/20)</th>
                                                <th>Covered in</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(activeSub.modules || []).map(m => (
                                                <tr key={m.moduleNo}>
                                                    <td style={{ fontWeight: 600, color: SUBJECT_COLORS[activeSubject] }}>Module {m.moduleNo}</td>
                                                    <td style={{ fontWeight: 700 }}>{m.unitTestMarks}</td>
                                                    <td style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                                        {m.moduleNo <= 2 ? 'IA1' : m.moduleNo === 3 ? 'IA1 & IA2' : 'IA2'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* CIE Breakdown cards */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.6rem', marginTop: '0.75rem' }}>
                                        {[
                                            { label: 'IA1 Score', value: activeSub.ia1 ?? 0, max: 20, color: '#4f8ef7' },
                                            { label: 'IA2 Score', value: activeSub.ia2 ?? 0, max: 20, color: '#9b59f7' },
                                            { label: 'Assignment', value: activeSub.assignment ?? 0, max: 10, color: '#f97316' },
                                            { label: 'Total CIE', value: activeSub.totalCIE ?? 0, max: 50, color: SUBJECT_COLORS[activeSubject] },
                                        ].map(({ label, value, max, color }) => (
                                            <div key={label} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
                                                <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{label}</p>
                                                <p style={{ margin: '0.2rem 0 0', fontWeight: 800, fontSize: '1.1rem', color }}>
                                                    {value}<span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>/{max}</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Attendance */}
                                    <div style={{ marginTop: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.75rem 1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>📅 Attendance</span>
                                            <span style={{ fontWeight: 800, fontSize: '1rem', color: (activeSub.attendancePct || 0) >= 75 ? '#22c55e' : '#ef4444' }}>
                                                {activeSub.attendancePct || 0}%
                                            </span>
                                        </div>
                                        <div style={{ marginTop: '0.4rem', height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                                            <div style={{ width: `${activeSub.attendancePct || 0}%`, height: '100%', background: (activeSub.attendancePct || 0) >= 75 ? '#22c55e' : '#ef4444', borderRadius: 999, transition: 'width 0.5s' }} />
                                        </div>
                                        <p style={{ margin: '0.3rem 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                                            {activeSub.attendance?.length || 0} classes recorded — {activeSub.attendance?.filter(a => a.present).length || 0} attended
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                                            {(activeSub.attendance || []).slice(-8).map((a, i) => (
                                                <span key={i} style={{
                                                    fontSize: '0.68rem', padding: '2px 6px', borderRadius: 999,
                                                    background: a.present ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                                                    color: a.present ? '#22c55e' : '#ef4444'
                                                }}>
                                                    {a.date} {a.present ? '✓' : '✗'}
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
                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>📡 CIE Radar</p>
                            <ResponsiveContainer width="100%" height={180}>
                                <RadarChart data={radarData} outerRadius="80%">
                                    <PolarGrid stroke="var(--border)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                                    <Radar name="CIE" dataKey="CIE" stroke="#4f8ef7" fill="#4f8ef7" fillOpacity={0.25} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)', fontSize: 12 }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* AI Insight */}
                        <div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-purple)' }}>
                            <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>🤖 AI Insight</p>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(155,89,247,0.15)', color: '#9b59f7' }}>{data?.learnerCategory || '—'}</span>
                                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 999, ...riskStyle(risk) }}>{risk}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {data?.recommendation || 'Ask your teacher to update your marks to get AI insights.'}
                            </p>
                        </div>

                        {/* Teacher Remarks */}
                        {data?.remarks && (
                            <div className="glass-card" style={{ padding: '1rem', borderLeft: '3px solid #f97316' }}>
                                <p style={{ margin: '0 0 0.5rem', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>💬 Teacher Remarks</p>
                                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>"{data.remarks}"</p>
                            </div>
                        )}

                        {/* Message Teachers */}
                        <div className="glass-card" style={{ padding: '1rem' }}>
                            <p style={{ margin: '0 0 0.6rem', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>📨 Message a Teacher</p>
                            {teachers.map(t => (
                                <button key={t.id} onClick={() => setChatTeacher({ id: t.id, name: t.name, role: 'teacher' })}
                                    style={{
                                        width: '100%', marginBottom: '0.4rem', padding: '0.5rem 0.85rem',
                                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                                        borderRadius: 10, cursor: 'pointer', color: 'var(--text-primary)'
                                    }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#9b59f7,#4f8ef7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>
                                        {t.name.charAt(0)}
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600 }}>{t.name}</p>
                                        <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{t.subject}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Chat overlay */}
            <AnimatePresence>
                {chatTeacher && (
                    <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', width: 380, zIndex: 50 }}>
                        <MessageBox otherUser={chatTeacher} onClose={() => setChatTeacher(null)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
