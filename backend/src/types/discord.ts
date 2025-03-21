export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface DiscordEmbedThumbnail {
  url: string;
}

export interface DiscordEmbedFooter {
  text: string;
  icon_url?: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  fields?: DiscordEmbedField[];
  thumbnail?: DiscordEmbedThumbnail;
  footer?: DiscordEmbedFooter;
}

export interface DiscordWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  embeds?: DiscordEmbed[];
} 