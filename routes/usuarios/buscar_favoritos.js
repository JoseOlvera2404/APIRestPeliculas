import express from 'express';
import { poolPromise } from '../../db.js';

//Usamos Router para definir rutas modularmente
const router = express.Router();

//Categorización de la ruta bajo el grupo "Usuarios"
/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Rutas relacionadas con Usuarios
 */

//Definición de la ruta /usuarios/buscar_favoritos
/**
 * @swagger
 * /usuarios/buscar_favoritos/{id_usuario}:
 *   get:
 *     summary: Obtiene la información del historial de favoritos de un usuario en específico
 *     tags: [Usuarios]
 *     description: Devuelve la información del historial de favoritos del usuario solicitado.
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true 
 *         schema:
 *           type: integer
 *         description: El ID del usuario solicitado.
 *     responses:
 *       200:
 *         description: Lista de usuarios disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: Lista del historial de películas
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "El Señor de los Anillos"
 *                         description: Nombre de la película
 *                       imagen:
 *                         type: string
 *                         example: "El Señor de los Anillos"
 *                         description: URL de la imagen de la película
 *                       director:
 *                         type: string
 *                         example: "Steven Spielberg"
 *                         description: Nombre del director de la película
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Los parámetros de 'id_usuario' debe ser un número positivo."
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Error al obtener datos"
 */

//Manejo de la solicitud
router.get('/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;

    if (isNaN(id_usuario)) {
        return res.status(400).json({ error: "El ID del usuario debe ser un número" });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request().
            input('id_usuario', id_usuario).
            query(`SELECT pelicula. nombre,
                        pelicula.imagen,
                        director.nombre AS director
                    FROM favorita_pelicula
                    JOIN pelicula ON favorita_pelicula.id_pelicula = pelicula.id_pelicula
                    JOIN director ON pelicula.id_director = director.id_director
                    WHERE favorita_pelicula.id_usuario = @id_usuario`);

        // Verificar si no se encontraron películas
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No hay historial disponible" });
        }

        //Respuesta
        res.json({
            data: result.recordset, //Lista de registros obtenidos
        });
    } catch (err) {
        //Manejo de error al obtener los datos
        console.error('Error al obtener datos: ', err);
        res.status(500).send('Error al obtener datos');
    }
});

//Exportamos el router para poder ser usado
export default router;