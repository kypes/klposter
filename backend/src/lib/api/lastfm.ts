import axios from 'axios';
import { logger } from '../../utils/logger';
import type { LastFmAlbum } from '../types/api';

const LASTFM_BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

interface LastFmResponse<T> {
  album?: T;
  error?: number;
  message?: string;
}

export interface LastFmError {
  message: string;
  code: number;
}

export class LastFmApi {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://ws.audioscrobbler.com/2.0/';

  constructor(apiKey: string = process.env.LASTFM_API_KEY || '') {
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
      logger.error('LastFM API Error:', error);
      throw error;
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
      logger.error('LastFM API Error:', error);
      throw error;
    }
  }

  async getAlbumInfo(artist: string, album: string) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          method: 'album.getinfo',
          artist,
          album,
          api_key: this.apiKey,
          format: 'json'
        }
      });
      return response.data;
    } catch (error) {
      logger.error('LastFM API Error:', error);
      throw error;
    }
  }
} 