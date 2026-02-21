import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SkipFeedbackHandle {
  trigger: (direction: 'forward' | 'backward') => void;
}

export const SkipFeedback = forwardRef<SkipFeedbackHandle>((_, ref) => {
  const [feedbacks, setFeedbacks] = useState<
    { id: number; direction: 'forward' | 'backward' }[]
  >([]);
  const counterRef = React.useRef(0);

  const trigger = useCallback((direction: 'forward' | 'backward') => {
    const id = counterRef.current++;
    setFeedbacks(prev => [...prev, { id, direction }]);
    setTimeout(() => {
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    }, 700);
  }, []);

  useImperativeHandle(ref, () => ({ trigger }));

  return (
    <>
      {/* Left side (backward) */}
      <div className="absolute left-0 inset-y-0 w-1/2 pointer-events-none flex items-center justify-center">
        <AnimatePresence>
          {feedbacks.filter(f => f.direction === 'backward').map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.5 }}
              className="absolute flex flex-col items-center gap-1"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <div className="flex">
                  {[0,1].map(i => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1 - i * 0.3, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                      </svg>
                    </motion.div>
                  ))}
                </div>
              </div>
              <span className="text-white text-xs font-semibold text-shadow">-10s</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Right side (forward) */}
      <div className="absolute right-0 inset-y-0 w-1/2 pointer-events-none flex items-center justify-center">
        <AnimatePresence>
          {feedbacks.filter(f => f.direction === 'forward').map(f => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.5 }}
              className="absolute flex flex-col items-center gap-1"
            >
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <div className="flex">
                  {[0,1].map(i => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1 - (1 - i) * 0.3, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                      </svg>
                    </motion.div>
                  ))}
                </div>
              </div>
              <span className="text-white text-xs font-semibold text-shadow">+10s</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
});

SkipFeedback.displayName = 'SkipFeedback';
