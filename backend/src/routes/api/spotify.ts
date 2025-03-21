import { Router } from 'express';
import { MusicApiService } from '../../services/music-api-service';
import { logger } from '../../utils/logger';

const router = Router();
const musicApiService = new MusicApiService();

router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid query parameter' });
  }

  try {
    const albumInfo = await musicApiService.getSpotifyAlbumInfo(query);
    res.json(albumInfo);
  } catch (error) {
    logger.error('Error searching Spotify:', error);
    res.status(500).json({ error: 'Failed to search Spotify' });
  }
});

export default router; 