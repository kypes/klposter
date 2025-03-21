export type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';

export interface Track {
  title: string;
  duration: number;
  position: number;
}

export interface AlbumInfo {
  title: string;
  artist: string;
  coverUrl: string;
  releaseDate: string;
  tracks: Track[];
}

export interface Post {
  id: string;
  userId: string;
  channelId: string;
  description?: string;
  albumInfo: AlbumInfo;
  scheduledFor?: Date;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePostDto {
  title: string;
  artist: string;
  album: string;
  releaseDate?: string;
  spotifyUrl?: string;
  lastfmUrl?: string;
  imageUrl?: string;
  description?: string;
  trackList?: Track[];
  scheduledFor?: string;
  discordChannelId?: string;
}

export interface UpdatePostDto extends Partial<CreatePostDto> {
  status?: PostStatus;
}

export interface PostResponse {
  id: string;
  userId: string;
  title: string;
  artist: string;
  album: string;
  releaseDate?: string;
  spotifyUrl?: string;
  lastfmUrl?: string;
  imageUrl?: string;
  description?: string;
  trackList?: Track[];
  status: PostStatus;
  scheduledFor?: Date;
  publishedAt?: Date;
  discordMessageId?: string;
  discordChannelId?: string;
  createdAt: Date;
  updatedAt: Date;
} 