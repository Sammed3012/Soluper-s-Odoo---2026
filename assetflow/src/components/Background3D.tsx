import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export default function Background3D() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const squares = Array.from({ length: 30 });
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-slate-50" style={{ perspective: '1000px' }}>
      <div className="absolute inset-0 z-20 bg-gradient-to-br from-indigo-50/80 via-white/40 to-purple-50/80 backdrop-blur-[6px]" />
      
      <div className="absolute inset-0 z-10" style={{ transformStyle: 'preserve-3d' }}>
        {squares.map((_, i) => {
          const size = Math.random() * 120 + 30;
          const left = `${Math.random() * 100}%`;
          const top = `${Math.random() * 100}%`;
          const depth = Math.random() * 600 - 300; // Z-axis translation
          const duration = Math.random() * 20 + 20;
          const delay = Math.random() * -20; // Start at different points
          
          return (
            <motion.div
              key={i}
              className="absolute rounded-3xl border border-white/60 bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 shadow-[0_8px_32px_rgba(0,0,0,0.05)]"
              style={{
                width: size,
                height: size,
                left,
                top,
              }}
              initial={{ 
                rotateX: Math.random() * 360, 
                rotateY: Math.random() * 360,
                rotateZ: Math.random() * 360,
                z: depth,
                y: 0,
              }}
              animate={{
                rotateX: ["+=0", "+=180", "+=360"],
                rotateY: ["+=0", "+=180", "+=360"],
                y: [0, -150, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
                delay: delay
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
