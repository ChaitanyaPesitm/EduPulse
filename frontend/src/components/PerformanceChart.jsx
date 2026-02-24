import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
        return (
            <div className="rounded-xl px-3 py-2 text-sm"
                style={{ background: '#1e2130', border: '1px solid #2d3148', color: '#e8eaf0' }}>
                <p className="font-semibold">{payload[0].name}</p>
                <p style={{ color: '#4f8ef7' }}>{payload[0].value} / 100</p>
            </div>
        )
    }
    return null
}

export default function PerformanceChart({ subjectMarks = [], type = 'bar' }) {
    if (!subjectMarks || subjectMarks.length === 0) {
        return (
            <div className="glass-card p-6 flex items-center justify-center min-h-[200px]">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No subject data available yet.</p>
            </div>
        )
    }

    const data = subjectMarks.map((s) => ({ name: s.subject, Marks: s.marks }))

    if (type === 'radar') {
        return (
            <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={data}>
                    <PolarGrid stroke="#2d3148" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#8891a8', fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#8891a8', fontSize: 9 }} />
                    <Radar name="Marks" dataKey="Marks" stroke="#4f8ef7" fill="#4f8ef7" fillOpacity={0.3} />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
                <XAxis dataKey="name" tick={{ fill: '#8891a8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#8891a8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Marks" fill="#4f8ef7" radius={[6, 6, 0, 0]}
                    background={{ fill: 'rgba(255,255,255,0.02)', radius: [6, 6, 0, 0] }} />
            </BarChart>
        </ResponsiveContainer>
    )
}
