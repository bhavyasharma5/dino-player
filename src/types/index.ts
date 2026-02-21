export interface Video {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: 'YOUTUBE';
  thumbnailUrl: string;
  slug: string;
  duration: string;
}

export interface Category {
  slug: string;
  name: string;
  iconUrl: string;
}

export interface CategoryWithVideos {
  category: Category;
  contents: Video[];
}

export type PlayerState = 'closed' | 'fullscreen' | 'minimized';

export interface PlayerContextType {
  allData: CategoryWithVideos[];
  currentVideo: Video | null;
  currentCategory: CategoryWithVideos | null;
  playerState: PlayerState;
  isPlaying: boolean;
  openVideo: (video: Video, category: CategoryWithVideos) => void;
  closePlayer: () => void;
  minimizePlayer: () => void;
  expandPlayer: () => void;
  setIsPlaying: (val: boolean) => void;
  playVideoById: (video: Video, category: CategoryWithVideos) => void;
}
