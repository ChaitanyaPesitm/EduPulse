import { useContext } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function Navbar() {
    const { user, logout } = useContext(AuthContext)
    const { isDark, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            style={{
                position: 'sticky', top: 0, zIndex: 100,
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
                backdropFilter: 'blur(12px)',
                padding: '0 1.5rem',
                height: '60px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: 'var(--shadow)',
            }}
        >
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.4rem' }}>⚡</span>
                <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    Edu<span className="gradient-text">Pulse</span>
                </span>
                {user?.role === 'teacher' && user?.subject && (
                    <span style={{
                        marginLeft: '0.5rem', fontSize: '0.7rem', fontWeight: 600,
                        padding: '2px 8px', borderRadius: '999px',
                        background: 'linear-gradient(135deg,#9b59f7,#4f8ef7)',
                        color: 'white',
                    }}>
                        {user.subject}
                    </span>
                )}
            </div>

            {/* Right side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Dark/Light toggle */}
                <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer', fontSize: '1rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    {isDark ? '☀️' : '🌙'}
                </motion.button>

                {/* User info */}
                {user && (
                    <>
                        <div style={{ textAlign: 'right' }} className="mobile-hide">
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {user.name.split(' ')[0]}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                {user.role === 'teacher' ? 'Teacher' : 'Student'}
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                            onClick={handleLogout}
                            style={{
                                padding: '0.35rem 0.75rem', borderRadius: '8px', border: 'none',
                                background: 'rgba(239,68,68,0.12)', color: '#ef4444',
                                fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
                            }}
                        >
                            Logout
                        </motion.button>
                    </>
                )}
            </div>
        </motion.nav>
    )
}
