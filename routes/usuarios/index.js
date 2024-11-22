import express from "express";
import loginRoutes from './login.js';
import registerRoutes from './register.js';

const router = express.Router();

//Montar rutas específicas
router.use('/login', loginRoutes);
router.use('/register', registerRoutes);

export default router;