const express = require('express');
const { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    productosAleatorios,
    addProductImages,
    deleteProductImage,
    getStockByCategory
} = require('../controllers/products.controllers');
const upload = require('../middleware/uploadImages');
const { loginRequired } = require('../middleware/auth.middleware');
const { adminRequired } = require('../middleware/auth.middleware');
const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos
 *     description: Retorna todos los productos activos con su primera imagen. Permite filtrar por categoría y/o descuento.
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [senderismo, basketball, running]
 *         description: Filtrar por categoría
 *         example: "running"
 *       - in: query
 *         name: hasDescuento
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filtrar productos con descuento (1) o sin descuento (0)
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *                   precio:
 *                     type: number
 *                   stock:
 *                     type: integer
 *                   categoria:
 *                     type: string
 *                   descuento:
 *                     type: number
 *                   hasDescuento:
 *                     type: integer
 *                   marca:
 *                     type: string
 *                   imagen:
 *                     type: string
 *                     nullable: true
 *       500:
 *         description: Error del servidor
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear nuevo producto (Admin)
 *     description: Crea un producto con información básica y hasta 20 imágenes. Solo accesible para administradores.
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - precio
 *               - stock
 *               - categoria
 *               - descuento
 *               - marca
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Nike Air Max 90"
 *               descripcion:
 *                 type: string
 *                 example: "Tenis clásicos de running con amortiguación Air"
 *               precio:
 *                 type: number
 *                 example: 2499.99
 *               stock:
 *                 type: integer
 *                 example: 50
 *               categoria:
 *                 type: string
 *                 enum: [senderismo, basketball, running]
 *                 example: "running"
 *               descuento:
 *                 type: number
 *                 description: Porcentaje de descuento (0 a 1, ej. 0.15 = 15%)
 *                 example: 0.15
 *               marca:
 *                 type: string
 *                 example: "Nike"
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Hasta 20 imágenes del producto
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 precio:
 *                   type: number
 *                 stock:
 *                   type: integer
 *                 categoria:
 *                   type: string
 *                 descuento:
 *                   type: number
 *                 imagenes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       url:
 *                         type: string
 *       400:
 *         description: Campos faltantes o categoría inválida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol de admin)
 *       500:
 *         description: Error del servidor
 */
router.post('/', loginRequired, adminRequired, upload.array('imagenes', 20), createProduct);

/**
 * @swagger
 * /api/products/randoms:
 *   get:
 *     summary: Obtener productos aleatorios
 *     description: Retorna 4 productos aleatorios activos con su primera imagen
 *     tags:
 *       - Productos
 *     responses:
 *       200:
 *         description: Lista de 4 productos aleatorios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               maxItems: 4
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   precio:
 *                     type: number
 *                   stock:
 *                     type: integer
 *                   categoria:
 *                     type: string
 *                   imagen:
 *                     type: string
 *                     nullable: true
 *       500:
 *         description: Error del servidor
 */
router.get('/randoms', productosAleatorios);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar producto (Admin)
 *     description: Actualiza la información de un producto existente. Solo accesible para administradores.
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - descripcion
 *               - precio
 *               - stock
 *               - categoria
 *               - descuento
 *               - marca
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Nike Air Max 90 (Actualizado)"
 *               descripcion:
 *                 type: string
 *                 example: "Descripción actualizada"
 *               precio:
 *                 type: number
 *                 example: 2699.99
 *               stock:
 *                 type: integer
 *                 example: 45
 *               categoria:
 *                 type: string
 *                 enum: [senderismo, basketball, running]
 *                 example: "running"
 *               descuento:
 *                 type: number
 *                 example: 0.20
 *               marca:
 *                 type: string
 *                 example: "Nike"
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       400:
 *         description: Campos faltantes o categoría inválida
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol de admin)
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', loginRequired, adminRequired, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar producto (Admin - Soft Delete)
 *     description: Desactiva un producto (soft delete) sin eliminarlo físicamente de la base de datos. Solo accesible para administradores.
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 5
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Producto eliminado exitosamente"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol de admin)
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', loginRequired, adminRequired, deleteProduct);

/**
 * @swagger
 * /api/products/stock/categoria/{categoria}:
 *   get:
 *     summary: Obtener stock por categoría (Admin)
 *     description: Retorna el stock de todos los productos de una categoría específica. Solo accesible para administradores.
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoria
 *         required: true
 *         schema:
 *           type: string
 *           enum: [senderismo, basketball, running]
 *         description: Categoría de productos
 *         example: "basketball"
 *     responses:
 *       200:
 *         description: Stock por categoría
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   stock:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol de admin)
 *       500:
 *         description: Error del servidor
 */
router.get('/stock/categoria/:categoria', loginRequired, adminRequired, getStockByCategory);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     description: Retorna los detalles completos de un producto incluyendo todas sus imágenes
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 5
 *     responses:
 *       200:
 *         description: Detalles del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nombre:
 *                   type: string
 *                 descripcion:
 *                   type: string
 *                 precio:
 *                   type: number
 *                 stock:
 *                   type: integer
 *                 categoria:
 *                   type: string
 *                 descuento:
 *                   type: number
 *                 hasDescuento:
 *                   type: integer
 *                 marca:
 *                   type: string
 *                 imagenes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       url_imagen:
 *                         type: string
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', getProductById);

/**
 * @swagger
 * /api/products/{id}/imagenes:
 *   post:
 *     summary: Agregar imágenes a un producto (Admin)
 *     description: Agrega hasta 5 imágenes adicionales a un producto existente. Solo accesible para administradores.
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - imagenes
 *             properties:
 *               imagenes:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Hasta 5 imágenes
 *     responses:
 *       201:
 *         description: Imágenes agregadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Imágenes agregadas exitosamente"
 *                 imagenes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       url:
 *                         type: string
 *       400:
 *         description: No se enviaron imágenes
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol de admin)
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.post('/:id/imagenes', loginRequired, adminRequired, upload.array('imagenes', 5), addProductImages);

/**
 * @swagger
 * /api/products/{id}/imagenes/{imageId}:
 *   delete:
 *     summary: Eliminar imagen específica de un producto (Admin)
 *     description: Elimina una imagen específica de un producto (tanto de la BD como del servidor). Solo accesible para administradores.
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *         example: 5
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la imagen a eliminar
 *         example: 12
 *     responses:
 *       200:
 *         description: Imagen eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Imagen eliminada exitosamente"
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere rol de admin)
 *       404:
 *         description: Imagen no encontrada o no pertenece a este producto
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id/imagenes/:imageId', loginRequired, adminRequired, deleteProductImage);

module.exports = router;