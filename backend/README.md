# KL Poster Backend

## External API Integrations

### Spotify API Setup
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Note down your Client ID and Client Secret
4. Generate an access token using the client credentials flow
5. Copy `.env.example` to `.env` and update with your Spotify credentials:
   ```
   SPOTIFY_CLIENT_ID=your_client_id
   SPOTIFY_CLIENT_SECRET=your_client_secret
   SPOTIFY_ACCESS_TOKEN=your_access_token
   ```

### Last.fm API Setup
1. Create a [Last.fm API account](https://www.last.fm/api/account/create)
2. Note down your API key
3. Update your `.env` file with your Last.fm API key:
   ```
   LASTFM_API_KEY=your_api_key
   ```

## API Endpoints

### Spotify Endpoints

#### GET /api/spotify/albums/:id
Get detailed information about a specific album.

#### GET /api/spotify/albums/search
Search for albums. Query parameters:
- `q`: Search query (required)

### Last.fm Endpoints

#### GET /api/lastfm/albums
Get album information. Query parameters:
- `artist`: Artist name (required)
- `album`: Album name (required)

#### GET /api/lastfm/albums/search
Search for albums. Query parameters:
- `q`: Search query (required)

## Development
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your API credentials.

3. Start the development server:
   ```bash
   npm run dev
   ```

## Error Handling
All endpoints include proper error handling and return consistent error responses in the format:
```typescript
interface ApiError {
  message: string;
  status?: number;
}
``` 