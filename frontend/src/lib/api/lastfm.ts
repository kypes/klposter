import axios from 'axios';
import type { LastFmAlbum } from '../types/api';
import { handleApiError } from './client';

const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

interface LastFmResponse<T> {
  album?: T;
  error?: number;
  message?: string;
}

export class LastFmClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getParams(method: string, params: Record<string, string> = {}) {
    return {
      method,
      api_key: this.apiKey,
      format: 'json',
      ...params
    };
  }

  async getAlbum(artist: string, album: string): Promise<LastFmAlbum> {
    try {
      const response = await axios.get<LastFmResponse<LastFmAlbum>>(
        LASTFM_BASE_URL,
        {
          params: this.getParams('album.getInfo', {
            artist,
            album
          })
        }
      );

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to fetch album info');
      }

      if (!response.data.album) {
        throw new Error('Album not found');
      }

      return response.data.album;
    } catch (error) {
      throw await handleApiError(error);
    }
  }

  async searchAlbum(query: string): Promise<LastFmAlbum[]> {
    try {
      const response = await axios.get<LastFmResponse<LastFmAlbum[]>>(
        LASTFM_BASE_URL,
        {
          params: this.getParams('album.search', {
            album: query,
            limit: '10'
          })
        }
      );

      if (response.data.error) {
        throw new Error(response.data.message || 'Failed to search albums');
      }

      return response.data.album || [];
    } catch (error) {
      throw await handleApiError(error);
    }
  }
} 