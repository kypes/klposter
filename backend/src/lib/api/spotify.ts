import axios from 'axios';
import { logger } from '../../utils/logger';
import type { SpotifyAlbum } from '../types/api';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

interface SpotifySearchResponse {
  albums: {
    items: SpotifyAlbum[];
  };
}

interface SpotifyTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface SpotifyError {
  message: string;
  status: number;
}

export class SpotifyApi {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl = 'https://api.spotify.com/v1';
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(
    clientId: string = process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: string = process.env.SPOTIFY_CLIENT_SECRET || ''
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      const response = await axios.get<SpotifyTokenResponse>('https://accounts.spotify.com/api/token', {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        params: {
          grant_type: 'client_credentials'
        }
      });

      if (!response.data.access_token) {
        throw new Error('No access token received from Spotify');
      }

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to get Spotify access token:', error);
      throw error;
    }
  }

  async searchAlbum(query: string) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseUrl}/search`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          q: query,
          type: 'album',
          limit: 1
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Spotify API Error:', error);
      throw error;
    }
  }

  async getAlbum(albumId: string) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${this.baseUrl}/albums/${albumId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      logger.error('Spotify API Error:', error);
      throw error;
    }
  }
} 