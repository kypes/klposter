import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../__mocks__/app';
import { SpotifyService } from '../../services/spotify.service';
import { LastFmService } from '../../services/lastfm.service';
import type { Track } from '../../types/post';

// Mock the services
jest.mock('../../services/spotify.service');
jest.mock('../../services/lastfm.service');

const MockSpotifyService = SpotifyService as jest.MockedClass<typeof SpotifyService>;
const MockLastFmService = LastFmService as jest.MockedClass<typeof LastFmService>;

describe('AlbumController', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/albums/search', () => {
    it('should return 400 if query parameter is missing', async () => {
      const response = await request(app)
        .get('/api/albums/search')
        .expect(400);

      expect(response.body).toEqual({
        error: 'Query parameter is required'
      });
    });

    it('should return album data from Spotify when available', async () => {
      const mockSpotifyData = {
        title: 'Test Album',
        artist: 'Test Artist',
        coverUrl: 'https://test.com/cover.jpg',
        releaseDate: '2024-03-20',
        spotifyUrl: 'https://open.spotify.com/album/test',
        tracks: [
          { title: 'Track 1', duration: 180, position: 1 }
        ]
      };

      MockSpotifyService.prototype.getAlbumInfo.mockResolvedValueOnce(mockSpotifyData);

      const response = await request(app)
        .get('/api/albums/search?query=test+album')
        .expect(200);

      expect(response.body).toMatchObject(mockSpotifyData);
      expect(MockSpotifyService.prototype.getAlbumInfo).toHaveBeenCalledWith('test album');
    });

    it('should fall back to Last.fm when Spotify returns no results', async () => {
      const mockLastFmData = {
        title: 'Test Album',
        artist: 'Test Artist',
        coverUrl: 'https://lastfm.com/cover.jpg',
        releaseDate: '2024-03-20',
        tracks: [] as Track[],
        description: 'Test description'
      };

      MockSpotifyService.prototype.getAlbumInfo.mockResolvedValueOnce(null);
      MockLastFmService.prototype.getAlbumInfo.mockResolvedValueOnce(mockLastFmData);

      const response = await request(app)
        .get('/api/albums/search?query=test+album')
        .expect(200);

      expect(response.body).toMatchObject(mockLastFmData);
      expect(MockLastFmService.prototype.getAlbumInfo).toHaveBeenCalledWith('test album');
    });

    it('should return 404 when no results found from either service', async () => {
      MockSpotifyService.prototype.getAlbumInfo.mockResolvedValueOnce(null);
      MockLastFmService.prototype.getAlbumInfo.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/albums/search?query=nonexistent+album')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Album not found'
      });
    });

    it('should enrich Spotify data with Last.fm description when available', async () => {
      const mockSpotifyData = {
        title: 'Test Album',
        artist: 'Test Artist',
        coverUrl: 'https://test.com/cover.jpg',
        releaseDate: '2024-03-20',
        spotifyUrl: 'https://open.spotify.com/album/test',
        tracks: [] as Track[]
      };

      const mockLastFmData = {
        title: 'Test Album',
        artist: 'Test Artist',
        coverUrl: 'https://lastfm.com/cover.jpg',
        releaseDate: '2024-03-20',
        tracks: [] as Track[],
        description: 'Test album description'
      };

      MockSpotifyService.prototype.getAlbumInfo.mockResolvedValueOnce(mockSpotifyData);
      MockLastFmService.prototype.getAlbumInfo.mockResolvedValueOnce(mockLastFmData);

      const response = await request(app)
        .get('/api/albums/search?query=test+album')
        .expect(200);

      expect(response.body).toMatchObject({
        ...mockSpotifyData,
        description: mockLastFmData.description
      });
    });
  });
}); 