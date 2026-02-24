import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
    const { login, loading } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await login(form.email, form.password)
        if (result.success) {
            toast.success(`Welcome back! Redirecting to your dashboard…`)
            navigate(result.role === 'teacher' ? '/teacher' : '/student')
        } else {
            toast.error(result.message)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: 'var(--bg-primary)' }}>
            {/* Background orbs */}
            <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #4f8ef7, transparent)' }} />
            <div className="absolute bottom-[-100px] right-[-100px] w-[400px] h-[400px] rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #9b59f7, transparent)' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card w-full max-w-md p-10 mx-4"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-3">
                        <span className="text-3xl">🎓</span>
                        <span className="text-2xl font-bold gradient-text">EduPulse AI</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Sign in to your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                            Email Address
                        </label>
                        <input
                            name="email" type="email"
                            value={form.email} onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                            }}
                            onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                            Password
                        </label>
                        <input
                            name="password" type="password"
                            value={form.password} onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                            }}
                            onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                        />
                    </div>

                    {/* Demo credentials hint */}
                    <div className="rounded-xl p-3 text-xs" style={{ background: 'rgba(79,142,247,0.1)', color: '#4f8ef7', border: '1px solid rgba(79,142,247,0.2)' }}>
                        <strong>Demo:</strong> teacher@edupulse.com / teacher123 &nbsp;|&nbsp; alex@edupulse.com / student123
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl font-semibold text-white transition-all"
                        style={{ background: 'linear-gradient(135deg, #4f8ef7, #9b59f7)' }}
                    >
                        {loading ? 'Signing in…' : 'Sign In'}
                    </motion.button>

                    <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#4f8ef7' }} className="hover:underline font-medium">
                            Register
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    )
}
