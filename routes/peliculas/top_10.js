import express from "express";
import { poolPromise } from "../../db.js";

//Usamos Router para definir rutas modularmente
const router = express.Router();

//Categorización de la ruta bajo el grupo "Películas"
/**
 * @swagger
 * tags:
 *   name: Películas
 *   description: Rutas relacionadas con Películas
 */

/**
 * @swagger
 * /peliculas/top_10:
 *   get:
 *     summary: Obtener la información básica del top 10 de las películas más vistas.
 *     tags: [Películas]
 *     description: Devuelve todos los valores encontrados para el top 10 de películas mas vistas.
 *     responses:
 *       200:
 *         description: Listado de datos de las películas más vistas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Información de la película.
 *                 peliculas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "El Señor de los Anillos"
 *                         description: Nombre de la película
 *                       imagen:
 *                         type: string
 *                         example: "https://example.com/imagen.jpg"
 *                         description: URL de la imagen de la película
 *                       clasificacion:
 *                         type: string
 *                         example: "PG-15"
 *                         description: Clasificación de la película
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El parámetro 'Id de la película' debe ser un número positivo."
 *       404:
 *         description: Película no encontrada o no disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No se encontró la película o no esta disponible"
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
            query(`SELECT TOP 10 pelicula.nombre,
                        pelicula.sinopsis,
                        pelicula.imagen,
                        pelicula.trailer,
                        genero.nombre AS genero,
                        pelicula.duracion,
                        pelicula.clasificacion,
                        director.nombre AS director,
                        pelicula.anio,
                        pelicula.reproducciones
                    FROM pelicula
                    INNER JOIN genero ON pelicula.id_genero = genero.id_genero
                    INNER JOIN director ON pelicula.id_director = director.id_director
                    ORDER BY pelicula.reproducciones DESC`);

        //Verificar si no se encontraron películas
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No hay películas disponibles para este género" });
        }

        //Respuesta
        res.json(
            result.recordset//Lista de registros obtenidos
        );
    } catch (err) {
        //Manejo de error al obtener los datos
        console.error('Error al obtener datos: ', err);
        res.status(500).send('Error al obtener datos');
    }
});

//Exportamos el router para poder ser usado
export default router;