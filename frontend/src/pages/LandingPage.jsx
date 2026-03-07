import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import TiltCard from '../components/TiltCard'
import Background3D from '../components/Background3D'

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
                perspective: '1000px'
            }}
        >
            {/* 3D Background Objects */}
            <Background3D />

            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 860, width: '100%' }}>
                {/* Logo / Title */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, z: -100 }}
                    animate={{ opacity: 1, scale: 1, z: 0 }}
                    transition={{ duration: 0.8, type: 'spring' }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        style={{ fontSize: '3.5rem', marginBottom: '0.5rem', display: 'inline-block' }}
                    >
                        <img src="/logo.png" alt="EduPulse" style={{ width: 80, height: 80, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }} />
                    </motion.div>
                    <h1 style={{ fontSize: '3.2rem', fontWeight: 900, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        Edu<span className="gradient-text">Pulse</span> AI
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem', fontSize: '1.2rem', fontWeight: 500 }}>
                        Smart Academic Intelligence Platform
                    </p>
                </motion.div>

                {/* Portal cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '4rem', perspective: '1200px' }}>
                    {portals.map((p, i) => (
                        <TiltCard
                            key={p.role}
                            onClick={() => navigate(p.path)}
                            glow={p.glow}
                            style={{
                                padding: '3rem 2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1.5rem',
                                boxShadow: `0 20px 50px -12px ${p.glow}`,
                            }}
                        >
                            {/* Icon circle */}
                            <div style={{
                                width: 90, height: 90, borderRadius: '24px',
                                background: p.gradient,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2.5rem',
                                transform: 'translateZ(30px)',
                                boxShadow: `0 12px 32px ${p.glow}`,
                            }}>
                                {p.icon}
                            </div>

                            <h2 style={{ margin: 0, fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)', transform: 'translateZ(20px)' }}>
                                {p.label}
                            </h2>
                            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, transform: 'translateZ(10px)' }}>
                                {p.desc}
                            </p>

                            {/* CTA button */}
                            <motion.button
                                whileHover={{ scale: 1.05, translateZ: "40px" }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.8rem 2.5rem',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: p.gradient,
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    boxShadow: `0 8px 20px ${p.glow}`,
                                    transform: 'translateZ(20px)'
                                }}
                            >
                                Get Started →
                            </motion.button>
                        </TiltCard>
                    ))}
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    style={{ marginTop: '3.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}
                >
                    Experience the future of education management.
                </motion.p>
            </div>
        </div>
    )
}
