const express = require('express');
const { createOrder, getPaises, infoTransferencia, getOxxoDetails, getVentas, getVentasPorCategoria, validarCupon } = require('../controllers/ordenes.controllers');
const { loginRequired } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * /api/ordenes/validar-cupon:
 *   post:
 *     summary: Validar cupón de descuento
 *     description: Verifica si un código de cupón es válido y retorna el porcentaje de descuento aplicable
 *     tags:
 *       - Órdenes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cupon
 *             properties:
 *               cupon:
 *                 type: string
 *                 description: Código del cupón a validar
 *                 example: "DESCUENTO10"
 *     responses:
 *       200:
 *         description: Cupón válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cupon:
 *                   type: string
 *                   example: "DESCUENTO10"
 *                 descuento:
 *                   type: number
 *                   description: Porcentaje de descuento (0.10 = 10%)
 *                   example: 0.10
 *       400:
 *         description: Código de cupón no proporcionado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Cupón no válido o expirado
 *       500:
 *         description: Error al validar el cupón
 */
router.post('/validar-cupon', loginRequired, validarCupon);

/**
 * @swagger
 * /api/ordenes:
 *   post:
 *     summary: Crear una nueva orden
 *     description: Procesa el carrito del usuario, calcula impuestos y envío según el país, aplica cupones, reduce stock, envía recibo por email y vacía el carrito
 *     tags:
 *       - Órdenes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - metodo_pago
 *               - nombre_envio
 *               - direccion_envio
 *               - ciudad
 *               - codigo_postal
 *               - telefono
 *               - pais
 *             properties:
 *               metodo_pago:
 *                 type: string
 *                 enum: [tarjeta, oxxo, transferencia]
 *                 description: Método de pago seleccionado
 *                 example: "tarjeta"
 *               nombre_envio:
 *                 type: string
 *                 description: Nombre completo para el envío
 *                 example: "Daniel García"
 *               direccion_envio:
 *                 type: string
 *                 description: Dirección de envío
 *                 example: "Av. Principal 123"
 *               ciudad:
 *                 type: string
 *                 example: "Aguascalientes"
 *               codigo_postal:
 *                 type: string
 *                 example: "20000"
 *               telefono:
 *                 type: string
 *                 example: "4491234567"
 *               pais:
 *                 type: string
 *                 enum: [mexico, usa, españa]
 *                 description: País de envío (determina impuestos y costo de envío)
 *                 example: "mexico"
 *               cupon:
 *                 type: string
 *                 description: Código de cupón opcional
 *                 example: "DESCUENTO10"
 *               datos_pago:
 *                 type: object
 *                 description: Datos de la tarjeta (requerido solo si metodo_pago es 'tarjeta')
 *                 properties:
 *                   numero_tarjeta:
 *                     type: string
 *                   nombre_titular:
 *                     type: string
 *                   fecha_expiracion:
 *                     type: string
 *                   cvv:
 *                     type: string
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Orden creada exitosamente"
 *                 orderId:
 *                   type: integer
 *                   example: 42
 *       400:
 *         description: Campos faltantes, país no soportado o método de pago inválido
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error al crear la orden
 */
router.post('/', loginRequired, createOrder);

/**
 * @swagger
 * /api/ordenes/paises:
 *   get:
 *     summary: Obtener países disponibles para envío
 *     description: Retorna la lista de países soportados con sus tasas de impuestos y costos de envío
 *     tags:
 *       - Órdenes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de países disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nombre:
 *                     type: string
 *                     example: "México"
 *                   codigo:
 *                     type: string
 *                     example: "mexico"
 *                   impuesto:
 *                     type: number
 *                     format: float
 *                     description: Tasa de impuesto (0.16 = 16%)
 *                     example: 0.16
 *                   gasto_envio:
 *                     type: number
 *                     description: Costo de envío en MXN
 *                     example: 120
 *       401:
 *         description: No autenticado
 */
router.get('/paises', loginRequired, getPaises);

/**
 * @swagger
 * /api/ordenes/info-transferencia:
 *   get:
 *     summary: Obtener información para pago por transferencia
 *     description: Genera datos bancarios y referencia para realizar una transferencia bancaria
 *     tags:
 *       - Órdenes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información bancaria para transferencia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 banco:
 *                   type: string
 *                   example: "STP"
 *                 clabe:
 *                   type: string
 *                   example: "012345678901234567"
 *                 titular:
 *                   type: string
 *                   example: "Kicks Tienda"
 *                 referencia:
 *                   type: integer
 *                   description: Número de referencia generado aleatoriamente
 *                   example: 456789
 *       401:
 *         description: No autenticado
 */
router.get('/info-transferencia', loginRequired, infoTransferencia);

/**
 * @swagger
 * /api/ordenes/oxxo-details:
 *   get:
 *     summary: Obtener detalles para pago en OXXO
 *     description: Genera un número de referencia para realizar el pago en tiendas OXXO
 *     tags:
 *       - Órdenes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referencia de pago OXXO
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 referencia:
 *                   type: integer
 *                   description: Número de referencia OXXO (9 dígitos)
 *                   example: 123456789
 *       401:
 *         description: No autenticado
 */
router.get('/oxxo-details', loginRequired, getOxxoDetails);

/**
 * @swagger
 * /api/ordenes/ventas:
 *   get:
 *     summary: Obtener total de ventas
 *     description: Retorna el total acumulado de ventas (subtotal) de todas las órdenes
 *     tags:
 *       - Órdenes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalVentas:
 *                   type: number
 *                   description: Suma total de ventas en MXN
 *                   example: 125400.50
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error al obtener las ventas totales
 */
router.get('/ventas', loginRequired, getVentas);

/**
 * @swagger
 * /api/ordenes/ventas-por-categoria:
 *   get:
 *     summary: Obtener ventas por categoría
 *     description: Retorna las ventas totales agrupadas por categoría de producto
 *     tags:
 *       - Órdenes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ventas por categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   categoria:
 *                     type: string
 *                     example: "running"
 *                   total_ventas:
 *                     type: number
 *                     description: Total de ventas en esa categoría
 *                     example: 45600.00
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error al obtener las ventas por categoría
 */
router.get('/ventas-por-categoria', loginRequired, getVentasPorCategoria);

module.exports = router;