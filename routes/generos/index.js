import express from 'express';
import generoRoutes from './generos.js';
import por_generoRoutes from './por_genero.js';

const router = express.Router();

//Montar rutas específicas
router.use('/nombres', generoRoutes);
router.use('/por_genero', por_generoRoutes);

export default router;