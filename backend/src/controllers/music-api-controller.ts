import { Request, Response } from 'express';
import { searchSpotifyAlbum, searchLastfmAlbum } from '../services/music-api-service';
import { ApiError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

/**
 * Search for album on Spotify
 */
export const searchSpotify = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query || typeof query !== 'string') {
      throw new ApiError(400, 'Query parameter is required');
    }
    
    const result = await searchSpotifyAlbum(query);
    
    if (!result) {
      return res.status(404).json({ message: 'No results found' });
    }
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in Spotify search:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to search Spotify');
  }
};

/**
 * Search for album on Last.fm
 */
export const searchLastfm = async (req: Request, res: Response) => {
  try {
    const { artist, album } = req.query;
    
    if (!artist || typeof artist !== 'string') {
      throw new ApiError(400, 'Artist parameter is required');
    }
    
    if (!album || typeof album !== 'string') {
      throw new ApiError(400, 'Album parameter is required');
    }
    
    const result = await searchLastfmAlbum(artist, album);
    
    if (!result) {
      return res.status(404).json({ message: 'No results found' });
    }
    
    res.status(200).json(result);
  } catch (error) {
    logger.error('Error in Last.fm search:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to search Last.fm');
  }
};

/**
 * Combine data from Spotify and Last.fm
 */
export const combineAlbumData = async (req: Request, res: Response) => {
  try {
    const { query, artist, album } = req.query;
    
    if (!query || typeof query !== 'string') {
      throw new ApiError(400, 'Query parameter is required');
    }
    
    // Search Spotify first
    const spotifyData = await searchSpotifyAlbum(query);
    
    if (!spotifyData) {
      return res.status(404).json({ message: 'No results found on Spotify' });
    }
    
    // Then search Last.fm with the artist and album from Spotify
    const lastfmData = await searchLastfmAlbum(
      artist as string || spotifyData.artist,
      album as string || spotifyData.title
    );
    
    // Combine the data
    const combinedData = {
      ...spotifyData,
      ...lastfmData,
      // If both have tracks, prefer Spotify's but use Last.fm's if missing
      tracks: spotifyData.tracks?.length ? spotifyData.tracks : lastfmData?.tracks
    };
    
    res.status(200).json(combinedData);
  } catch (error) {
    logger.error('Error combining album data:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Failed to retrieve album data');
  }
}; 