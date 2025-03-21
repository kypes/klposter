import React, { useState } from 'react';
import { Search, Loader2, ExternalLink } from 'lucide-react';
import type { EnrichedAlbum } from '../../../lib/types/album';

interface AlbumSearchStepProps {
  onAlbumSelect: (album: EnrichedAlbum) => void;
  onNext: () => void;
}

interface SearchResult {
  id: string;
  name: string;
  artist: string;
  releaseDate: string;
  coverImage?: string;
  spotifyUrl: string;
}

export function AlbumSearchStep({ onAlbumSelect, onNext }: AlbumSearchStepProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await fetch(`/api/spotify/albums/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search albums');
      }
      const data = await response.json();
      setResults(data.map((album: any) => ({
        id: album.id,
        name: album.name,
        artist: album.artists[0]?.name || 'Unknown Artist',
        releaseDate: album.release_date,
        coverImage: album.images[0]?.url,
        spotifyUrl: album.external_urls.spotify
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search albums');
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumSelect = async (album: SearchResult) => {
    setSelectedAlbum(album);
    setLoading(true);
    setError(null);

    try {
      // Fetch detailed album info from both Spotify and Last.fm
      const [spotifyResponse, lastFmResponse] = await Promise.all([
        fetch(`/api/spotify/albums/${album.id}`),
        fetch(`/api/lastfm/albums?artist=${encodeURIComponent(album.artist)}&album=${encodeURIComponent(album.name)}`)
      ]);

      if (!spotifyResponse.ok || !lastFmResponse.ok) {
        throw new Error('Failed to fetch album details');
      }

      const [spotifyData, lastFmData] = await Promise.all([
        spotifyResponse.json(),
        lastFmResponse.json()
      ]);

      const enrichedAlbum: EnrichedAlbum = {
        id: spotifyData.id,
        name: spotifyData.name,
        artist: spotifyData.artists[0]?.name || 'Unknown Artist',
        releaseDate: spotifyData.release_date,
        tracks: spotifyData.tracks.items.map((track: any) => ({
          name: track.name,
          duration: track.duration_ms
        })),
        spotifyUrl: spotifyData.external_urls.spotify,
        lastFmUrl: lastFmData.url,
        description: lastFmData.wiki?.summary,
        coverImage: spotifyData.images[0]?.url || '',
        genres: spotifyData.genres || [],
        label: spotifyData.label || 'Unknown Label'
      };

      onAlbumSelect(enrichedAlbum);
      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch album details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Search for an Album</h2>
      
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by album name or artist..."
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

      <div className="grid grid-cols-1 gap-4">
        {results.map((album) => (
          <div
            key={album.id}
            onClick={() => handleAlbumSelect(album)}
            className={`flex gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedAlbum?.id === album.id
                ? 'bg-blue-50 border-blue-500'
                : 'hover:bg-gray-50'
            }`}
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
              <a
                href={album.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 mt-2"
                onClick={(e) => e.stopPropagation()}
              >
                Preview on Spotify
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && !loading && !error && query && (
        <p className="text-center text-gray-500 mt-8">
          No albums found. Try a different search term.
        </p>
      )}
    </div>
  );
} 