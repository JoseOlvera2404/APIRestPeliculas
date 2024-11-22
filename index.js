import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig.js';
import rateLimit from 'express-rate-limit';
import peliculasRoutes from './routes/peliculas/index.js';
import generosRoutes from './routes/generos/index.js';
import directoresRoutes from './routes/directores/index.js';
import usuariosRoutes from './routes/usuarios/index.js';

//Creación del objeto app
const app = express();

//Limitador de solicitudes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, //Tiempo limite, 15 minutos
    max: 100, //Limita cada IP para hacer 100 solicitudes por ventana
    message: 'Demasiadas solicitudes desde esta IP, intenta mas tarde.'
});

// Middleware para parsear JSON
app.use(express.json());

//Uso del limitador de solicitudes al API
app.use(limiter);

// Ruta de la documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta de bienvenida
/**
 * @swagger
 * /:
 *   get:
 *     summary: Página de bienvenida
 *     responses:
 *       200:
 *         description: Mensaje de bienvenida
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Hola a todos
 */
app.get('/', (req, res) => {
    res.send("Hola a todos");
});

// Rutas de películas
app.use('/peliculas', peliculasRoutes);

// Rutas de géneros
app.use('/generos', generosRoutes);

// Rutas de usuarios
app.use('/usuarios', usuariosRoutes);

// Rutas de directores
app.use('/directores', directoresRoutes);

//Puerto del host a escuchar
app.listen(3000, () => {
    console.log('Server listening on port 3000');
    console.log('Documentación disponible en: http://localhost:3000/api-docs');
});
