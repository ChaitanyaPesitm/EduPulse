import { useState, useContext } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function StudentLogin() {
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const result = await login(form.email, form.password)
        setLoading(false)
        if (result.success) {
            if (result.role !== 'student') {
                toast.error('This portal is for students only. Use the Teacher portal.')
                return
            }
            toast.success('Welcome back! 🎓')
            navigate('/student')
        } else {
            toast.error(result.message || 'Invalid credentials')
        }
    }

    const fillDemo = () => setForm({ email: '4pm23cs001@edupulse.com', password: 'student123' })

    return (
        <div style={{
            minHeight: '100vh', background: 'var(--bg-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', position: 'relative', overflow: 'hidden',
        }}>
            {/* Background blobs */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
                <motion.div animate={{ x: [0, 50, 0], y: [0, -40, 0] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', top: '-15%', left: '-15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,247,0.18), transparent 70%)' }} />
                <motion.div animate={{ x: [0, -30, 0], y: [0, 40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', bottom: '-15%', right: '-15%', width: 450, height: 450, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108,99,255,0.15), transparent 70%)' }} />
            </div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>

                {/* Back link */}
                <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
                    ← Back to portal selection
                </Link>

                <div className="glass-card" style={{ padding: '2.5rem' }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1rem',
                            background: 'linear-gradient(135deg, #4f8ef7, #6c63ff)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2rem', boxShadow: '0 8px 24px rgba(79,142,247,0.4)',
                        }}>🎓</div>
                        <h1 style={{ margin: 0, fontWeight: 800, fontSize: '1.6rem', color: 'var(--text-primary)' }}>Student Login</h1>
                        <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Access your academic dashboard
                        </p>
                    </div>

                    {/* Demo hint */}
                    <motion.div whileHover={{ scale: 1.01 }} onClick={fillDemo}
                        style={{
                            cursor: 'pointer', marginBottom: '1.5rem', padding: '0.7rem 1rem',
                            borderRadius: '10px', background: 'rgba(79,142,247,0.08)',
                            border: '1px dashed rgba(79,142,247,0.4)', textAlign: 'center',
                            color: 'var(--text-secondary)', fontSize: '0.8rem',
                        }}>
                        🎓 Demo: <strong style={{ color: '#4f8ef7' }}>4pm23cs001@edupulse.com</strong> / <strong style={{ color: '#4f8ef7' }}>student123</strong> — click to fill
                    </motion.div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { key: 'email', label: 'Email Address', type: 'email', placeholder: 'student@school.com' },
                            { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
                        ].map(({ key, label, type, placeholder }) => (
                            <div key={key}>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>{label}</label>
                                <input
                                    type={type}
                                    placeholder={placeholder}
                                    value={form[key]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    required
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                                        color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none',
                                        boxSizing: 'border-box',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>
                        ))}

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                marginTop: '0.5rem', padding: '0.85rem',
                                borderRadius: '12px', border: 'none',
                                background: 'linear-gradient(135deg, #4f8ef7, #6c63ff)',
                                color: 'white', fontWeight: 700, fontSize: '1rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: '0 6px 20px rgba(79,142,247,0.4)',
                                opacity: loading ? 0.8 : 1,
                            }}
                        >
                            {loading ? 'Signing in…' : 'Sign In →'}
                        </motion.button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Are you a teacher?{' '}
                        <Link to="/teacher-login" style={{ color: '#9b59f7', fontWeight: 600, textDecoration: 'none' }}>
                            Teacher portal →
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
