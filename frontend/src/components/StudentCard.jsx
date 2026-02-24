import { motion } from 'framer-motion'

const riskStyle = {
    Low: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: '✅ Low' },
    Medium: { color: '#f97316', bg: 'rgba(249,115,22,0.12)', label: '⚠️ Medium' },
    High: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: '🔴 High' },
}

export default function StudentCard({ student, performance, onClick }) {
    const risk = riskStyle[performance?.riskLevel] || riskStyle.Medium
    const initial = student?.name?.charAt(0)?.toUpperCase()

    return (
        <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={onClick}
            className="glass-card p-4 cursor-pointer flex items-center gap-4 transition-all"
            style={{ borderColor: performance?.riskLevel === 'High' ? 'rgba(239,68,68,0.3)' : undefined }}
        >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4f8ef7, #9b59f7)' }}>
                {initial}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {student?.name}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{student?.email}</p>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex flex-col items-end gap-1">
                {performance?.performanceScore != null ? (
                    <>
                        <span className="text-sm font-bold" style={{ color: '#4f8ef7' }}>
                            {performance.performanceScore.toFixed(1)}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: risk.bg, color: risk.color }}>
                            {risk.label}
                        </span>
                    </>
                ) : (
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>No data</span>
                )}
            </div>
        </motion.div>
    )
}
