import express from 'express';
import { poolPromise } from '../../db.js';
import bcrypt from 'bcryptjs'; // Para cifrar la contraseña

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Rutas relacionadas con los usuarios
 */

/**
 * @swagger
 * /usuarios/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Usuarios]
 *     description: Registra un nuevo usuario en la base de datos después de validar los datos y cifrar la contraseña.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del usuario
 *                 example: "Juan Pérez"
 *               correo:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *                 example: "juan.perez@ejemplo.com"
 *               contraseña:
 *                 type: string
 *                 description: Contraseña del usuario
 *                 example: "miContraseña123"
 *               fecha_nacimiento:
 *                 type: string
 *                 description: | 
 *                   Fecha de nacimiento del usuario (Formato: YYYY-MM-DD)
 *                 example: "1990-05-15"
 *               suscripcion:
 *                 type: boolean
 *                 description: Estado de suscripción del usuario
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario registrado exitosamente."
 *       400:
 *         description: Datos inválidos o faltantes en la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El correo electrónico ya está registrado."
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "Error al registrar el usuario."
 */

router.post('/', async (req, res) => {
    try {
        const { nombre, correo, contraseña, fecha_nacimiento, suscripcion } = req.body;

        // Validar que todos los campos requeridos sean enviados
        if (!nombre || !correo || !contraseña || !fecha_nacimiento || suscripcion === undefined) {
            return res.status(400).json({ error: "Todos los campos son requeridos" });
        }

        // Validar que el formato del correo sea válido
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            return res.status(400).json({ error: "El formato del correo electrónico es inválido" });
        }

        const pool = await poolPromise;

        // Verificar si el correo ya está registrado
        const result = await pool.request()
            .input('correo', correo)
            .query(`SELECT * FROM usuario WHERE correo = @correo`);

        if (result.recordset.length > 0) {
            return res.status(400).json({ error: "El correo electrónico ya está registrado" });
        }

        // Cifrar la contraseña
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        // Insertar el nuevo usuario en la base de datos
        const insertResult = await pool.request()
            .input('nombre', nombre)
            .input('correo', correo)
            .input('contraseña', hashedPassword)
            .input('fecha_nacimiento', fecha_nacimiento)
            .input('suscripcion', suscripcion)
            .query(`
                INSERT INTO usuario (nombre, correo, contraseña, fecha_nacimiento, suscripcion)
                VALUES (@nombre, @correo, @contraseña, @fecha_nacimiento, @suscripcion)
            `);

        // Respuesta exitosa
        res.status(201).json({
            message: "Usuario registrado exitosamente",
        });
    } catch (err) {
        // Manejo de error al registrar el usuario
        console.error('Error al registrar usuario: ', err);
        res.status(500).send('Error al registrar el usuario');
    }
});

export default router;