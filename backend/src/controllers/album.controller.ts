import { Request, Response } from 'express';
import { SpotifyService } from '../services/spotify.service';
import { LastFmService } from '../services/lastfm.service';
import { logger } from '../utils/logger';

export class AlbumController {
  private readonly spotifyService: SpotifyService;
  private readonly lastFmService: LastFmService;

  constructor() {
    this.spotifyService = new SpotifyService(
      process.env.SPOTIFY_CLIENT_ID!,
      process.env.SPOTIFY_CLIENT_SECRET!
    );
    this.lastFmService = new LastFmService(process.env.LASTFM_API_KEY!);
  }

  /**
   * Search for album information using both Spotify and Last.fm
   */
  async searchAlbum(req: Request, res: Response) {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }

      // Try Spotify first
      const spotifyResult = await this.spotifyService.getAlbumInfo(query);
      
      // If Spotify fails, try Last.fm
      if (!spotifyResult) {
        logger.info('No Spotify results, trying Last.fm');
        const lastFmResult = await this.lastFmService.getAlbumInfo(query);
        
        if (!lastFmResult) {
          return res.status(404).json({ error: 'Album not found' });
        }

        return res.json(lastFmResult);
      }

      // If we have Spotify results, try to enrich with Last.fm data
      const lastFmResult = await this.lastFmService.getAlbumInfo(
        `${spotifyResult.artist} ${spotifyResult.title}`
      );

      // Merge Spotify and Last.fm results, preferring Spotify data
      const enrichedResult = {
        ...spotifyResult,
        description: lastFmResult?.description || '',
      };

      return res.json(enrichedResult);
    } catch (error) {
      logger.error('Error searching for album:', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
} 