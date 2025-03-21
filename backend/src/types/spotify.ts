export interface SpotifyTrack {
  name: string;
  duration_ms: number;
  track_number: number;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: Array<{
    name: string;
  }>;
  release_date: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  tracks: {
    items: SpotifyTrack[];
  };
}

export interface SpotifySearchResponse {
  albums: {
    items: SpotifyAlbum[];
  };
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
} 