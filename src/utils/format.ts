export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function extractVideoId(url: string): string {
  // https://youtube.com/embed/VIDEO_ID or with ?params
  const match = url.match(/embed\/([^?&]+)/);
  return match ? match[1] : url;
}

export function getYTThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
