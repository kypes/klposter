import axios from 'axios';
import { logger } from '../utils/logger';

interface SpotifyAuthResponse {
  access_token: string;
}

interface SpotifyTrack {
  name: string;
  duration_ms: number;
  track_number: number;
}

interface SpotifyAlbum {
  name: string;
  artists: Array<{ name: string }>;
  release_date: string;
  images: Array<{ url: string }>;
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

export class SpotifyService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    private readonly clientId: string = process.env.SPOTIFY_CLIENT_ID || '',
    private readonly clientSecret: string = process.env.SPOTIFY_CLIENT_SECRET || ''
  ) {}

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post<SpotifyAuthResponse>(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + 3600 * 1000; // Token expires in 1 hour
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get Spotify access token:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  public async getAlbumInfo(query: string) {
    try {
      const accessToken = await this.getAccessToken();
      const searchResponse = await axios.get<SpotifySearchResponse>(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!searchResponse.data.albums.items.length) {
        return null;
      }

      const album = searchResponse.data.albums.items[0];
      const albumId = album.external_urls.spotify.split('/').pop();

      const albumResponse = await axios.get<SpotifyAlbum>(
        `https://api.spotify.com/v1/albums/${albumId}`,
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
        coverUrl: albumData.images[0]?.url,
        spotifyUrl: albumData.external_urls.spotify,
        tracks,
      };
    } catch (error) {
      logger.error('Failed to fetch album info from Spotify:', error);
      return null;
    }
  }
} 