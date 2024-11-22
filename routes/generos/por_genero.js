import express from 'express';
import { poolPromise } from '../../db.js';

//Usamos Router para definir rutas modularmente
const router = express.Router();

//Categorización de la ruta bajo el grupo "Géneros"
/**
 * @swagger
 * tags:
 *   name: Géneros
 *   description: Rutas relacionadas con Géneros
 */

//Definición de la ruta /generos/por_genero
/**
 * @swagger
 * /generos/por_genero/{id_genero}:
 *   get:
 *     summary: Obtiene la información básica de un género en específico
 *     tags: [Géneros]
 *     description: Devuelve la información del género solicitado.
 *     parameters:
 *       - in: path
 *         name: id_genero
 *         required: true 
 *         schema:
 *           type: integer
 *         description: El ID del género solicitado.
 *     responses:
 *       200:
 *         description: Lista de géneros disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: Lista de registros de películas
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "Animación"
 *                         description: Nombre del género
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Los parámetros 'page' y 'limit' deben ser números positivos."
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Error al obtener datos"
 */

//Manejo de la solicitud
router.get('/:id_genero', async (req, res) => {
    const { id_genero } = req.params;

    if (isNaN(id_genero)) {
        return res.status(400).json({ error: "El ID del género debe ser un número" });
    }

    try {
        const pool = await poolPromise;

        const result = await pool.request().
            input('id_genero', id_genero).
            query(`SELECT nombre 
                    FROM genero
                    WHERE id_genero = @id_genero`);

        // Verificar si no se encontraron películas
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No hay géneros disponibles" });
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