import express from 'express';
import directorRoutes from './directores.js';
import por_directorRoutes from './por_director.js';

const router = express.Router();

//Montar rutas específicas
router.use('/nombres', directorRoutes);
router.use('/por_director', por_directorRoutes);

export default router;