import { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

declare namespace YT {
  class Player {
    constructor(elementId: string | HTMLElement, options: PlayerOptions);
    playVideo(): void;
    pauseVideo(): void;
    seekTo(seconds: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number;
    getDuration(): number;
    getPlayerState(): number;
    destroy(): void;
    getIframe(): HTMLIFrameElement;
    requestFullscreen(): void;
  }
  interface PlayerOptions {
    videoId: string;
    width?: number | string;
    height?: number | string;
    playerVars?: PlayerVars;
    events?: PlayerEvents;
  }
  interface PlayerVars {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    rel?: 0 | 1;
    modestbranding?: 0 | 1;
    playsinline?: 0 | 1;
    enablejsapi?: 0 | 1;
    origin?: string;
    fs?: 0 | 1;
    iv_load_policy?: number;
    disablekb?: 0 | 1;
  }
  interface PlayerEvents {
    onReady?: (event: { target: Player }) => void;
    onStateChange?: (event: { data: number; target: Player }) => void;
    onError?: (event: { data: number }) => void;
  }
  const PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

let apiLoaded = false;
let apiLoading = false;
const readyCallbacks: (() => void)[] = [];

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (apiLoaded) { resolve(); return; }
    readyCallbacks.push(resolve);
    if (apiLoading) return;
    apiLoading = true;

    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      readyCallbacks.forEach(cb => cb());
      readyCallbacks.length = 0;
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.head.appendChild(script);
  });
}

interface UseYTPlayerOptions {
  videoId: string;
  autoplay: boolean;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  onDurationChange?: (duration: number) => void;
}

export function useYouTubePlayer(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseYTPlayerOptions
) {
  const playerRef = useRef<YT.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        try {
          const t = playerRef.current.getCurrentTime();
          setCurrentTime(t);
        } catch (_) {}
      }
    }, 500);
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    let destroyed = false;
    let player: YT.Player | null = null;
    const container = containerRef.current;
    if (!container) return;

    // Create a fresh div for the player
    const playerEl = document.createElement('div');
    playerEl.style.cssText = 'width:100%;height:100%;';
    container.innerHTML = '';
    container.appendChild(playerEl);

    loadYouTubeAPI().then(() => {
      if (destroyed || !container) return;
      player = new window.YT.Player(playerEl, {
        videoId: options.videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: options.autoplay ? 1 : 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          fs: 0,
          iv_load_policy: 3,
          disablekb: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (e) => {
            if (destroyed) return;
            playerRef.current = e.target;
            const d = e.target.getDuration();
            setDuration(d);
            setIsReady(true);
            optionsRef.current.onReady?.();
            optionsRef.current.onDurationChange?.(d);
            if (options.autoplay) {
              e.target.playVideo();
              setIsPlaying(true);
              startPolling();
            }
          },
          onStateChange: (e) => {
            if (destroyed) return;
            const state = e.data;
            if (state === 1) { // PLAYING
              setIsPlaying(true);
              const d = e.target.getDuration();
              if (d > 0) { setDuration(d); optionsRef.current.onDurationChange?.(d); }
              startPolling();
              optionsRef.current.onPlay?.();
            } else if (state === 2) { // PAUSED
              setIsPlaying(false);
              stopPolling();
              try { setCurrentTime(e.target.getCurrentTime()); } catch (_) {}
              optionsRef.current.onPause?.();
            } else if (state === 0) { // ENDED
              setIsPlaying(false);
              stopPolling();
              optionsRef.current.onEnd?.();
            }
          },
        },
      });
      playerRef.current = player;
    });

    return () => {
      destroyed = true;
      stopPolling();
      try { playerRef.current?.destroy(); } catch (_) {}
      playerRef.current = null;
      if (container) container.innerHTML = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.videoId]);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    playerRef.current?.seekTo(Math.max(0, seconds), true);
    setCurrentTime(Math.max(0, seconds));
  }, []);

  const seekBy = useCallback((delta: number) => {
    const t = playerRef.current?.getCurrentTime() ?? 0;
    seekTo(t + delta);
  }, [seekTo]);

  return { isReady, currentTime, duration, isPlaying, play, pause, seekTo, seekBy, playerRef };
}
