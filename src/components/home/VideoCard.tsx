import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Video, CategoryWithVideos } from '../../types';
import { usePlayer } from '../../context/PlayerContext';

interface VideoCardProps {
  video: Video;
  category: CategoryWithVideos;
  index: number;
}

export function VideoCard({ video, category, index }: VideoCardProps) {
  const { openVideo } = usePlayer();
  const [imgError, setImgError] = useState(false);

  const fallbackThumb = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
      whileTap={{ scale: 0.97 }}
      onClick={() => openVideo(video, category)}
      className="cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#1a1a1a]">
        <img
          src={imgError ? fallbackThumb : video.thumbnailUrl}
          alt={video.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[11px] font-medium px-1.5 py-0.5 rounded">
          {video.duration}
        </div>
      </div>

      {/* Info */}
      <div className="mt-2.5 flex gap-2.5">
        {/* Category icon */}
        <div className="w-8 h-8 rounded-full bg-[#1e1e1e] overflow-hidden flex-shrink-0 mt-0.5">
          <img
            src={category.category.iconUrl}
            alt={category.category.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-medium text-white leading-snug line-clamp-2">
            {video.title}
          </h3>
          <p className="text-[11px] text-[#aaa] mt-1">{category.category.name}</p>
        </div>
      </div>
    </motion.div>
  );
}
