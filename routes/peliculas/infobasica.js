import express from 'express';
import { poolPromise } from '../../db.js';

//Usamos Router para definir rutas modularmente
const router = express.Router();

//Categorización de la ruta bajo el grupo "Películas"
/**
 * @swagger
 * tags:
 *   name: Películas
 *   description: Rutas relacionadas con Películas
 */

//Definición de la ruta /peliculas/nombres
/**
 * @swagger
 * /peliculas/infobasica:
 *   get:
 *     summary: Obtiene la información básica de las películas con soporte de paginación
 *     tags: [Películas]
 *     description: Retorna todas las películas disponibles con paginación, determinada a la primera página con 10 registros por página.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página (valor por defecto es 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de registros por página (valor por defecto es 10)
 *     responses:
 *       200:
 *         description: Lista paginada de películas con metadatos
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

        /*
        Consulta SQL explicada:
        ORDER BY: Ordenaraá los campos según el nombre de forma alfabética.
        OFFSET: Indica la cantidad de filas deben ser saltadas antes de devolver resultados.
        FETCH NEXT {} ROWS ONLY: Indica la cantidad de filas que deben devolverse después de saltarse las filas del OFFSET.
        */
        const result = await pool.request().
            input('offset', offset).
            input('limit', limitInt).
            query(`SELECT nombre, 
                        imagen,
                        clasificacion
                    FROM pelicula 
                    ORDER BY nombre 
                    OFFSET @offset 
                    ROWS FETCH NEXT @limit 
                    ROWS ONLY`);

        // Verificar si no se encontraron películas
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No hay más películas disponibles" });
        }

        //Obtener el total de registros (Para calcular el total de páginas)
        const totalResult = await pool.request().
            query(`SELECT COUNT(*) AS total FROM pelicula`); //Obtiene el total de los registros en la tabla.
        const totalRecords = totalResult.recordset[0].total; //Almacena el valor obtenido.

        //Calcular páginas totales
        const totalPages = Math.ceil(totalRecords / limitInt);

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