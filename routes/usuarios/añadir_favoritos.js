import express from 'express';
import { poolPromise } from '../../db.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Rutas relacionadas con los usuarios
 */

/**
 * @swagger
 * /usuarios/anadir_favoritos:
 *   post:
 *     summary: Añade una película a las favoritas de un usuario.
 *     tags: [Usuarios]
 *     description: Inserta una película en la lista de favoritas de un usuario.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_usuario:
 *                 type: integer
 *                 description: ID del usuario.
 *                 example: 1
 *               id_pelicula:
 *                 type: integer
 *                 description: ID de la película.
 *                 example: 100
 *     responses:
 *       201:
 *         description: Película añadida a favoritos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Película añadida a favoritos."
 *       400:
 *         description: Error en la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Faltan datos obligatorios."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Error al añadir la película a favoritos."
 */

router.post('/', async (req, res) => {
    try {
        const { id_usuario, id_pelicula } = req.body;

        // Validar campos obligatorios
        if (!id_usuario || !id_pelicula) {
            return res.status(400).json({ error: "Faltan datos obligatorios." });
        }

        const pool = await poolPromise;

        // Insertar en la tabla favorita_pelicula
        await pool.request()
            .input('id_usuario', id_usuario)
            .input('id_pelicula', id_pelicula)
            .query(`
                INSERT INTO favorita_pelicula (id_usuario, id_pelicula)
                VALUES (@id_usuario, @id_pelicula)
            `);

        res.status(201).json({ message: "Película añadida a favoritos." });
    } catch (err) {
        // Manejo de errores de unicidad (película ya en favoritos)
        if (err.originalError && err.originalError.info && err.originalError.info.number === 2627) {
            return res.status(400).json({ error: "La película ya está en favoritos para este usuario." });
        }
        console.error('Error al añadir película a favoritos: ', err);
        res.status(500).send('Error al añadir la película a favoritos.');
    }
});

export default router;