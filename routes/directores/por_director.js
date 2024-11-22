import express from 'express';
import { poolPromise } from '../../db.js';

//Usamos Router para definir rutas modularmente
const router = express.Router();

//Categorización de la ruta bajo el grupo "Géneros"
/**
 * @swagger
 * tags:
 *   name: Directores
 *   description: Rutas relacionadas con Géneros
 */

//Definición de la ruta /generos/por_genero
/**
 * @swagger
 * /directores/por_director/{id_director}:
 *   get:
 *     summary: Obtiene la información básica de un director en específico
 *     tags: [Directores]
 *     description: Devuelve la información del director solicitado.
 *     parameters:
 *       - in: path
 *         name: id_director
 *         required: true 
 *         schema:
 *           type: integer
 *         description: El ID del director solicitado.
 *     responses:
 *       200:
 *         description: Lista de directores disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: Lista de registros de directores
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Steven Spielberg"
 *                         description: Nombre del director
 *                       biografia:
 *                         type: string
 *                         example: "Director y productor estadounidense, conocido por películas icónicas."
 *                         description: Descripción del director
 *                       fecha_nacimiento:
 *                         type: string
 *                         example: "1946-12-18"
 *                         description: Fecha de nacimiento del director
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Los parámetros 'id_director' debe ser un número positivo."
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Error al obtener datos"
 */

//Manejo de la solicitud
router.get('/:id_director', async (req, res) => {
    const { id_director } = req.params;

    if (isNaN(id_director)) {
        return res.status(400).json({ error: "El ID del director debe ser un número" });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request().
            input('id_director', id_director).
            query(`SELECT nombre,
                        biografia,
                        fecha_nacimiento 
                    FROM director
                    WHERE id_director = @id_director`);

        // Verificar si no se encontraron películas
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No hay directores disponibles" });
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