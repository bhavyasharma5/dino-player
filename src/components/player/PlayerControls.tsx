import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ProgressBar } from './ProgressBar';
import { SkipFeedback, type SkipFeedbackHandle } from './SkipFeedback';
import type { Video } from '../../types';

interface PlayerControlsProps {
  video: Video;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onSeek: (t: number) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onMinimize: () => void;
  onClose: () => void;
  onToggleList: () => void;
  isListOpen: boolean;
  onPiP: () => void;
  hasPiP: boolean;
  visible: boolean;
}

export function PlayerControls({
  video,
  isPlaying,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onMinimize,
  onClose,
  onToggleList,
  isListOpen,
  onPiP,
  hasPiP,
  visible,
}: PlayerControlsProps) {
  const skipRef = useRef<SkipFeedbackHandle>(null);

  const handleSkipForward = () => {
    onSkipForward();
    skipRef.current?.trigger('forward');
  };

  const handleSkipBackward = () => {
    onSkipBackward();
    skipRef.current?.trigger('backward');
  };

  return (
    <>
      {/* Skip ripple feedback layer */}
      <SkipFeedback ref={skipRef} />

      {/* Controls overlay */}
      <motion.div
        className="absolute inset-0 flex flex-col"
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ pointerEvents: visible ? 'auto' : 'none' }}
      >
        {/* Top gradient + header */}
        <div className="gradient-top px-3 pt-3 pb-8 flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onMinimize}
            className="w-9 h-9 flex items-center justify-center text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.button>

          <div className="flex-1 min-w-0">
            <p className="text-white text-[13px] font-medium truncate text-shadow">{video.title}</p>
          </div>

          <div className="flex items-center gap-1">
            {hasPiP && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onPiP}
                className="w-9 h-9 flex items-center justify-center text-white/80"
              >
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="2" y="7" width="14" height="11" rx="2" strokeWidth={2} />
                  <rect x="12" y="13" width="9" height="7" rx="1.5" strokeWidth={1.5} fill="currentColor" />
                </svg>
              </motion.button>
            )}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-white/80"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Center controls */}
        <div className="flex-1 flex items-center justify-center gap-8">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleSkipBackward}
            className="w-14 h-14 flex flex-col items-center justify-center gap-0.5"
          >
            <svg className="w-9 h-9 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
            <span className="text-white/80 text-[9px] font-medium">10</span>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onPlayPause}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30"
          >
            {isPlaying ? (
              <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-9 h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleSkipForward}
            className="w-14 h-14 flex flex-col items-center justify-center gap-0.5"
          >
            <svg className="w-9 h-9 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
            <span className="text-white/80 text-[9px] font-medium">10</span>
          </motion.button>
        </div>

        {/* Bottom: progress + list toggle */}
        <div className="gradient-bottom px-4 pt-8 pb-4 space-y-2">
          <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
          />

          <div className="flex items-center justify-between pt-1">
            <span className="text-white/60 text-[11px]">{video.duration}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onToggleList}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                isListOpen
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              <svg className={`w-3.5 h-3.5 transition-transform ${isListOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
              Up Next
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
