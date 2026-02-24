import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function MessageBox({ otherUser, onClose }) {
    const { user } = useAuth()
    const [messages, setMessages] = useState([])
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    const fetchMessages = async () => {
        try {
            const { data } = await api.get(`/messages/${otherUser.id}`)
            setMessages(data.data || [])
        } catch {
            toast.error('Failed to load messages')
        }
    }

    useEffect(() => {
        if (otherUser?.id) fetchMessages()
        const interval = setInterval(fetchMessages, 5000) // Poll every 5s
        return () => clearInterval(interval)
    }, [otherUser])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!text.trim()) return
        setLoading(true)
        try {
            await api.post('/messages', { receiverId: otherUser.id, message: text.trim() })
            setText('')
            await fetchMessages()
        } catch {
            toast.error('Failed to send message')
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="glass-card flex flex-col"
            style={{ height: '420px' }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: 'linear-gradient(135deg, #9b59f7, #4f8ef7)', color: 'white' }}>
                        {otherUser?.name?.charAt(0)}
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{otherUser?.name}</p>
                        <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>{otherUser?.role}</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="text-sm px-2 py-1 rounded-lg transition-colors"
                        style={{ color: 'var(--text-secondary)' }}>✕</button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                    <p className="text-center text-sm mt-8" style={{ color: 'var(--text-secondary)' }}>
                        No messages yet. Start the conversation!
                    </p>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId?._id === user.id || msg.senderId?.toString() === user.id
                        return (
                            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-xs px-4 py-2 rounded-2xl text-sm"
                                    style={{
                                        background: isMe ? 'linear-gradient(135deg, #4f8ef7, #9b59f7)' : 'var(--bg-secondary)',
                                        color: isMe ? 'white' : 'var(--text-primary)',
                                        borderBottomRightRadius: isMe ? '4px' : '16px',
                                        borderBottomLeftRadius: isMe ? '16px' : '4px',
                                    }}>
                                    <p>{msg.message}</p>
                                    <p className="text-xs mt-1 opacity-70">{formatTime(msg.createdAt)}</p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
                <input
                    value={text} onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message…"
                    className="flex-1 px-4 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                <motion.button
                    type="submit" disabled={loading || !text.trim()}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white"
                    style={{ background: 'linear-gradient(135deg, #4f8ef7, #9b59f7)', opacity: !text.trim() ? 0.5 : 1 }}
                >
                    Send
                </motion.button>
            </form>
        </motion.div>
    )
}
