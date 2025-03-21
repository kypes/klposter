import React, { useState } from 'react';
import { AlbumService } from '../../lib/services/albumService';
import type { EnrichedAlbum } from '../../lib/types/album';
import { Search, Loader2 } from 'lucide-react';

interface AlbumSearchProps {
  spotifyToken: string;
  lastFmApiKey: string;
  onAlbumSelect: (album: EnrichedAlbum) => void;
}

export function AlbumSearch({ spotifyToken, lastFmApiKey, onAlbumSelect }: AlbumSearchProps) {
  const [query, setQuery] = useState('');
  const [albums, setAlbums] = useState<EnrichedAlbum[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const albumService = new AlbumService(spotifyToken, lastFmApiKey);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const results = await albumService.searchAlbums(query);
      setAlbums(results as EnrichedAlbum[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search albums');
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for an album..."
            className="w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            'Search'
          )}
        </button>
      </div>

      {error && (
        <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {albums.map((album) => (
          <div
            key={album.id}
            onClick={() => onAlbumSelect(album)}
            className="flex gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {album.coverImage && (
              <img
                src={album.coverImage}
                alt={`${album.name} cover`}
                className="w-24 h-24 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">{album.name}</h3>
              <p className="text-gray-600 truncate">{album.artist}</p>
              <p className="text-sm text-gray-500">{album.releaseDate}</p>
              <p className="text-sm text-gray-500">
                {album.tracks.length} tracks
              </p>
            </div>
          </div>
        ))}
      </div>

      {albums.length === 0 && !loading && !error && query && (
        <p className="text-center text-gray-500 mt-8">
          No albums found. Try a different search term.
        </p>
      )}
    </div>
  );
} 