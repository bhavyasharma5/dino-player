import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { Video, CategoryWithVideos } from '../../types';

interface VideoListItemProps {
  video: Video;
  category: CategoryWithVideos;
  isActive: boolean;
  onClick: () => void;
}

function VideoListItem({ video, category, isActive, onClick }: VideoListItemProps) {
  const [imgErr, setImgErr] = useState(false);
  const fallback = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
        isActive ? 'bg-white/10' : 'hover:bg-white/5'
      }`}
    >
      <div className="relative w-28 h-16 rounded-lg overflow-hidden bg-[#1e1e1e] flex-shrink-0">
        <img
          src={imgErr ? fallback : video.thumbnailUrl}
          alt={video.title}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {isActive && (
          <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded">
          {video.duration}
        </div>
      </div>
      <div className="flex-1 min-w-0 py-0.5">
        <p className={`text-[12px] font-medium leading-snug line-clamp-2 ${isActive ? 'text-red-400' : 'text-white'}`}>
          {video.title}
        </p>
        <p className="text-[10px] text-[#888] mt-1">{category.category.name}</p>
      </div>
    </motion.div>
  );
}

interface VideoListProps {
  isOpen: boolean;
  videos: Video[];
  category: CategoryWithVideos;
  currentVideoId: string;
  onSelectVideo: (video: Video) => void;
  onClose: () => void;
}

export function VideoList({
  isOpen,
  videos,
  category,
  currentVideoId,
  onSelectVideo,
  onClose,
}: VideoListProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: videos.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => 82,
    overscan: 3,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="absolute inset-x-0 bottom-0 bg-[#111] rounded-t-2xl overflow-hidden flex flex-col"
          style={{ height: '65%' }}
        >
          {/* Drag handle + header */}
          <div className="flex-shrink-0">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
              <div>
                <h3 className="text-white text-[14px] font-semibold">Up Next</h3>
                <p className="text-[#888] text-[11px]">{category.category.name}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-[#888]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 15l-7 7-7-7" />
                </svg>
              </motion.button>
            </div>
          </div>

          {/* Virtual list */}
          <div ref={listRef} className="flex-1 overflow-y-auto px-2 py-2">
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
                  <VideoListItem
                    video={videos[virtualRow.index]}
                    category={category}
                    isActive={videos[virtualRow.index].id === currentVideoId}
                    onClick={() => onSelectVideo(videos[virtualRow.index])}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
