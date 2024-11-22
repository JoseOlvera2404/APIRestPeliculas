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

//Definición de la ruta /generos/generos
/**
 * @swagger
 * /generos/nombres:
 *   get:
 *     summary: Obtiene la información básica de los generos
 *     tags: [Géneros]
 *     description: Devuelve la información de todos los géneros disponibles.
 *     responses:
 *       200:
 *         description: Lista de géneros disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Información de los géneros.
 *                   example: 100
 *                 generos:
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
router.get('/', async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().
            query(`SELECT nombre 
                    FROM genero`);

        // Verificar si no se encontraron películas
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No hay géneros disponibles" });
        }

        const totalResult = await pool.request().
            query(`SELECT COUNT(*) AS total FROM genero`);
        const totalRecords = totalResult.recordset[0].total;

        //Respuesta
        res.json({
            totalRecords,
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