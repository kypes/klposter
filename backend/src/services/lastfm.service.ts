import axios from 'axios';
import { logger } from '../utils/logger';

interface LastFmAlbum {
  name: string;
  artist: string;
  image: Array<{
    '#text': string;
    size: string;
  }>;
  tracks?: {
    track: Array<{
      name: string;
      duration: string;
      '@attr'?: { rank: string };
    }>;
  };
  wiki?: {
    content: string;
    summary: string;
  };
}

interface LastFmSearchResponse {
  results: {
    albummatches: {
      album: LastFmAlbum[];
    };
  };
}

interface LastFmAlbumInfoResponse {
  album: LastFmAlbum;
}

export class LastFmService {
  private readonly apiKey: string;

  constructor(apiKey: string = process.env.LASTFM_API_KEY || '') {
    this.apiKey = apiKey;
  }

  private getImageUrl(images: LastFmAlbum['image']): string {
    const extraLarge = images.find(img => img.size === 'extralarge');
    const large = images.find(img => img.size === 'large');
    return (extraLarge || large || images[0])?.['#text'] || '';
  }

  public async getAlbumInfo(query: string) {
    try {
      // First search for the album
      const searchResponse = await axios.get<LastFmSearchResponse>(
        'https://ws.audioscrobbler.com/2.0/',
        {
          params: {
            method: 'album.search',
            album: query,
            api_key: this.apiKey,
            format: 'json',
            limit: 1,
          },
        }
      );

      const albums = searchResponse.data.results.albummatches.album;
      if (!albums.length) {
        return null;
      }

      const album = albums[0];

      // Get detailed album info
      const infoResponse = await axios.get<LastFmAlbumInfoResponse>(
        'https://ws.audioscrobbler.com/2.0/',
        {
          params: {
            method: 'album.getinfo',
            artist: album.artist,
            album: album.name,
            api_key: this.apiKey,
            format: 'json',
          },
        }
      );

      const albumInfo = infoResponse.data.album;
      const tracks = albumInfo.tracks?.track.map((track, index) => ({
        title: track.name,
        duration: track.duration ? parseInt(track.duration) : 0,
        position: track['@attr']?.rank ? parseInt(track['@attr'].rank) : index + 1,
      })) || [];

      return {
        title: albumInfo.name,
        artist: albumInfo.artist,
        coverUrl: this.getImageUrl(albumInfo.image),
        description: albumInfo.wiki?.summary || albumInfo.wiki?.content || '',
        tracks,
      };
    } catch (error) {
      logger.error('Failed to fetch album info from Last.fm:', error);
      return null;
    }
  }
} 