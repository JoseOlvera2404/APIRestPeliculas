import express from 'express';
import infobasicaRoutes from './infobasica.js';
import por_generoRoutes from './por_generos.js';
import por_peliculaRoutes from './por_pelicula.js';
import top_10Routes from './top_10.js';
import buscarRoutes from './buscar.js';

const router = express.Router();

// Montar las rutas específicas
router.use('/infobasica', infobasicaRoutes);
router.use('/por_generos', por_generoRoutes);
router.use('/por_pelicula', por_peliculaRoutes);
router.use('/top_10', top_10Routes);
router.use('/buscar', buscarRoutes);

export default router;
