import React from 'react';
import { motion } from 'framer-motion';
import type { CategoryWithVideos } from '../../types';
import { VideoCard } from './VideoCard';

interface CategorySectionProps {
  data: CategoryWithVideos;
}

const CATEGORY_COLORS: Record<string, string> = {
  'social-media-ai': 'bg-purple-600/20 text-purple-400 border-purple-600/30',
  'ai-income': 'bg-green-600/20 text-green-400 border-green-600/30',
  'ai-essentials': 'bg-blue-600/20 text-blue-400 border-blue-600/30',
};

export function CategorySection({ data }: CategorySectionProps) {
  const badgeClass = CATEGORY_COLORS[data.category.slug] ?? 'bg-red-600/20 text-red-400 border-red-600/30';

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 mb-4">
        <div className="w-9 h-9 rounded-xl bg-[#1e1e1e] overflow-hidden flex items-center justify-center flex-shrink-0">
          <img
            src={data.category.iconUrl}
            alt={data.category.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-white">{data.category.name}</h2>
          <p className="text-[11px] text-[#777]">{data.contents.length} videos</p>
        </div>
        <div className={`ml-auto px-2.5 py-1 rounded-full text-[10px] font-semibold border ${badgeClass}`}>
          {data.category.name.split(' ').map(w => w[0]).join('').toUpperCase()}
        </div>
      </div>

      {/* Video grid */}
      <div className="px-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {data.contents.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            category={data}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
