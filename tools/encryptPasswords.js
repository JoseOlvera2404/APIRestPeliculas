import bcrypt from 'bcryptjs';
import { poolPromise } from './../db.js'; // Tu poolPromise para conexión a la base de datos

async function encriptarContraseñasExistentes() {
    const saltRounds = 10; // Número de rondas de salt
    const pool = await poolPromise;

    try {
        // 1. Recuperamos todos los usuarios de la base de datos (sin contraseña encriptada)
        const result = await pool.request().query('SELECT id_usuario, contraseña FROM usuario');

        // 2. Para cada usuario, encriptamos la contraseña y actualizamos en la base de datos
        for (const usuario of result.recordset) {
            const hashedPassword = await bcrypt.hash(usuario.contraseña, saltRounds);

            // 3. Actualizamos la contraseña en la base de datos
            await pool.request()
                .input('id_usuario', usuario.id_usuario)
                .input('hashedPassword', hashedPassword)
                .query('UPDATE usuario SET contraseña = @hashedPassword WHERE id_usuario = @id_usuario');

            console.log(`Contraseña encriptada para el usuario con ID ${usuario.id_usuario}`);
        }

        console.log('Todas las contraseñas han sido encriptadas y actualizadas.');
    } catch (error) {
        console.error('Error al encriptar las contraseñas:', error);
    }
}

encriptarContraseñasExistentes();
