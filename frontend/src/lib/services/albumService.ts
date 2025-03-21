import { SpotifyClient } from '../api/spotify';
import { LastFmClient } from '../api/lastfm';
import type { SpotifyAlbum, LastFmAlbum } from '../types/api';

interface EnrichedAlbum {
  id: string;
  name: string;
  artist: string;
  releaseDate: string;
  tracks: Array<{
    name: string;
    duration: number;
  }>;
  spotifyUrl: string;
  lastFmUrl?: string;
  description?: string;
  coverImage: string;
}

export class AlbumService {
  private spotifyClient: SpotifyClient;
  private lastFmClient: LastFmClient;

  constructor(spotifyToken: string, lastFmApiKey: string) {
    this.spotifyClient = new SpotifyClient(spotifyToken);
    this.lastFmClient = new LastFmClient(lastFmApiKey);
  }

  private enrichAlbumWithLastFm(
    spotifyAlbum: SpotifyAlbum,
    lastFmAlbum?: LastFmAlbum
  ): EnrichedAlbum {
    const artistName = spotifyAlbum.artists[0]?.name || 'Unknown Artist';

    return {
      id: spotifyAlbum.id,
      name: spotifyAlbum.name,
      artist: artistName,
      releaseDate: spotifyAlbum.release_date,
      tracks: spotifyAlbum.tracks.items.map(track => ({
        name: track.name,
        duration: track.duration_ms
      })),
      spotifyUrl: spotifyAlbum.external_urls.spotify,
      lastFmUrl: lastFmAlbum?.url,
      description: lastFmAlbum?.wiki?.summary,
      coverImage: spotifyAlbum.images[0]?.url || ''
    };
  }

  async getAlbumDetails(spotifyAlbumId: string): Promise<EnrichedAlbum> {
    try {
      const spotifyAlbum = await this.spotifyClient.getAlbum(spotifyAlbumId);
      const artistName = spotifyAlbum.artists[0]?.name || '';
      
      let lastFmAlbum: LastFmAlbum | undefined;
      try {
        lastFmAlbum = await this.lastFmClient.getAlbum(artistName, spotifyAlbum.name);
      } catch (error) {
        console.warn('Failed to fetch Last.fm data:', error);
      }

      return this.enrichAlbumWithLastFm(spotifyAlbum, lastFmAlbum);
    } catch (error) {
      throw error;
    }
  }

  async searchAlbums(query: string): Promise<EnrichedAlbum[]> {
    const spotifyAlbums = await this.spotifyClient.searchAlbum(query);
    const enrichedAlbums: EnrichedAlbum[] = [];

    for (const spotifyAlbum of spotifyAlbums) {
      const artistName = spotifyAlbum.artists[0]?.name || '';
      
      let lastFmAlbum: LastFmAlbum | undefined;
      try {
        lastFmAlbum = await this.lastFmClient.getAlbum(artistName, spotifyAlbum.name);
      } catch (error) {
        console.warn('Failed to fetch Last.fm data:', error);
      }

      enrichedAlbums.push(this.enrichAlbumWithLastFm(spotifyAlbum, lastFmAlbum));
    }

    return enrichedAlbums;
  }
} 