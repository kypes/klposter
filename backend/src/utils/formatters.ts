import type { Track } from '../types/post';

/**
 * Formats duration in seconds to mm:ss format
 */
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Formats album tracks into a Discord-friendly string
 * Limits the output to fit Discord's field value limit (1024 characters)
 */
export function formatAlbumDetails(tracks: Track[]): string {
  const formattedTracks = tracks.map(track => {
    const duration = formatDuration(track.duration);
    return `${track.position}. ${track.title} (${duration})`;
  });

  let output = formattedTracks.join('\n');
  
  // Discord field value limit is 1024 characters
  if (output.length > 1024) {
    const visibleTracks = formattedTracks.slice(0, 10);
    const remaining = tracks.length - 10;
    output = visibleTracks.join('\n') + `\n\n...and ${remaining} more tracks`;
  }

  return output;
} 