import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

function TiltCard({ children, onClick, style, glow }) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                ...style
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="glass-card"
        >
            <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d", width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                {children}
            </div>
        </motion.div>
    );
}

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
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotateZ: [0, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{
                        position: 'absolute', top: '15%', left: '10%',
                        width: 120, height: 120,
                        background: 'linear-gradient(135deg, rgba(79,142,247,0.2), rgba(108,99,255,0.05))',
                        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                        filter: 'blur(2px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                />
                <motion.div
                    animate={{
                        y: [0, 30, 0],
                        rotateZ: [360, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                    style={{
                        position: 'absolute', bottom: '15%', right: '10%',
                        width: 180, height: 180,
                        background: 'linear-gradient(135deg, rgba(155,89,247,0.15), rgba(224,64,251,0.05))',
                        borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                        filter: 'blur(3px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                />
            </div>

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
