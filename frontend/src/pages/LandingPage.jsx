import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function LandingPage() {
    const navigate = useNavigate()

    const portals = [
        {
            role: 'student',
            label: 'Student Portal',
            icon: '🎓',
            desc: 'View your performance, AI insights, and chat with your teacher.',
            gradient: 'linear-gradient(135deg, #4f8ef7 0%, #6c63ff 100%)',
            glow: 'rgba(79,142,247,0.35)',
            path: '/student-login',
        },
        {
            role: 'teacher',
            label: 'Teacher Portal',
            icon: '👩‍🏫',
            desc: 'Manage students, update marks, run AI analysis, and send feedback.',
            gradient: 'linear-gradient(135deg, #9b59f7 0%, #e040fb 100%)',
            glow: 'rgba(155,89,247,0.35)',
            path: '/teacher-login',
        },
    ]

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'var(--bg-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background blobs */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
                <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', top: '-10%', left: '-10%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.15), transparent 70%)' }} />
                <motion.div animate={{ x: [0, -40, 0], y: [0, 30, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,89,247,0.15), transparent 70%)' }} />
            </div>

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 860, width: '100%' }}>
                {/* Logo / Title */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>⚡</div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        Edu<span className="gradient-text">Pulse</span> AI
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.6rem', fontSize: '1.05rem' }}>
                        Smart Academic Intelligence Platform
                    </p>
                </motion.div>

                {/* Portal cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '3rem' }}>
                    {portals.map((p, i) => (
                        <motion.div
                            key={p.role}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.15, duration: 0.5 }}
                            whileHover={{ scale: 1.03, y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(p.path)}
                            style={{
                                cursor: 'pointer',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                borderRadius: '1.5rem',
                                padding: '2.5rem 2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem',
                                boxShadow: `0 8px 40px ${p.glow}`,
                                transition: 'box-shadow 0.3s',
                            }}
                        >
                            {/* Icon circle */}
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: p.gradient,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2.2rem',
                                boxShadow: `0 6px 24px ${p.glow}`,
                            }}>
                                {p.icon}
                            </div>

                            <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.4rem', color: 'var(--text-primary)' }}>
                                {p.label}
                            </h2>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                                {p.desc}
                            </p>

                            {/* CTA button */}
                            <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                style={{
                                    marginTop: '0.5rem',
                                    padding: '0.65rem 2rem',
                                    borderRadius: '999px',
                                    border: 'none',
                                    background: p.gradient,
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    boxShadow: `0 4px 16px ${p.glow}`,
                                }}
                            >
                                Sign In →
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    style={{ marginTop: '2.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}
                >
                    New here? Ask your teacher to create your account.
                </motion.p>
            </div>
        </div>
    )
}
