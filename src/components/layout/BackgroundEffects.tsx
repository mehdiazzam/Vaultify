import { motion } from 'framer-motion';

export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="orb w-[500px] h-[500px]"
        style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)', top: '-10%', left: '-5%' }}
        animate={{ x: [0, 30, -20, 40, 0], y: [0, -40, 20, 10, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="orb w-[400px] h-[400px]"
        style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)', top: '60%', right: '-5%' }}
        animate={{ x: [0, -30, 20, -10, 0], y: [0, 20, -30, 40, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="orb w-[350px] h-[350px]"
        style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)', bottom: '10%', left: '30%' }}
        animate={{ x: [0, 40, -30, 20, 0], y: [0, -20, 30, -10, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="orb w-[300px] h-[300px]"
        style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)', top: '30%', left: '60%', opacity: 0.08 }}
        animate={{ x: [0, -20, 30, -40, 0], y: [0, 30, -20, 10, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
