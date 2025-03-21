export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{
    name: string;
  }>;
  release_date: string;
  tracks: {
    items: Array<{
      name: string;
      duration_ms: number;
    }>;
  };
  external_urls: {
    spotify: string;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  genres: string[];
  label: string;
}

export interface LastFmAlbum {
  name: string;
  artist: string;
  url: string;
  tracks: {
    track: Array<{
      name: string;
      duration: number;
    }>;
  };
  wiki?: {
    summary: string;
    content: string;
  };
  tags?: {
    tag: Array<{
      name: string;
    }>;
  };
}

export interface ApiError {
  message: string;
  status?: number;
} 