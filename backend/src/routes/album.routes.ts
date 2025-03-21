import { Router } from 'express';
import { AlbumController } from '../controllers/album.controller';
import { isAuthenticated } from '../middleware/auth.middleware';

const router = Router();
const albumController = new AlbumController();

// Search for album information (requires authentication)
router.get('/search', isAuthenticated, albumController.searchAlbum.bind(albumController));

export default router; 