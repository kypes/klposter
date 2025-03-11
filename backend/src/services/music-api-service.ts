import axios from 'axios';
import { logger } from '../utils/logger';

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
    
    const response = await axios.post(
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
  } catch (error) {
    logger.error('Error getting Spotify token:', error);
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
    const searchResponse = await axios.get(
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
    const albumResponse = await axios.get(
      `https://api.spotify.com/v1/albums/${album.id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    const albumData = albumResponse.data;
    
    // Format tracks
    const tracks = albumData.tracks.items.map((track: any) => ({
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
  } catch (error) {
    logger.error('Error searching Spotify:', error);
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
    
    const response = await axios.get(
      `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(artist)}&album=${encodeURIComponent(album)}&api_key=${apiKey}&format=json`
    );
    
    if (!response.data.album) {
      return null;
    }
    
    const albumData = response.data.album;
    
    // Format tracks
    const tracks = albumData.tracks?.track ? 
      (Array.isArray(albumData.tracks.track) ? albumData.tracks.track : [albumData.tracks.track])
        .map((track: any) => ({
          name: track.name,
          duration: track.duration ? formatDuration(parseInt(track.duration) * 1000) : undefined
        })) : 
      undefined;
    
    return {
      lastfmUrl: albumData.url,
      imageUrl: albumData.image.find((img: any) => img.size === 'extralarge')?.['#text'],
      tracks
    };
  } catch (error) {
    logger.error('Error searching Last.fm:', error);
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