import express from "express";
import { isAuthenticated } from "../middleware/auth-middleware";
import { logger } from "../utils/logger";
import { ApiError } from "../middleware/error-handler";

// Create router
const router = express.Router();

/**
 * @route   GET /api/music/health
 * @desc    Health check for music API
 * @access  Public
 */
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Music API is running" });
});

/**
 * @route   GET /api/music/spotify/search
 * @desc    Search for music on Spotify
 * @access  Private
 */
router.get("/spotify/search", isAuthenticated, (req, res) => {
  try {
    // This is a placeholder for actual Spotify API integration
    // In a mock environment, we'll return dummy data
    const query = req.query.q as string;

    if (!query) {
      throw new ApiError(400, "Search query is required");
    }

    logger.info(`Spotify search request for: ${query}`);

    // Mock response with dummy data
    res.status(200).json({
      results: [
        {
          id: "album1",
          name: `${query} - Album`,
          artist: "Artist Name",
          releaseDate: "2023-01-01",
          coverUrl: "https://via.placeholder.com/300",
          type: "album",
        },
        {
          id: "track1",
          name: `${query} - Track`,
          artist: "Artist Name",
          album: "Album Name",
          releaseDate: "2023-01-01",
          coverUrl: "https://via.placeholder.com/300",
          type: "track",
        },
      ],
    });
  } catch (error) {
    logger.error("Error in Spotify search:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to search Spotify");
  }
});

/**
 * @route   GET /api/music/lastfm/search
 * @desc    Search for music on Last.fm
 * @access  Private
 */
router.get("/lastfm/search", isAuthenticated, (req, res) => {
  try {
    // This is a placeholder for actual Last.fm API integration
    // In a mock environment, we'll return dummy data
    const query = req.query.q as string;

    if (!query) {
      throw new ApiError(400, "Search query is required");
    }

    logger.info(`Last.fm search request for: ${query}`);

    // Mock response with dummy data
    res.status(200).json({
      results: [
        {
          id: "album1",
          name: `${query} - Album`,
          artist: "Artist Name",
          tags: ["rock", "alternative", "indie"],
          listeners: 12345,
          playcount: 67890,
          wikiSummary: "This is a summary of the album from Last.fm wiki.",
          type: "album",
        },
        {
          id: "artist1",
          name: "Artist Name",
          tags: ["rock", "alternative", "indie"],
          listeners: 54321,
          playcount: 98765,
          wikiSummary: "This is a summary of the artist from Last.fm wiki.",
          type: "artist",
        },
      ],
    });
  } catch (error) {
    logger.error("Error in Last.fm search:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to search Last.fm");
  }
});

// Export the router
export const musicApiRoutes = router;
