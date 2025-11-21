const express = require('express');
const router = express.Router();

const { loginRequired } = require('../middleware/auth.middleware');
const usuarioController = require('../controllers/auth.controllers');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una cuenta de usuario nueva con validación de email y contraseña segura
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Daniel García"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "daniel@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales
 *                 example: "MiPassword123!"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     email:
 *                       type: string
 *                     rol:
 *                       type: integer
 *       400:
 *         description: Datos inválidos o contraseña débil
 *       409:
 *         description: El email ya está registrado
 *       500:
 *         description: Error del servidor
 */
router.post('/register', usuarioController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un token JWT en una cookie httpOnly. Incluye protección contra fuerza bruta (5 intentos máximo, bloqueo de 5 minutos)
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "daniel@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MiPassword123!"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     rol:
 *                       type: integer
 *       400:
 *         description: Campos requeridos faltantes
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 remainingAttempts:
 *                   type: integer
 *       403:
 *         description: Usuario desactivado
 *       429:
 *         description: Cuenta bloqueada por intentos fallidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 remainingTime:
 *                   type: integer
 *                 lockedUntil:
 *                   type: integer
 *       500:
 *         description: Error del servidor
 */
router.post('/login', usuarioController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Elimina la cookie del token JWT
 *     tags:
 *       - Autenticación
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout exitoso"
 *       500:
 *         description: Error del servidor
 */
router.post('/logout', usuarioController.logout);

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obtener perfil del usuario
 *     description: Retorna la información del usuario autenticado
 *     tags:
 *       - Autenticación
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 email:
 *                   type: string
 *                 rol:
 *                   type: integer
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/perfil', loginRequired, usuarioController.getProfile);

/**
 * @swagger
 * /api/auth/perfil:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     description: Actualiza nombre y email del usuario autenticado
 *     tags:
 *       - Autenticación
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Daniel García Actualizado"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "daniel.nuevo@example.com"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Email ya está en uso
 *       500:
 *         description: Error del servidor
 */
router.put('/perfil', loginRequired, usuarioController.updateProfile);

/**
 * @swagger
 * /api/auth/cambiar-contrasena:
 *   put:
 *     summary: Cambiar contraseña
 *     description: Actualiza la contraseña del usuario autenticado
 *     tags:
 *       - Autenticación
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "MiPasswordViejo123!"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: Mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales
 *                 example: "MiPasswordNuevo123!"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contraseña actualizada exitosamente"
 *       400:
 *         description: Datos inválidos o contraseña débil
 *       401:
 *         description: No autenticado o contraseña actual incorrecta
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/cambiar-contrasena', loginRequired, usuarioController.changePassword);

module.exports = router;