import express from "express";
import { poolPromise } from "../../db.js";

//Usamos Router para definir rutas modularmente
const router = express.Router();

//Categorización de la ruta bajo el grupo "Películas"
/**
 * @swagger
 * tags:
 *   name: Películas
 *   description: Rutas relacionadas con películas
 */

/**
 * @swagger
 * /peliculas/buscar:
 *   get:
 *     summary: Obtener los resultados de búsqueda coincidentes.
 *     tags: [Películas]
 *     description: Devuelve una lista de películas filtradas por el género, nombre o director especificado, con paginación.
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: El parámetro de búsqueda.
 *     responses:
 *       200:
 *         description: Lista de películas que coinciden con el término de búsqueda.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resultados:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                         example: "El Señor de los Anillos: La Comunidad del Anillo"
 *                         description: Nombre de la película
 *                       imagen:
 *                         type: string
 *                         example: "https://example.com/imagenes/elsenordelosanillos.jpg"
 *                         description: URL de la imagen de la película
 *                       clasificacion:
 *                         type: string
 *                         example: "PG-13"
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
 *                   example: "Los parámetros 'id_genero', 'page' y 'limit' deben ser números positivos."
 *       404:
 *         description: Género no encontrado o sin películas disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No se encontró el género o no hay películas disponibles"
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
    const { query } = req.query; //Recibimos el término de búsqueda

    //Válidamos que hayamos recibido un término.
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: "El parámetro 'query' es requerido y debe ser una cadena válida." });
    }

    try {
        const pool = await poolPromise;
        /*
        Consulta SQL explicada:
        ORDER BY: Ordenaraá los campos según el nombre de forma alfabética.
        OFFSET: Indica la cantidad de filas deben ser saltadas antes de devolver resultados.
        FETCH NEXT {} ROWS ONLY: Indica la cantidad de filas que deben devolverse después de saltarse las filas del OFFSET.
        */
        const result = await pool.request().
            input('query', `%${query}%`).
            query(`SELECT pelicula.nombre, 
                        pelicula.imagen,
                        pelicula.clasificacion,
                        genero.nombre AS genero,
                        director.nombre AS director
                    FROM pelicula 
                    INNER JOIN genero ON pelicula.id_genero = genero.id_genero
                    INNER JOIN director ON pelicula.id_director = director.id_director
                    WHERE pelicula.nombre LIKE @query 
                    OR pelicula.nombre LIKE '% ' + @query + '%' 
                    OR pelicula.nombre LIKE @query + '%' 
                    OR pelicula.nombre LIKE '% ' + @query
                    OR genero.nombre LIKE @query 
                    OR genero.nombre LIKE '% ' + @query + '%' 
                    OR genero.nombre LIKE @query + '%' 
                    OR genero.nombre LIKE '% ' + @query
                    OR director.nombre LIKE @query 
                    OR director.nombre LIKE '% ' + @query + '%' 
                    OR director.nombre LIKE @query + '%' 
                    OR director.nombre LIKE '% ' + @query
                    ORDER BY pelicula.nombre`);

        //Verificar si no se encontraron películas
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No hay películas disponibles para este género" });
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