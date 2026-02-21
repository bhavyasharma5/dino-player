import React from 'react';
import { motion } from 'framer-motion';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { HomePage } from './components/home/HomePage';
import { PlayerContainer } from './components/player/PlayerContainer';

function AppContent() {
  const { playerState } = usePlayer();

  return (
    <div className="relative min-h-screen bg-[#0f0f0f] max-w-md mx-auto overflow-x-hidden">
      {/* Home page - scales back when fullscreen player opens */}
      <motion.div
        animate={{
          scale: playerState === 'fullscreen' ? 0.96 : 1,
          opacity: playerState === 'fullscreen' ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ transformOrigin: 'center top', willChange: 'transform, opacity' }}
      >
        <HomePage />
      </motion.div>

      {/* Unified player (handles fullscreen + mini) */}
      <PlayerContainer />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}
