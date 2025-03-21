export interface EnrichedAlbum {
  id: string;
  name: string;
  artist: string;
  releaseDate: string;
  tracks: Array<{
    name: string;
    duration: number;
  }>;
  spotifyUrl: string;
  lastFmUrl?: string;
  description?: string;
  coverImage: string;
  genres: string[];
  label: string;
} 