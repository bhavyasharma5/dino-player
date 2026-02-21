import React, { useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';
import { usePlayer } from '../../context/PlayerContext';
import { CategorySection } from './CategorySection';

export function HomePage() {
  const { allData, playerState } = usePlayer();
  const parentRef = useRef<HTMLDivElement>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: allData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => {
      const videoCount = allData[i].contents.length;
      const cardHeight = 230;
      return 80 + videoCount * cardHeight + 32;
    },
    overscan: 1,
  });

  const bottomPad = playerState === 'minimized' ? 100 : 0;

  const scrollToCategory = (slug: string | null) => {
    setActiveSlug(slug);
    if (slug === null) {
      // "All" — scroll to top
      parentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const idx = allData.findIndex(d => d.category.slug === slug);
    if (idx === -1) return;
    rowVirtualizer.scrollToIndex(idx, { align: 'start', behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0f0f0f]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-[#1e1e1e]">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-red-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-white text-lg font-bold tracking-tight">Dino<span className="text-red-500">Play</span></span>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 flex items-center justify-center text-[#aaa] hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </motion.button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <span className="text-white text-xs font-bold">D</span>
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto no-scrollbar">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToCategory(null)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              activeSlug === null
                ? 'bg-white text-black'
                : 'bg-[#1e1e1e] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            All
          </motion.button>
          {allData.map((d) => (
            <motion.button
              key={d.category.slug}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToCategory(d.category.slug)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                activeSlug === d.category.slug
                  ? 'bg-white text-black'
                  : 'bg-[#1e1e1e] text-white hover:bg-[#2a2a2a]'
              }`}
            >
              {d.category.name}
            </motion.button>
          ))}
        </div>
      </header>

      {/* Virtual scrollable list */}
      <div
        ref={parentRef}
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: bottomPad }}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <CategorySection data={allData[virtualRow.index]} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
