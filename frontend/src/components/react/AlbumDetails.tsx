import React from 'react';
import type { EnrichedAlbum } from '../../lib/types/album';
import { Clock, Music, ExternalLink } from 'lucide-react';

interface AlbumDetailsProps {
  album: EnrichedAlbum;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function AlbumDetails({ album }: AlbumDetailsProps) {
  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-6">
        {album.coverImage && (
          <img
            src={album.coverImage}
            alt={`${album.name} cover`}
            className="w-48 h-48 object-cover rounded-lg shadow-lg"
          />
        )}
        
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">{album.name}</h2>
          <p className="text-xl text-gray-600 mb-4">{album.artist}</p>
          <p className="text-gray-500 mb-4">{album.releaseDate}</p>
          
          <div className="flex gap-4">
            <a
              href={album.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Open in Spotify
              <ExternalLink size={16} />
            </a>
            {album.lastFmUrl && (
              <a
                href={album.lastFmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                View on Last.fm
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      {album.description && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-700">{album.description}</p>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Music size={20} />
          Track List
        </h3>
        <div className="space-y-2">
          {album.tracks.map((track, index) => (
            <div
              key={`${track.name}-${index}`}
              className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-500 w-6 text-right">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
                <span className="font-medium">{track.name}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Clock size={16} />
                <span>{formatDuration(track.duration)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 