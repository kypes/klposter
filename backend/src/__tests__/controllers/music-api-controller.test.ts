import { searchSpotify, searchLastfm, getAlbumInfo } from '../../controllers/music-api-controller';
import { searchSpotifyAlbum, searchLastfmAlbum } from '../../services/music-api-service';
import { createMockRequest, createMockResponse } from '../utils/test-mocks';
import { logger } from '../../utils/logger';

// Mock music API services
jest.mock('../../services/music-api-service', () => ({
  searchSpotifyAlbum: jest.fn().mockResolvedValue({
    title: 'Test Album',
    artist: 'Test Artist',
    releaseDate: '2023-01-01',
    spotifyUrl: 'https://open.spotify.com/album/123',
    imageUrl: 'https://example.com/image.jpg'
  }),
  searchLastfmAlbum: jest.fn().mockResolvedValue({
    name: 'Test Album',
    artist: 'Test Artist',
    lastfmUrl: 'https://www.last.fm/music/Test+Artist/Test+Album',
    imageUrl: 'https://example.com/image.jpg'
  }),
  getSpotifyAlbumInfo: jest.fn().mockResolvedValue({
    title: 'Test Album',
    artist: 'Test Artist',
    releaseDate: '2023-01-01',
    spotifyUrl: 'https://open.spotify.com/album/123',
    imageUrl: 'https://example.com/image.jpg',
    tracks: [
      { title: 'Track 1', duration: '3:30' },
      { title: 'Track 2', duration: '4:15' }
    ]
  }),
  getLastFmAlbumInfo: jest.fn().mockResolvedValue({
    title: 'Test Album',
    artist: 'Test Artist',
    lastfmUrl: 'https://www.last.fm/music/Test+Artist/Test+Album',
    imageUrl: 'https://example.com/image.jpg',
    tracks: [
      { title: 'Track 1', duration: '3:30' },
      { title: 'Track 2', duration: '4:15' }
    ]
  })
}));

describe('Music API Controller', () => {
  let mockRequest: any;
  let mockResponse: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
  });
  
  describe('searchSpotify', () => {
    it('should search Spotify and return results', async () => {
      // Arrange
      mockRequest.query = { query: 'Test Query' };
      
      // Act
      await searchSpotify(mockRequest, mockResponse);
      
      // Assert
      expect(searchSpotifyAlbum).toHaveBeenCalledWith('Test Query');
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Album',
        artist: 'Test Artist'
      }));
    });
    
    it('should handle missing query parameter', async () => {
      // Arrange
      mockRequest.query = {};
      
      // Act
      await searchSpotify(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('required')
      }));
    });
    
    it('should handle API errors', async () => {
      // Arrange
      mockRequest.query = { query: 'Test Query' };
      (searchSpotifyAlbum as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      // Act
      await searchSpotify(mockRequest, mockResponse);
      
      // Assert
      expect(logger.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Error searching Spotify')
      }));
    });
    
    it('should handle null results', async () => {
      // Arrange
      mockRequest.query = { query: 'Test Query' };
      (searchSpotifyAlbum as jest.Mock).mockResolvedValueOnce(null);
      
      // Act
      await searchSpotify(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('No results found')
      }));
    });
  });
  
  describe('searchLastfm', () => {
    it('should search Last.fm and return results', async () => {
      // Arrange
      mockRequest.query = { artist: 'Test Artist', album: 'Test Album' };
      
      // Act
      await searchLastfm(mockRequest, mockResponse);
      
      // Assert
      expect(searchLastfmAlbum).toHaveBeenCalledWith('Test Artist', 'Test Album');
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test Album',
        artist: 'Test Artist'
      }));
    });
    
    it('should handle missing parameters', async () => {
      // Arrange - missing album parameter
      mockRequest.query = { artist: 'Test Artist' };
      
      // Act
      await searchLastfm(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('both artist and album')
      }));
    });
    
    it('should handle API errors', async () => {
      // Arrange
      mockRequest.query = { artist: 'Test Artist', album: 'Test Album' };
      (searchLastfmAlbum as jest.Mock).mockRejectedValueOnce(new Error('API Error'));
      
      // Act
      await searchLastfm(mockRequest, mockResponse);
      
      // Assert
      expect(logger.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Error searching Last.fm')
      }));
    });
    
    it('should handle null results', async () => {
      // Arrange
      mockRequest.query = { artist: 'Test Artist', album: 'Test Album' };
      (searchLastfmAlbum as jest.Mock).mockResolvedValueOnce(null);
      
      // Act
      await searchLastfm(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('No results found')
      }));
    });
  });
  
  describe('getAlbumInfo', () => {
    it('should get album info from Spotify', async () => {
      // Arrange
      mockRequest.query = { 
        source: 'spotify', 
        id: 'album123' 
      };
      
      // Act
      await getAlbumInfo(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Album',
        artist: 'Test Artist',
        tracks: expect.arrayContaining([
          expect.objectContaining({ title: 'Track 1' })
        ])
      }));
    });
    
    it('should get album info from Last.fm', async () => {
      // Arrange
      mockRequest.query = { 
        source: 'lastfm', 
        id: 'Test Artist/Test Album' 
      };
      
      // Act
      await getAlbumInfo(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Album',
        artist: 'Test Artist',
        tracks: expect.arrayContaining([
          expect.objectContaining({ title: 'Track 1' })
        ])
      }));
    });
    
    it('should handle invalid source parameter', async () => {
      // Arrange
      mockRequest.query = { 
        source: 'invalid', 
        id: 'album123' 
      };
      
      // Act
      await getAlbumInfo(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Invalid source')
      }));
    });
    
    it('should handle missing parameters', async () => {
      // Arrange - missing id parameter
      mockRequest.query = { source: 'spotify' };
      
      // Act
      await getAlbumInfo(mockRequest, mockResponse);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('ID is required')
      }));
    });
    
    it('should handle API errors', async () => {
      // Arrange
      mockRequest.query = { 
        source: 'spotify', 
        id: 'album123' 
      };
      const mockError = new Error('API Error');
      require('../../services/music-api-service').getSpotifyAlbumInfo.mockRejectedValueOnce(mockError);
      
      // Act
      await getAlbumInfo(mockRequest, mockResponse);
      
      // Assert
      expect(logger.error).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        error: expect.stringContaining('Error fetching album info')
      }));
    });
  });
}); 