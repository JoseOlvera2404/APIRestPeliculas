import express from "express";
import loginRoutes from './login.js';
import registerRoutes from './register.js';
import historialRoutes from './historial.js';
import anadir_favoritosRoutes from './añadir_favoritos.js';
import buscar_favoritosRoutes from './buscar_favoritos.js';

const router = express.Router();

//Montar rutas específicas
router.use('/login', loginRoutes);
router.use('/register', registerRoutes);
router.use('/historial', historialRoutes);
router.use('/anadir_favoritos', anadir_favoritosRoutes);
router.use('/buscar_favoritos', buscar_favoritosRoutes);

export default router;