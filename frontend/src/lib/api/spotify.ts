import axios from 'axios';
import type { SpotifyAlbum } from '../types/api';
import { handleApiError } from './client';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

interface SpotifySearchResponse {
  albums: {
    items: SpotifyAlbum[];
  };
}

export class SpotifyClient {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private get headers() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  async getAlbum(albumId: string): Promise<SpotifyAlbum> {
    try {
      const response = await axios.get<SpotifyAlbum>(
        `${SPOTIFY_BASE_URL}/albums/${albumId}`,
        { headers: this.headers }
      );
      return response.data;
    } catch (error) {
      throw await handleApiError(error);
    }
  }

  async searchAlbum(query: string): Promise<SpotifyAlbum[]> {
    try {
      const response = await axios.get<SpotifySearchResponse>(
        `${SPOTIFY_BASE_URL}/search`,
        {
          params: {
            q: query,
            type: 'album',
            limit: 10
          },
          headers: this.headers
        }
      );
      return response.data.albums.items;
    } catch (error) {
      throw await handleApiError(error);
    }
  }
} 