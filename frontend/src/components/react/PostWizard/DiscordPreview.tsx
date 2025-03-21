import React from 'react';
import type { EnrichedAlbum } from '../../../lib/types/album';
import { ExternalLink, Clock, Music4, Disc3 } from 'lucide-react';

interface DiscordPreviewProps {
  albumInfo: EnrichedAlbum | null;
  description: string;
  username: string;
}

export function DiscordPreview({ albumInfo, description, username }: DiscordPreviewProps) {
  if (!albumInfo) {
    return (
      <div className="w-full bg-surface-100 rounded-xl p-6 text-content border border-surface-200 shadow-lg">
        <div className="flex flex-col items-center justify-center h-48 bg-surface-50 rounded-lg border border-surface-200">
          <Disc3 size={48} className="text-surface-300 mb-4 animate-float" />
          <p className="text-sm text-content-400">Select an album to see the preview</p>
        </div>
      </div>
    );
  }

  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="w-full bg-surface-100 rounded-xl p-6 text-content border border-surface-200 shadow-lg">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-medium shadow-inner-bright">
          {username.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <span className="font-medium text-content">{username}</span>
          <div className="flex items-center text-xs text-content-400 mt-0.5">
            <Clock size={12} className="mr-1" />
            <span>Today at {currentTime}</span>
          </div>
        </div>
      </div>

      <div className="border-l-4 border-surface-300 pl-4 mt-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {albumInfo.coverImage && (
            <div className="relative group">
              <img
                src={albumInfo.coverImage}
                alt={`${albumInfo.name} cover`}
                className="w-24 h-24 object-cover rounded-lg shadow-lg transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-surface-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <Music4 size={20} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-content text-lg truncate">{albumInfo.name}</h3>
            <p className="text-content-300 truncate">{albumInfo.artist}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-content-400">
              <span>{albumInfo.tracks.length} tracks</span>
              <span className="w-1 h-1 rounded-full bg-surface-300" />
              <span>{albumInfo.releaseDate}</span>
            </div>
            <a
              href={albumInfo.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent-green hover:text-accent-green/80 transition-colors duration-200 mt-2 group"
            >
              Listen on Spotify
              <ExternalLink size={12} className="opacity-75 group-hover:opacity-100 transition-opacity duration-200" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed break-words text-content-200">
        {description.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
} 