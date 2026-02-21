import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';
import { usePlayer } from '../../context/PlayerContext';
import { useYouTubePlayer } from '../../hooks/useYouTubePlayer';
import { PlayerControls } from './PlayerControls';
import { VideoList } from './VideoList';
import { AutoPlayNext } from './AutoPlayNext';
import { formatTime } from '../../utils/format';

const MINIMIZE_THRESHOLD = 90;
const DISMISS_THRESHOLD = 220;
const CONTROLS_TIMEOUT = 3500;

/**
 * Single persistent player container.
 * The YouTube iframe is ALWAYS mounted when playerState !== 'closed',
 * ensuring video continues playing when switching between fullscreen ↔ mini.
 * The container animates its size/position between the two states.
 */
export function PlayerContainer() {
  const {
    currentVideo,
    currentCategory,
    playerState,
    minimizePlayer,
    expandPlayer,
    closePlayer,
    playVideoById,
    setIsPlaying: setContextPlaying,
  } = usePlayer();

  // Single persistent ref for the YouTube iframe
  const ytRef = useRef<HTMLDivElement>(null);

  // Fullscreen drag
  const dragY = useMotionValue(0);
  // Must call useTransform at top level (not inside JSX conditionals)
  const dragHintOpacity = useTransform(dragY, [0, 60], [0, 1]);

  // UI state
  const [controlsVisible, setControlsVisible] = useState(true);
  const [showList, setShowList] = useState(false);
  const [showAutoPlay, setShowAutoPlay] = useState(false);
  const [hasPiP, setHasPiP] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFullscreen = playerState === 'fullscreen';
  const isMini = playerState === 'minimized';

  // Next video in same category
  const nextVideo = currentCategory
    ? (() => {
        const idx = currentCategory.contents.findIndex(v => v.id === currentVideo?.id);
        return idx >= 0 && idx < currentCategory.contents.length - 1
          ? currentCategory.contents[idx + 1]
          : null;
      })()
    : null;

  const {
    isReady, currentTime, duration, isPlaying,
    play, pause, seekTo, seekBy,
  } = useYouTubePlayer(ytRef, {
    videoId: currentVideo?.id ?? '',
    autoplay: true,
    onPlay: () => setContextPlaying(true),
    onPause: () => setContextPlaying(false),
    onEnd: () => {
      setContextPlaying(false);
      if (nextVideo) setShowAutoPlay(true);
    },
  });

  useEffect(() => { setHasPiP('pictureInPictureEnabled' in document); }, []);

  useEffect(() => {
    setShowAutoPlay(false);
    setShowList(false);
    dragY.set(0);
  }, [currentVideo?.id, dragY]);

  // Controls hide logic
  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!showList) setControlsVisible(false);
    }, CONTROLS_TIMEOUT);
  }, [showList]);

  const revealControls = useCallback(() => {
    setControlsVisible(true);
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    if (isFullscreen) revealControls();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [isFullscreen, currentVideo?.id]);

  useEffect(() => {
    if (showList) {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setControlsVisible(true);
    }
  }, [showList]);

  const handleTap = useCallback(() => {
    if (showList) return;
    if (controlsVisible) {
      setControlsVisible(false);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    } else {
      revealControls();
    }
  }, [controlsVisible, showList, revealControls]);

  const handlePlayPause = useCallback(() => {
    isPlaying ? pause() : play();
    revealControls();
  }, [isPlaying, play, pause, revealControls]);

  const handleSeek = useCallback((t: number) => {
    seekTo(t);
    revealControls();
  }, [seekTo, revealControls]);

  const handleSkipForward = useCallback(() => { seekBy(10); revealControls(); }, [seekBy, revealControls]);
  const handleSkipBackward = useCallback(() => { seekBy(-10); revealControls(); }, [seekBy, revealControls]);

  const handleSelectVideo = useCallback((video: typeof currentVideo) => {
    if (!video || !currentCategory) return;
    playVideoById(video, currentCategory);
    setShowList(false);
  }, [currentCategory, playVideoById]);

  const handleAutoPlayNext = useCallback(() => {
    if (!nextVideo || !currentCategory) return;
    setShowAutoPlay(false);
    playVideoById(nextVideo, currentCategory);
  }, [nextVideo, currentCategory, playVideoById]);

  const handlePiP = useCallback(async () => {
    try {
      const iframe = ytRef.current?.querySelector('iframe') as HTMLIFrameElement | null;
      const video = iframe?.contentDocument?.querySelector('video') as HTMLVideoElement | null;
      if (video) { await video.requestPictureInPicture(); return; }
    } catch (_) {}
    minimizePlayer();
  }, [minimizePlayer]);

  const handleDragEnd = useCallback(() => {
    const y = dragY.get();
    if (y > DISMISS_THRESHOLD) {
      animate(dragY, window.innerHeight, { duration: 0.25 }).then(() => {
        closePlayer();
        dragY.set(0);
      });
    } else if (y > MINIMIZE_THRESHOLD) {
      animate(dragY, 0, { type: 'spring', stiffness: 350, damping: 28 });
      minimizePlayer();
    } else {
      animate(dragY, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  }, [dragY, closePlayer, minimizePlayer]);

  if (playerState === 'closed' || !currentVideo) return null;

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          PERSISTENT YOUTUBE IFRAME LAYER
          Always in DOM when playerState !== 'closed'.
          In fullscreen: covers entire screen (z-index 50).
          In mini: only shows as small thumbnail (z-index 51, behind mini UI).
          ═══════════════════════════════════════════════════════ */}
      <motion.div
        className="fixed bg-black overflow-hidden"
        style={isFullscreen ? { y: dragY, zIndex: 50 } : { zIndex: 50 }}
        animate={
          isFullscreen
            ? { left: '0%', top: '0%', width: '100%', height: '100%', borderRadius: 0, opacity: 1 }
            : { left: 12, top: 'calc(100vh - 84px)', width: 112, height: 64, borderRadius: 8, opacity: 1 }
        }
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        drag={isFullscreen ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.12 }}
        onDragEnd={isFullscreen ? handleDragEnd : undefined}
        dragListener={isFullscreen && !showList}
      >
        {/* YouTube iframe - never unmounts */}
        <div
          ref={ytRef}
          className="absolute inset-0"
          style={{ pointerEvents: isFullscreen && controlsVisible ? 'none' : 'auto' }}
        />

        {/* Tap overlay (fullscreen only) */}
        {isFullscreen && (
          <div className="absolute inset-0" onClick={handleTap} />
        )}

        {/* Loading spinner */}
        {isFullscreen && !isReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* ── Fullscreen player controls ── */}
        {isFullscreen && (
          <>
            <PlayerControls
              video={currentVideo}
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onPlayPause={handlePlayPause}
              onSeek={handleSeek}
              onSkipForward={handleSkipForward}
              onSkipBackward={handleSkipBackward}
              onMinimize={minimizePlayer}
              onClose={closePlayer}
              onToggleList={() => setShowList(v => !v)}
              isListOpen={showList}
              onPiP={handlePiP}
              hasPiP={hasPiP}
              visible={controlsVisible}
            />

            {/* Drag hint */}
            <motion.div
              className="absolute top-0 inset-x-0 flex justify-center pt-1.5 pointer-events-none"
              style={{ opacity: dragHintOpacity }}
            >
              <div className="w-10 h-1 rounded-full bg-white/30" />
            </motion.div>

            {/* In-player video list */}
            {currentCategory && (
              <VideoList
                isOpen={showList}
                videos={currentCategory.contents}
                category={currentCategory}
                currentVideoId={currentVideo.id}
                onSelectVideo={handleSelectVideo}
                onClose={() => setShowList(false)}
              />
            )}

            {/* Auto-play next */}
            <AutoPlayNext
              nextVideo={nextVideo}
              onPlay={handleAutoPlayNext}
              onCancel={() => setShowAutoPlay(false)}
              visible={showAutoPlay && !showList}
            />
          </>
        )}
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          MINI PLAYER UI SHELL
          Sits at z-index 52, above the YouTube iframe.
          The iframe thumbnail peeks through the left side.
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isMini && (
          <motion.div
            className="fixed bottom-4 inset-x-3 z-[52] cursor-pointer"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            onClick={expandPlayer}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 120) closePlayer();
            }}
          >
            <div
              className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
              style={{ background: 'rgba(18,18,18,0.92)', backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-center h-16">
                {/* Thumbnail area */}
                <div className="w-[112px] h-16 flex-shrink-0 relative bg-black overflow-hidden">
                  <img
                    src={currentVideo.thumbnailUrl}
                    alt={currentVideo.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://img.youtube.com/vi/${currentVideo.id}/hqdefault.jpg`;
                    }}
                  />
                  {/* Animated equalizer bars when playing */}
                  {isPlaying && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                      <div className="flex gap-0.5 items-end h-5">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-1 bg-red-400 rounded-full"
                            animate={{ height: ['6px', '18px', '6px'] }}
                            transition={{
                              repeat: Infinity,
                              duration: 0.7,
                              delay: i * 0.12,
                              ease: 'easeInOut',
                            }}
                            style={{ height: '6px' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                      <svg className="w-6 h-6 text-white/80 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 px-3 py-2">
                  <p className="text-white text-[12px] font-medium leading-tight line-clamp-2">
                    {currentVideo.title}
                  </p>
                  <p className="text-[#888] text-[10px] mt-0.5">
                    {currentCategory?.category.name} · {formatTime(currentTime)}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-0.5 pr-3">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : play(); }}
                    className="w-10 h-10 flex items-center justify-center text-white"
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => { e.stopPropagation(); closePlayer(); }}
                    className="w-10 h-10 flex items-center justify-center text-[#888]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Thin progress bar */}
              <div className="h-0.5 bg-white/10">
                <div
                  className="h-full bg-red-500 transition-[width] duration-500"
                  style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
