import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { searchSpotifyAlbum, searchLastfmAlbum } from '../services/music-api-service';
import { MusicApiService } from '../services/music-api-service';
import { ApiError } from '../middleware/error-handler';

// Initialize the music API service
const musicApiService = new MusicApiService();

/**
 * Search for an album on Spotify
 */
export const searchSpotify = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const result = await searchSpotifyAlbum(query.toString());
    
    if (!result) {
      return res.status(404).json({ error: 'No results found on Spotify' });
    }
    
    return res.json(result);
  } catch (error) {
    logger.error('Spotify search error:', error);
    return res.status(500).json({ error: 'Error searching Spotify' });
  }
};

/**
 * Search for an album on Last.fm
 */
export const searchLastfm = async (req: Request, res: Response) => {
  try {
    const { artist, album } = req.query;
    
    if (!artist || !album) {
      return res.status(400).json({ error: 'Both artist and album parameters are required' });
    }
    
    const result = await searchLastfmAlbum(artist.toString(), album.toString());
    
    if (!result) {
      return res.status(404).json({ error: 'No results found on Last.fm' });
    }
    
    return res.json(result);
  } catch (error) {
    logger.error('Last.fm search error:', error);
    return res.status(500).json({ error: 'Error searching Last.fm' });
  }
};

/**
 * Get detailed album information from Spotify or Last.fm
 */
export const getAlbumInfo = async (req: Request, res: Response) => {
  try {
    const { source, id } = req.query;
    
    if (!source) {
      return res.status(400).json({ error: 'Source is required (spotify or lastfm)' });
    }
    
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    
    let result;
    
    if (source.toString().toLowerCase() === 'spotify') {
      result = await musicApiService.getSpotifyAlbumInfo(id.toString());
    } else if (source.toString().toLowerCase() === 'lastfm') {
      // For Last.fm, ID is expected to be in the format "artist/album"
      const [artist, album] = id.toString().split('/');
      if (!artist || !album) {
        return res.status(400).json({ error: 'For Last.fm, ID must be in the format "artist/album"' });
      }
      result = await musicApiService.getLastFmAlbumInfo(`${artist} ${album}`);
    } else {
      return res.status(400).json({ error: 'Invalid source. Use "spotify" or "lastfm"' });
    }
    
    if (!result) {
      return res.status(404).json({ error: 'Album not found' });
    }
    
    return res.json(result);
  } catch (error) {
    logger.error('Error fetching album info:', error);
    return res.status(500).json({ error: 'Error fetching album info' });
  }
}; 