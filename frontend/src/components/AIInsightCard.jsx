import { motion } from 'framer-motion'

const categoryConfig = {
    'Fast Learner': { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', emoji: '🚀', glow: 'glow-green' },
    'Average Learner': { color: '#f97316', bg: 'rgba(249,115,22,0.1)', emoji: '📈', glow: '' },
    'Slow Learner': { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', emoji: '📚', glow: 'glow-red' },
}

const riskConfig = {
    Low: { color: '#22c55e', label: 'Low Risk' },
    Medium: { color: '#f97316', label: 'Medium Risk' },
    High: { color: '#ef4444', label: 'High Risk' },
}

export default function AIInsightCard({ data }) {
    if (!data || data.performanceScore == null) {
        return (
            <div className="glass-card p-6">
                <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>🤖 AI Insights</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No AI analysis yet. Ask your teacher to update your academic data.
                </p>
            </div>
        )
    }

    const cat = categoryConfig[data.learnerCategory] || categoryConfig['Average Learner']
    const risk = riskConfig[data.riskLevel] || riskConfig.Medium

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`glass-card p-6 ${cat.glow}`}
        >
            <div className="flex items-center gap-2 mb-5">
                <span className="text-lg">🤖</span>
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>AI Performance Analysis</h3>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-5">
                {/* Performance Score */}
                <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(79,142,247,0.1)' }}>
                    <p className="text-2xl font-bold" style={{ color: '#4f8ef7' }}>
                        {data.performanceScore?.toFixed(1)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Score</p>
                </div>

                {/* Learner Category */}
                <div className="text-center p-3 rounded-xl" style={{ background: cat.bg }}>
                    <p className="text-xl">{cat.emoji}</p>
                    <p className="text-xs font-semibold mt-1 leading-tight" style={{ color: cat.color }}>
                        {data.learnerCategory?.replace(' Learner', '')}
                    </p>
                </div>

                {/* Risk Level */}
                <div className="text-center p-3 rounded-xl" style={{ background: `${risk.color}18` }}>
                    <p className="text-xl">{risk.color === '#22c55e' ? '✅' : risk.color === '#f97316' ? '⚠️' : '🔴'}</p>
                    <p className="text-xs font-semibold mt-1" style={{ color: risk.color }}>{risk.label}</p>
                </div>
            </div>

            {/* Score Bar */}
            <div className="mb-5">
                <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    <span>Performance Score</span>
                    <span style={{ color: cat.color }}>{data.performanceScore?.toFixed(1)} / 100</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'var(--border)' }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${data.performanceScore}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-2 rounded-full"
                        style={{ background: `linear-gradient(90deg, #4f8ef7, ${cat.color})` }}
                    />
                </div>
            </div>

            {/* Recommendation */}
            {data.recommendation && (
                <div className="p-3 rounded-xl text-sm leading-relaxed"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>💡 Recommendation: </span>
                    {data.recommendation}
                </div>
            )}
        </motion.div>
    )
}
