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
 * /peliculas/por_pelicula/{id_pelicula}:
 *   get:
 *     summary: Obtener la información completa de una película
 *     tags: [Películas]
 *     description: Devuelve todos los valores encontrados para una película en específico.
 *     parameters:
 *       - in: path
 *         name: id_pelicula
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID de la película.
 *     responses:
 *       200:
 *         description: Listado de datos de una película específica.
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
 *                         example: "El Señor de los Anillos: La Comunidad del Anillo"
 *                         description: Nombre de la película
 *                       sinopsis:
 *                         type: string
 *                         example: "Un hobbit llamado Frodo hereda un anillo mágico que tiene el poder de destruir o someter el mundo."
 *                         description: Sinopsis de la película 
 *                       imagen:
 *                         type: string
 *                         example: "https://example.com/imagenes/elsenordelosanillos.jpg"
 *                         description: URL de la imagen de la película
 *                       trailer:
 *                         type: string
 *                         example: "https://youtube.com/watch?v=V75dMMIW2B4"
 *                         description: URL del tráiler de la película
 *                       genero:
 *                         type: string
 *                         example: "Fantasía"
 *                         description: Género de la película
 *                       duracion:
 *                         type: string
 *                         example: "3h 48m"
 *                         description: Duración de la película
 *                       clasificacion:
 *                         type: string
 *                         example: "PG-13"
 *                         description: Clasificación de la película
 *                       director:
 *                         type: string
 *                         example: "Peter Jackson"
 *                         description: Nombre del director de la película
 *                       año:
 *                         type: string
 *                         example: "2001"
 *                         description: Año de publicación de la película
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
router.get('/:id_pelicula', async (req, res) => {
    const { id_pelicula } = req.params; //Recibimos el ID de la petición

    if (isNaN(id_pelicula)) {
        return res.status(400).json({ error: "El ID de la película debe ser un número" });
    }


    try {
        const pool = await poolPromise;

        const result = await pool.request().
            input('id_pelicula', id_pelicula).
            query(`SELECT pelicula.nombre,
                    pelicula.sinopsis,
                    pelicula.imagen,
                    pelicula.trailer,
                    genero.nombre AS genero,
                    pelicula.duracion,
                    pelicula.clasificacion,
                    director.nombre AS director,
                    pelicula.anio 
                FROM pelicula
                INNER JOIN genero ON pelicula.id_genero = genero.id_genero
                INNER JOIN director ON pelicula.id_director = director.id_director
                WHERE pelicula.id_pelicula = @id_pelicula`);

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