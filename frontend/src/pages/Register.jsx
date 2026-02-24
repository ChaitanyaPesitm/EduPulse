import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
    const { register, loading } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await register(form.name, form.email, form.password, form.role)
        if (result.success) {
            toast.success('Account created! Welcome to EduPulse AI 🎉')
            navigate(result.role === 'teacher' ? '/teacher' : '/student')
        } else {
            toast.error(result.message)
        }
    }

    const inputStyle = {
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: 'var(--bg-primary)' }}>
            <div className="absolute top-[-80px] right-[-80px] w-[350px] h-[350px] rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, #9b59f7, transparent)' }} />
            <div className="absolute bottom-[-80px] left-[-80px] w-[350px] h-[350px] rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, #4f8ef7, transparent)' }} />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card w-full max-w-md p-10 mx-4"
            >
                <div className="text-center mb-8">
                    <span className="text-3xl">🎓</span>
                    <h1 className="text-2xl font-bold gradient-text mt-1">Create Account</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Join EduPulse AI today</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe' },
                        { label: 'Email Address', name: 'email', type: 'email', placeholder: 'you@example.com' },
                        { label: 'Password', name: 'password', type: 'password', placeholder: '••••••••' },
                    ].map(({ label, name, type, placeholder }) => (
                        <div key={name}>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                                {label}
                            </label>
                            <input
                                name={name} type={type} placeholder={placeholder}
                                value={form[name]} onChange={handleChange} required
                                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = '#4f8ef7'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>
                    ))}

                    {/* Role selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                            I am a…
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {['student', 'teacher'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setForm({ ...form, role })}
                                    className="py-3 rounded-xl text-sm font-semibold capitalize transition-all"
                                    style={{
                                        background: form.role === role ? 'linear-gradient(135deg, #4f8ef7, #9b59f7)' : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${form.role === role ? 'transparent' : 'var(--border)'}`,
                                        color: form.role === role ? 'white' : 'var(--text-secondary)',
                                    }}
                                >
                                    {role === 'student' ? '👨‍🎓 Student' : '👩‍🏫 Teacher'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 rounded-xl font-semibold text-white mt-2"
                        style={{ background: 'linear-gradient(135deg, #4f8ef7, #9b59f7)' }}
                    >
                        {loading ? 'Creating account…' : 'Create Account'}
                    </motion.button>

                    <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#4f8ef7' }} className="hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </form>
            </motion.div>
        </div>
    )
}
