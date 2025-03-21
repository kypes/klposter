# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

# KL Poster Frontend

## External API Integrations

### Spotify API Setup
1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new application
3. Note down your Client ID and Client Secret
4. Add your application's redirect URI in the app settings
5. Copy `.env.example` to `.env` and update with your Spotify credentials:
   ```
   PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
   PUBLIC_SPOTIFY_CLIENT_SECRET=your_client_secret
   ```

### Last.fm API Setup
1. Create a [Last.fm API account](https://www.last.fm/api/account/create)
2. Note down your API key
3. Update your `.env` file with your Last.fm API key:
   ```
   PUBLIC_LASTFM_API_KEY=your_api_key
   ```

## Features
- Search for albums using Spotify's extensive database
- View detailed album information including track listings
- Get additional album details and descriptions from Last.fm
- Preview album artwork and external links
- Responsive design with a modern UI

## Development
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Component Usage

### AlbumSearch Component
```tsx
import { AlbumSearch } from './components/react/AlbumSearch';

function App() {
  const handleAlbumSelect = (album) => {
    console.log('Selected album:', album);
  };

  return (
    <AlbumSearch
      spotifyToken="your_spotify_token"
      lastFmApiKey="your_lastfm_api_key"
      onAlbumSelect={handleAlbumSelect}
    />
  );
}
```

### AlbumDetails Component
```tsx
import { AlbumDetails } from './components/react/AlbumDetails';

function AlbumView({ album }) {
  return <AlbumDetails album={album} />;
}
```

## API Types

### EnrichedAlbum Interface
```typescript
interface EnrichedAlbum {
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
}
```

## Error Handling
The components include built-in error handling for API requests and display appropriate error messages to users. All external API calls are wrapped in try-catch blocks and use a consistent error format.
