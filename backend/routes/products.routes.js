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

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', loginRequired, upload.array('imagenes', 20), createProduct); // Permite hasta 20 imágenes
router.get('/randoms', productosAleatorios);
router.put('/:id', loginRequired, updateProduct);
router.delete('/:id', loginRequired, deleteProduct);
router.get('/stock/categoria/:categoria', loginRequired, getStockByCategory);
router.get('/:id', getProductById);

// Gestión de imágenes
router.post('/:id/imagenes', loginRequired, upload.array('imagenes', 5), addProductImages); // Agregar imágenes
router.delete('/:id/imagenes/:imageId', loginRequired, deleteProductImage); // Eliminar una imagen

module.exports = router;