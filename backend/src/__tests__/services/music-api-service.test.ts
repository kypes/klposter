import { MusicApiService } from '../../services/music-api-service';
import axios from 'axios';
import { logger } from '../../utils/logger';
import { mockLogger } from '../utils/test-mocks';

// Create mock axios instances
const mockAxiosInstance = {
  get: jest.fn().mockResolvedValue({
    data: {
      albums: {
        items: [
          {
            id: 'album123',
            name: 'Test Album',
            artists: [{ name: 'Test Artist' }],
            release_date: '2023-01-01',
            images: [{ url: 'https://example.com/image.jpg', height: 300, width: 300 }],
            external_urls: { spotify: 'https://open.spotify.com/album/123' },
            tracks: {
              items: [
                {
                  name: 'Track 1',
                  duration_ms: 180000,
                  track_number: 1,
                  external_urls: { spotify: 'https://open.spotify.com/track/123' }
                }
              ]
            }
          }
        ]
      },
      album: {
        name: 'Test Album',
        artist: 'Test Artist',
        tracks: {
          track: [
            {
              name: 'Track 1',
              duration: '180',
              '@attr': { rank: '1' }
            }
          ]
        },
        image: [
          { '#text': 'https://example.com/image-small.jpg', size: 'small' },
          { '#text': 'https://example.com/image-large.jpg', size: 'large' }
        ]
      },
      results: {
        albummatches: {
          album: [
            {
              name: 'Test Album',
              artist: 'Test Artist',
              url: 'https://www.last.fm/music/Test+Artist/Test+Album'
            }
          ]
        }
      }
    }
  }),
  post: jest.fn().mockResolvedValue({
    data: {
      access_token: 'mock-token',
      expires_in: 3600
    }
  })
};

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue(mockAxiosInstance),
  post: jest.fn().mockResolvedValue({
    data: {
      access_token: 'mock-token',
      expires_in: 3600
    }
  })
}));

// Mock logger - this has to come after imports to avoid circular dependencies
jest.mock('../../utils/logger', () => ({
  logger: mockLogger
}));

describe('MusicApiService', () => {
  let musicApiService: MusicApiService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set environment variables for testing
    process.env.SPOTIFY_CLIENT_ID = 'mock-client-id';
    process.env.SPOTIFY_CLIENT_SECRET = 'mock-client-secret';
    process.env.LASTFM_API_KEY = 'mock-api-key';
    
    musicApiService = new MusicApiService();
  });
  
  describe('getSpotifyAccessToken', () => {
    it('should get a Spotify access token', async () => {
      // Use any to access private method
      const token = await (musicApiService as any).getSpotifyAccessToken();
      
      // Assert
      expect(token).toBe('mock-token');
      expect(axios.post).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining('Basic ')
          })
        })
      );
    });
    
    it('should use cached token if not expired', async () => {
      // Call once to cache the token
      await (musicApiService as any).getSpotifyAccessToken();
      
      // Reset the mock to check if it's called again
      (axios.post as jest.Mock).mockClear();
      
      // Call again - should use cached token
      const token = await (musicApiService as any).getSpotifyAccessToken();
      
      // Assert
      expect(token).toBe('mock-token');
      expect(axios.post).not.toHaveBeenCalled();
    });
    
    it('should handle errors when getting token', async () => {
      // Mock error
      (axios.post as jest.Mock).mockRejectedValueOnce(new Error('API error'));
      
      // Act & Assert
      await expect((musicApiService as any).getSpotifyAccessToken())
        .rejects.toThrow('Failed to get Spotify access token');
        
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get Spotify access token:',
        expect.any(Error)
      );
    });
  });
  
  describe('searchSpotifyAlbum', () => {
    it('should search Spotify albums', async () => {
      // Act
      const results = await musicApiService.searchSpotifyAlbum('Test Query');
      
      // Assert
      expect(results).toEqual([
        expect.objectContaining({
          id: 'album123',
          name: 'Test Album',
          artists: [{ name: 'Test Artist' }]
        })
      ]);
    });
    
    it('should handle errors when searching albums', async () => {
      // Mock error for this specific call
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API error'));
      
      // Act & Assert
      await expect(musicApiService.searchSpotifyAlbum('Test Query'))
        .rejects.toThrow('Failed to search Spotify albums');
        
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to search Spotify albums:',
        expect.any(Error)
      );
    });
  });
  
  describe('getSpotifyAlbumInfo', () => {
    it('should get album info from Spotify', async () => {
      // Act
      const albumInfo = await musicApiService.getSpotifyAlbumInfo('Test Album');
      
      // Assert
      expect(albumInfo).toEqual(expect.objectContaining({
        title: 'Test Album',
        artist: 'Test Artist',
        releaseDate: '2023-01-01',
        spotifyUrl: 'https://open.spotify.com/album/123'
      }));
    });
    
    it('should handle no results found', async () => {
      // Mock empty response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: { albums: { items: [] } }
      });
      
      // Act & Assert
      await expect(musicApiService.getSpotifyAlbumInfo('Unknown Album'))
        .rejects.toThrow('No albums found on Spotify');
    });
    
    it('should handle errors', async () => {
      // Mock error
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API error'));
      
      // Act & Assert
      await expect(musicApiService.getSpotifyAlbumInfo('Test Album'))
        .rejects.toThrow();
        
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get album info from Spotify:',
        expect.any(Error)
      );
    });
  });
  
  describe('searchLastFmAlbum', () => {
    it('should search albums on Last.fm', async () => {
      // Act
      const album = await musicApiService.searchLastFmAlbum('Test Artist', 'Test Album');
      
      // Assert
      expect(album.name).toBe('Test Album');
      expect(album.artist).toBe('Test Artist');
    });
  });
  
  describe('getLastFmAlbumInfo', () => {
    it('should get album info from Last.fm', async () => {
      // Act
      const albumInfo = await musicApiService.getLastFmAlbumInfo('test query');
      
      // Assert
      expect(albumInfo.title).toBe('Test Album');
      expect(albumInfo.artist).toBe('Test Artist');
      expect(albumInfo.tracks).toHaveLength(1);
      expect(albumInfo.tracks[0].title).toBe('Track 1');
    });
  });
  
  describe('standalone functions', () => {
    it('should search Spotify using standalone function', async () => {
      // Import the standalone function
      const { searchSpotifyAlbum } = require('../../services/music-api-service');
      
      // Act
      const result = await searchSpotifyAlbum('Test Album');
      
      // Assert
      expect(result).toEqual(expect.objectContaining({
        title: 'Test Album',
        artist: 'Test Artist'
      }));
    });
    
    it('should handle errors in standalone function', async () => {
      // Import the standalone function
      const { searchSpotifyAlbum } = require('../../services/music-api-service');
      
      // Mock error for standalone function
      mockAxiosInstance.get.mockRejectedValueOnce(new Error('API error'));
      
      // Act
      const result = await searchSpotifyAlbum('Test Album');
      
      // Assert
      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error searching Spotify:',
        expect.any(String)
      );
    });
    
    it('should search Last.fm using standalone function', async () => {
      // We're testing the exported function, not the class method
      const { searchLastfmAlbum } = require('../../services/music-api-service');
      
      // Act
      const result = await searchLastfmAlbum('Test Artist', 'Test Album');
      
      // Assert
      expect(result).not.toBeNull();
      expect(result?.lastfmUrl).toBe('https://www.last.fm/music/Test+Artist/Test+Album');
    });
  });
}); 