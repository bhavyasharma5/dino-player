import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayer } from '../../context/PlayerContext';
import { CategorySection } from './CategorySection';

export function HomePage() {
  const { allData, playerState } = usePlayer();
  const parentRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const bottomPad = playerState === 'minimized' ? 100 : 0;

  const scrollToCategory = (slug: string | null) => {
    setActiveSlug(slug);
    if (slug === null) {
      parentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const idx = allData.findIndex(d => d.category.slug === slug);
    if (idx === -1) return;
    sectionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
              activeSlug === null ? 'bg-white text-black' : 'bg-[#1e1e1e] text-white hover:bg-[#2a2a2a]'
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

      {/* All categories rendered directly — only 3, no need for virtualization here */}
      <div
        ref={parentRef}
        className="flex-1"
        style={{ paddingBottom: bottomPad }}
      >
        {allData.map((data, i) => (
          <div
            key={data.category.slug}
            ref={(el) => { sectionRefs.current[i] = el; }}
          >
            <CategorySection data={data} />
          </div>
        ))}
      </div>
    </div>
  );
}
