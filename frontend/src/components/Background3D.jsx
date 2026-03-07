import { motion } from 'framer-motion'

export default function Background3D() {
    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            <motion.div
                animate={{
                    y: [0, -40, 0],
                    rotateZ: [0, 360],
                    scale: [1, 1.1, 1],
                    x: [0, 20, 0]
                }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute', top: '10%', left: '5%',
                    width: 250, height: 250,
                    background: 'radial-gradient(circle, rgba(79,142,247,0.15), transparent 70%)',
                    borderRadius: '40% 60% 70% 30% / 40% 50% 60% 70%',
                    filter: 'blur(40px)',
                }}
            />
            <motion.div
                animate={{
                    y: [0, 50, 0],
                    rotateZ: [360, 0],
                    scale: [1, 1.2, 1],
                    x: [0, -30, 0]
                }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute', bottom: '10%', right: '5%',
                    width: 300, height: 300,
                    background: 'radial-gradient(circle, rgba(155,89,247,0.12), transparent 70%)',
                    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
                    filter: 'blur(50px)',
                }}
            />
            <motion.div
                animate={{
                    rotate: [0, 360],
                    x: [0, 100, 0],
                    y: [0, 100, 0]
                }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
                style={{
                    position: 'absolute', top: '40%', left: '40%',
                    width: 150, height: 150,
                    background: 'radial-gradient(circle, rgba(34,197,94,0.08), transparent 70%)',
                    borderRadius: '50%',
                    filter: 'blur(30px)',
                }}
            />
        </div>
    )
}
