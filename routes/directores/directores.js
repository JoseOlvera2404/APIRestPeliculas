import express from 'express';
import { poolPromise } from '../../db.js';

//Usamos Router para definir rutas modularmente
const router = express.Router();

//Categorización de la ruta bajo el grupo "Directores"
/**
 * @swagger
 * tags:
 *   name: Directores
 *   description: Rutas relacionadas con Directores
 */

//Definición de la ruta /directores/directores
/**
 * @swagger
 * /directores/nombres:
 *   get:
 *     summary: Obtiene la información básica de los directores
 *     tags: [Directores]
 *     description: Devuelve la información de todos los directores disponibles.
 *     responses:
 *       200:
 *         description: Lista de directores disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Información de los directores.
 *                   example: 100
 *                 generos:
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
            query(`SELECT 
                        id_director,
                        nombre,
                        biografia,
                        fecha_nacimiento 
                    FROM director`);

        // Verificar si no se encontraron películas
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No hay directores disponibles" });
        }

        const totalResult = await pool.request().
            query(`SELECT COUNT(*) AS total FROM director`);
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