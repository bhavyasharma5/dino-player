import React, { useRef, useCallback } from 'react';
import { formatTime } from '../../utils/format';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

export function ProgressBar({ currentTime, duration, onSeek }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getSeekTime = useCallback((clientX: number): number => {
    const bar = barRef.current;
    if (!bar || duration <= 0) return 0;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }, [duration]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDragging.current = true;
    onSeek(getSeekTime(e.clientX));
  }, [getSeekTime, onSeek]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    onSeek(getSeekTime(e.clientX));
  }, [getSeekTime, onSeek]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full px-1">
      {/* Time labels */}
      <div className="flex justify-between text-[11px] text-[#ccc] mb-1.5 px-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Bar */}
      <div
        ref={barRef}
        className="relative w-full h-8 flex items-center cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Track */}
        <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full">
          {/* Filled */}
          <div
            className="h-full bg-red-500 rounded-full relative transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          >
            {/* Thumb */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md translate-x-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
