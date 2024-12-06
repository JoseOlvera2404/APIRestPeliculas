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
 * /peliculas/por_generos/{id_genero}:
 *   get:
 *     summary: Obtener las películas correspondientes al género especificado
 *     tags: [Películas]
 *     description: Devuelve una lista de películas filtradas por el género especificado, con paginación.
 *     parameters:
 *       - in: path
 *         name: id_genero
 *         required: true
 *         schema:
 *           type: integer
 *         description: El ID del género.
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página.
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de elementos por página.
 *     responses:
 *       200:
 *         description: Lista de películas en el género especificado.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total de películas en el género.
 *                 peliculas:
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
router.get('/:id_genero', async (req, res) => {
    const { id_genero } = req.params; //Recibimos el ID de la petición
    const { page = 1, limit = 10 } = req.query; //Son los valores predeterminados; traerá la página 1 con 10 registros.

    //Se válida que sean números positivos
    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);

    if (isNaN(pageInt) || isNaN(limitInt) || pageInt <= 0 || limitInt <= 0) {
        return res.status(400).json({ error: "Los parámetros 'page' y 'limit' deben ser números positivos." });
    }

    try {
        const pool = await poolPromise;
        const offset = (pageInt - 1) * limitInt; //Calcular desde donde empezar

        //Verificar que el género existe
        const genreCheck = await pool.request().
            input('id_genero', id_genero).
            query(`SELECT id_genero 
                    FROM genero 
                    WHERE id_genero = @id_genero`);

        //Verificar que la longitud de la consulta sea distinta a 0
        if (genreCheck.recordset.length == 0) {
            return res.status(404).json({ error: "Género no encontrado" });
        }
        /*
        Consulta SQL explicada:
        ORDER BY: Ordenaraá los campos según el nombre de forma alfabética.
        OFFSET: Indica la cantidad de filas deben ser saltadas antes de devolver resultados.
        FETCH NEXT {} ROWS ONLY: Indica la cantidad de filas que deben devolverse después de saltarse las filas del OFFSET.
        */
        const result = await pool.request().
            input('offset', offset).
            input('limit', limitInt).
            input('id_genero', id_genero).
            query(`SELECT 
                        id_pelicula,
                        nombre, 
                        imagen,
                        clasificacion
                    FROM pelicula 
                    WHERE id_genero = @id_genero
                    ORDER BY nombre 
                    OFFSET @offset 
                    ROWS FETCH NEXT @limit 
                    ROWS ONLY`);

        //Verificar si no se encontraron películas
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No hay películas disponibles para este género" });
        }

        //Obtener el total de registros (Para calcular el total de páginas)
        const totalResult = await pool.request().
            query(`SELECT COUNT(*) AS total FROM pelicula`); //Obtiene el total de los registros en la tabla.
        const totalRecords = totalResult.recordset[0].total; //Almacena el valor obtenido.

        //Calcular páginas totales
        const totalPages = Math.ceil(totalRecords / limitInt);

        //Respuesta
        res.json({
            totalRecords, //Devuelve el total de registros
            totalPages, //Devuelve el total de páginas posibles
            currentPage: pageInt, //Devuelve la página actual solicitada
            limit: limitInt, //Cantidad de registros por página
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