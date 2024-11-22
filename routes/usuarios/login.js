import express from 'express';
import { poolPromise } from '../../db.js';
import bcrypt from 'bcryptjs'; // Para verificar la contraseña

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Rutas relacionadas con los usuarios
 */

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Realiza el login de un usuario
 *     tags: [Usuarios]
 *     description: Verifica las credenciales del usuario y devuelve un token de acceso si son correctas.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *                 example: "usuario@ejemplo.com"
 *               contraseña:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "miContraseña123"
 *     responses:
 *       200:
 *         description: Login exitoso, se devuelve un token de acceso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login exitoso."
 *       400:
 *         description: Datos inválidos o faltantes en la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El formato del correo electrónico es inválido."
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Error al verificar las credenciales"
 */

router.post('/', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        // Validar que ambos campos se envíen
        if (!correo || !contraseña) {
            return res.status(400).json({ error: "Correo y contraseña son requeridos" });
        }

        // Validar que el formato del correo sea válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            return res.status(400).json({ error: "El formato del correo electrónico es inválido" });
        }

        const pool = await poolPromise;

        // Buscar al usuario por correo
        const result = await pool.request()
            .input('correo', correo)
            .query(`SELECT * FROM usuario WHERE correo = @correo`);

        // Si el usuario no existe
        if (result.recordset.length === 0) {
            return res.status(400).json({ error: "Correo o contraseña incorrectos" });
        }

        const usuario = result.recordset[0];

        // Comparar la contraseña proporcionada con la almacenada
        const isMatch = await bcrypt.compare(contraseña, usuario.contraseña);

        if (!isMatch) {
            return res.status(400).json({ error: "Correo o contraseña incorrectos" });
        }

        // Respuesta exitosa
        res.json({
            message: "Login exitoso",
        });
    } catch (err) {
        // Manejo de error al verificar las credenciales
        console.error('Error al verificar credenciales: ', err);
        res.status(500).send('Error al verificar las credenciales');
    }
});

export default router;
