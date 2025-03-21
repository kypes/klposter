import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import axios from 'axios';
import { LastFmService } from '../../services/lastfm.service';

// Only mock axios, not the entire service
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockAxiosResponse = (data: any) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {
    url: 'https://ws.audioscrobbler.com/2.0/',
    method: 'get'
  }
});

describe('LastFmService', () => {
  let service: LastFmService;

  beforeEach(() => {
    service = new LastFmService('test_api_key');
    jest.clearAllMocks();
  });

  describe('getAlbumInfo', () => {
    it('should return null when no albums are found', async () => {
      mockedAxios.get.mockResolvedValueOnce(mockAxiosResponse({
        results: {
          albummatches: {
            album: []
          }
        }
      }));

      const result = await service.getAlbumInfo('nonexistent album');
      expect(result).toBeNull();
    });

    it('should return album info when album is found', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockAxiosResponse({
          results: {
            albummatches: {
              album: [{
                name: 'Test Album',
                artist: 'Test Artist',
                image: [
                  { '#text': 'small.jpg', size: 'small' },
                  { '#text': 'large.jpg', size: 'large' },
                  { '#text': 'extralarge.jpg', size: 'extralarge' }
                ]
              }]
            }
          }
        }))
        .mockResolvedValueOnce(mockAxiosResponse({
          album: {
            name: 'Test Album',
            artist: 'Test Artist',
            image: [
              { '#text': 'small.jpg', size: 'small' },
              { '#text': 'large.jpg', size: 'large' },
              { '#text': 'extralarge.jpg', size: 'extralarge' }
            ],
            tracks: {
              track: [
                { name: 'Track 1', duration: '180', '@attr': { rank: '1' } },
                { name: 'Track 2', duration: '240', '@attr': { rank: '2' } }
              ]
            },
            wiki: {
              summary: 'Test summary',
              content: 'Test content'
            }
          }
        }));

      const result = await service.getAlbumInfo('test album');

      expect(result).toEqual({
        title: 'Test Album',
        artist: 'Test Artist',
        coverUrl: 'extralarge.jpg',
        description: 'Test summary',
        tracks: [
          { title: 'Track 1', duration: 180, position: 1 },
          { title: 'Track 2', duration: 240, position: 2 }
        ]
      });
    });

    it('should handle missing track durations and ranks', async () => {
      mockedAxios.get
        .mockResolvedValueOnce(mockAxiosResponse({
          results: {
            albummatches: {
              album: [{
                name: 'Test Album',
                artist: 'Test Artist',
                image: [{ '#text': 'test.jpg', size: 'large' }]
              }]
            }
          }
        }))
        .mockResolvedValueOnce(mockAxiosResponse({
          album: {
            name: 'Test Album',
            artist: 'Test Artist',
            image: [{ '#text': 'test.jpg', size: 'large' }],
            tracks: {
              track: [
                { name: 'Track 1' },
                { name: 'Track 2' }
              ]
            }
          }
        }));

      const result = await service.getAlbumInfo('test album');

      expect(result).toEqual({
        title: 'Test Album',
        artist: 'Test Artist',
        coverUrl: 'test.jpg',
        description: '',
        tracks: [
          { title: 'Track 1', duration: 0, position: 1 },
          { title: 'Track 2', duration: 0, position: 2 }
        ]
      });
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const result = await service.getAlbumInfo('test album');
      expect(result).toBeNull();
    });
  });
}); 