import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import type { Video, CategoryWithVideos, PlayerState, PlayerContextType } from '../types';
import { videoData } from '../data/videos';

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
  const [currentCategory, setCurrentCategory] = useState<CategoryWithVideos | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>('closed');
  const [isPlaying, setIsPlayingState] = useState(false);

  // Ref so closures always see the latest value
  const playerStateRef = useRef<PlayerState>('closed');
  playerStateRef.current = playerState;

  const openVideo = useCallback((video: Video, category: CategoryWithVideos) => {
    setCurrentVideo(video);
    setCurrentCategory(category);
    setPlayerState('fullscreen');
    setIsPlayingState(true);
  }, []);

  const closePlayer = useCallback(() => {
    setPlayerState('closed');
    setCurrentVideo(null);
    setCurrentCategory(null);
    setIsPlayingState(false);
  }, []);

  const minimizePlayer = useCallback(() => {
    setPlayerState('minimized');
  }, []);

  const expandPlayer = useCallback(() => {
    setPlayerState('fullscreen');
  }, []);

  const setIsPlaying = useCallback((val: boolean) => {
    setIsPlayingState(val);
  }, []);

  const playVideoById = useCallback((video: Video, category: CategoryWithVideos) => {
    setCurrentVideo(video);
    setCurrentCategory(category);
    setIsPlayingState(true);
    if (playerStateRef.current === 'closed') {
      setPlayerState('fullscreen');
    }
  }, []);

  return (
    <PlayerContext.Provider value={{
      allData: videoData,
      currentVideo,
      currentCategory,
      playerState,
      isPlaying,
      openVideo,
      closePlayer,
      minimizePlayer,
      expandPlayer,
      setIsPlaying,
      playVideoById,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
}
