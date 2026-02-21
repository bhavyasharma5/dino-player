import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Video } from '../../types';

interface AutoPlayNextProps {
  nextVideo: Video | null;
  onPlay: () => void;
  onCancel: () => void;
  visible: boolean;
}

export function AutoPlayNext({ nextVideo, onPlay, onCancel, visible }: AutoPlayNextProps) {
  const [countdown, setCountdown] = useState(5);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    if (!visible || !nextVideo) {
      setCountdown(5);
      return;
    }
    setCountdown(5);
    intervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          onPlay();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible, nextVideo?.id]);

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (countdown / 5) * circumference;

  return (
    <AnimatePresence>
      {visible && nextVideo && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-24 inset-x-0 mx-4 glass rounded-2xl p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="w-20 h-12 rounded-lg overflow-hidden bg-[#2a2a2a] flex-shrink-0">
              <img
                src={imgErr
                  ? `https://img.youtube.com/vi/${nextVideo.id}/hqdefault.jpg`
                  : nextVideo.thumbnailUrl
                }
                alt={nextVideo.title}
                onError={() => setImgErr(true)}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#aaa]">Up Next</p>
              <p className="text-white text-[12px] font-medium leading-snug line-clamp-2 mt-0.5">
                {nextVideo.title}
              </p>
            </div>
            {/* Countdown ring */}
            <div className="flex-shrink-0 relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3" />
                <circle
                  cx="22" cy="22" r={radius}
                  fill="none"
                  stroke="#ff4444"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-[13px] font-bold">{countdown}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onCancel}
              className="flex-1 py-2 rounded-xl bg-white/10 text-white/80 text-[12px] font-medium"
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onPlay}
              className="flex-1 py-2 rounded-xl bg-red-600 text-white text-[12px] font-bold flex items-center justify-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play Now
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
