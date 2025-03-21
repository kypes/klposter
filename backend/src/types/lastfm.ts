export interface LastFmTrack {
  name: string;
  duration: string; // Duration in seconds
  '@attr'?: {
    rank: string;
  };
}

export interface LastFmAlbum {
  name: string;
  artist: string;
  url: string;
  image: Array<{
    '#text': string;
    size: string;
  }>;
  tracks?: {
    track: LastFmTrack[];
  };
  wiki?: {
    published: string;
    summary: string;
    content: string;
  };
}

export interface LastFmSearchResponse {
  results: {
    albummatches: {
      album: LastFmAlbum[];
    };
  };
}

export interface LastFmAlbumInfoResponse {
  album: LastFmAlbum;
} 