import axios from 'axios';
import { logger } from '../utils/logger';

// Create a type guard for AxiosError
function isAxiosError(error: unknown): error is {
  response?: { data?: unknown }
} {
  return typeof error === 'object' && error !== null && 'response' in error;
}

/**
 * Interface for album data
 */
interface AlbumData {
  title: string;
  artist: string;
  releaseDate?: string;
  imageUrl?: string;
  spotifyUrl?: string;
  lastfmUrl?: string;
  tracks?: Array<{
    name: string;
    duration?: string;
  }>;
}

interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

interface SpotifyTrack {
  name: string;
  duration_ms: number;
  track_number: number;
  external_urls: {
    spotify: string;
  };
}

interface SpotifyAlbum {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  release_date: string;
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
  tracks: {
    items: SpotifyTrack[];
  };
}

interface SpotifySearchResponse {
  albums: {
    items: SpotifyAlbum[];
  };
}

interface LastFmAlbum {
  name: string;
  artist: string;
  url?: string;
  tracks: {
    track: {
      name: string;
      duration?: string | number;
      '@attr'?: {
        rank: string;
      };
    }[];
  };
  wiki?: {
    content: string;
  };
  image: {
    '#text': string;
    size: string;
  }[];
}

interface LastFmSearchResponse {
  results: {
    albummatches: {
      album: {
        name: string;
        artist: string;
        url: string;
      }[];
    };
  };
}

interface LastFmAlbumInfoResponse {
  album: LastFmAlbum;
}

export class MusicApiService {
  private spotifyClient;
  private lastFmClient;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    private readonly spotifyClientId: string = process.env.SPOTIFY_CLIENT_ID || '',
    private readonly spotifyClientSecret: string = process.env.SPOTIFY_CLIENT_SECRET || '',
    private readonly lastFmApiKey: string = process.env.LASTFM_API_KEY || ''
  ) {
    this.spotifyClient = axios.create({
      baseURL: 'https://api.spotify.com/v1',
    });

    this.lastFmClient = axios.create({
      baseURL: 'http://ws.audioscrobbler.com/2.0',
      params: {
        api_key: this.lastFmApiKey,
        format: 'json',
      },
    });
  }

  private async getSpotifyAccessToken(): Promise<string> {
    try {
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const response = await axios.post<SpotifyTokenResponse>(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'client_credentials',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(
              `${this.spotifyClientId}:${this.spotifyClientSecret}`
            ).toString('base64')}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      return this.accessToken;
    } catch (error: any) {
      logger.error('Failed to get Spotify access token:', error?.response?.data || error?.message || error);
      throw new Error('Failed to get Spotify access token');
    }
  }

  async searchSpotifyAlbum(query: string): Promise<SpotifyAlbum[]> {
    try {
      const token = await this.getSpotifyAccessToken();
      const response = await this.spotifyClient.get<SpotifySearchResponse>('/search', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: query,
          type: 'album',
          limit: 10,
        },
      });

      return response.data.albums.items;
    } catch (error: any) {
      logger.error('Failed to search Spotify albums:', error?.response?.data || error?.message || error);
      throw new Error('Failed to search Spotify albums');
    }
  }

  async getSpotifyAlbum(albumId: string): Promise<SpotifyAlbum> {
    try {
      const token = await this.getSpotifyAccessToken();
      const response = await this.spotifyClient.get<SpotifyAlbum>(`/albums/${albumId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to get Spotify album:', error?.response?.data || error?.message || error);
      throw new Error('Failed to get Spotify album');
    }
  }

  async searchLastFmAlbum(artist: string, album: string): Promise<LastFmAlbum> {
    try {
      const response = await this.lastFmClient.get<LastFmAlbumInfoResponse>('/', {
        params: {
          method: 'album.getinfo',
          artist,
          album,
        },
      });

      return response.data.album;
    } catch (error: any) {
      logger.error('Failed to get Last.fm album:', error?.response?.data || error?.message || error);
      throw new Error('Failed to get Last.fm album');
    }
  }

  async getSpotifyAlbumInfo(query: string): Promise<{
    title: string;
    artist: string;
    releaseDate: string;
    imageUrl: string;
    spotifyUrl: string;
    tracks: { title: string; duration: number; position: number }[];
  }> {
    const accessToken = await this.getSpotifyAccessToken();

    try {
      const searchResponse = await this.spotifyClient.get<SpotifySearchResponse>(
        '/search',
        {
          params: {
            q: query,
            type: 'album',
            limit: 1,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!searchResponse.data.albums.items.length) {
        throw new Error('No albums found on Spotify');
      }

      const album = searchResponse.data.albums.items[0];
      const albumResponse = await this.spotifyClient.get<SpotifyAlbum>(
        `/albums/${album.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const albumData = albumResponse.data;
      const tracks = albumData.tracks.items.map((track) => ({
        title: track.name,
        duration: Math.round(track.duration_ms / 1000),
        position: track.track_number,
      }));

      return {
        title: albumData.name,
        artist: albumData.artists[0].name,
        releaseDate: albumData.release_date,
        imageUrl: albumData.images[0]?.url,
        spotifyUrl: albumData.external_urls.spotify,
        tracks,
      };
    } catch (error: any) {
      logger.error('Failed to get album info from Spotify:', error?.response?.data || error?.message || error);
      throw error;
    }
  }

  async getLastFmAlbumInfo(query: string): Promise<{
    title: string;
    artist: string;
    description?: string;
    imageUrl?: string;
    tracks: { title: string; duration?: number; position: number }[];
  }> {
    try {
      const searchResponse = await this.lastFmClient.get<LastFmSearchResponse>(
        '/',
        {
          params: {
            method: 'album.search',
            album: query,
            api_key: this.lastFmApiKey,
            format: 'json',
          },
        }
      );

      if (!searchResponse.data.results.albummatches.album.length) {
        throw new Error('No albums found on Last.fm');
      }

      const album = searchResponse.data.results.albummatches.album[0];
      const response = await this.lastFmClient.get<LastFmAlbumInfoResponse>(
        '/',
        {
          params: {
            method: 'album.getinfo',
            artist: album.artist,
            album: album.name,
            api_key: this.lastFmApiKey,
            format: 'json',
          },
        }
      );

      const albumData = response.data.album;
      const tracks = albumData.tracks.track.map((track) => ({
        title: track.name,
        duration: typeof track.duration === 'string' ? parseInt(track.duration, 10) : track.duration,
        position: parseInt(track['@attr']?.rank || '0', 10),
      }));

      const largeImage = albumData.image.find((img) => 
        img.size === 'extralarge' || img.size === 'large'
      );

      return {
        title: albumData.name,
        artist: albumData.artist,
        description: albumData.wiki?.content,
        imageUrl: largeImage?.['#text'],
        tracks,
      };
    } catch (error: any) {
      logger.error('Failed to get album info from Last.fm:', error?.response?.data || error?.message || error);
      throw error;
    }
  }
}

/**
 * Get Spotify access token
 */
const getSpotifyToken = async (): Promise<string> => {
  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Spotify credentials not configured');
    }
    
    const response = await axios.post<SpotifyTokenResponse>(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
        }
      }
    );
    
    return response.data.access_token;
  } catch (error: any) {
    logger.error('Error getting Spotify token:', error?.message || error);
    throw new Error('Failed to get Spotify access token');
  }
};

/**
 * Search for album on Spotify
 */
export const searchSpotifyAlbum = async (query: string): Promise<AlbumData | null> => {
  try {
    const token = await getSpotifyToken();
    
    // Search for album
    const searchResponse = await axios.get<SpotifySearchResponse>(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (!searchResponse.data.albums.items.length) {
      return null;
    }
    
    const album = searchResponse.data.albums.items[0];
    
    // Get album details
    const albumResponse = await axios.get<SpotifyAlbum>(
      `https://api.spotify.com/v1/albums/${album.id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const albumData = albumResponse.data;
    
    // Format tracks
    const tracks = albumData.tracks.items.map((track) => ({
      name: track.name,
      duration: formatDuration(track.duration_ms)
    }));
    
    return {
      title: albumData.name,
      artist: albumData.artists[0].name,
      releaseDate: albumData.release_date,
      imageUrl: albumData.images[0]?.url,
      spotifyUrl: albumData.external_urls.spotify,
      tracks
    };
  } catch (error: any) {
    logger.error('Error searching Spotify:', error?.message || error);
    return null;
  }
};

/**
 * Search for album on Last.fm
 */
export const searchLastfmAlbum = async (artist: string, album: string): Promise<Partial<AlbumData> | null> => {
  try {
    const apiKey = process.env.LASTFM_API_KEY;
    
    if (!apiKey) {
      throw new Error('Last.fm API key not configured');
    }
    
    const response = await axios.get<{ album: LastFmAlbum }>(
      `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&api_key=${apiKey}&format=json`
    );
    
    if (!response.data.album) {
      return null;
    }
    
    const albumData = response.data.album;
    
    // Format tracks
    const tracks = albumData.tracks?.track ? 
      (Array.isArray(albumData.tracks.track) ? albumData.tracks.track : [albumData.tracks.track])
        .map((track) => ({
          name: track.name,
          duration: typeof track.duration === 'string' ? formatDuration(parseInt(track.duration, 10) * 1000) : undefined
        })) : 
      undefined;
    
    return {
      lastfmUrl: albumData.url,
      imageUrl: albumData.image.find((img) => img.size === 'extralarge')?.['#text'],
      tracks
    };
  } catch (error: any) {
    logger.error('Error searching Last.fm:', error?.message || error);
    return null;
  }
};

/**
 * Format duration from milliseconds to MM:SS
 */
const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}; 