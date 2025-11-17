const express = require('express');
const { getCartByUserId, addItemToCart, removeItemFromCart, updateItemQuantity } = require('../controllers/cart.controllers');
const { loginRequired } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Obtener carrito del usuario
 *     description: Retorna todos los ítems del carrito del usuario autenticado con información del producto
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Carrito obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID del ítem en el carrito
 *                   usuario_id:
 *                     type: integer
 *                   producto_id:
 *                     type: integer
 *                   cantidad:
 *                     type: integer
 *                   info_producto:
 *                     type: object
 *                     properties:
 *                       nombre:
 *                         type: string
 *                       precio:
 *                         type: number
 *                       stock:
 *                         type: integer
 *                       imagen:
 *                         type: string
 *                         nullable: true
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/', loginRequired, getCartByUserId);

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Agregar ítem al carrito
 *     description: Agrega un producto al carrito del usuario autenticado
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - cantidad
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID del producto a agregar
 *                 example: 5
 *               cantidad:
 *                 type: integer
 *                 description: Cantidad del producto
 *                 minimum: 1
 *                 example: 2
 *     responses:
 *       201:
 *         description: Ítem agregado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID del nuevo ítem en el carrito
 *                 userId:
 *                   type: integer
 *                 productId:
 *                   type: integer
 *                 cantidad:
 *                   type: integer
 *       400:
 *         description: Campos faltantes
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.post('/', loginRequired, addItemToCart);

/**
 * @swagger
 * /api/cart/{itemId}:
 *   put:
 *     summary: Actualizar cantidad de ítem
 *     description: Actualiza la cantidad de un ítem específico en el carrito, validando el stock disponible
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ítem en el carrito
 *         example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cantidad
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 description: Nueva cantidad (mínimo 1)
 *                 minimum: 1
 *                 example: 5
 *     responses:
 *       200:
 *         description: Cantidad actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cantidad actualizada correctamente"
 *                 itemId:
 *                   type: integer
 *                 cantidad:
 *                   type: integer
 *       400:
 *         description: Cantidad inválida o excede el stock disponible
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 stockDisponible:
 *                   type: integer
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Ítem o producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:itemId', loginRequired, updateItemQuantity);

/**
 * @swagger
 * /api/cart/{itemId}:
 *   delete:
 *     summary: Eliminar ítem del carrito
 *     description: Elimina un ítem específico del carrito del usuario autenticado
 *     tags:
 *       - Carrito
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del ítem en el carrito
 *         example: 3
 *     responses:
 *       200:
 *         description: Ítem eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ítem eliminado del carrito"
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Ítem no encontrado en el carrito
 *       500:
 *         description: Error del servidor
 */
router.delete('/:itemId', loginRequired, removeItemFromCart);

module.exports = router;