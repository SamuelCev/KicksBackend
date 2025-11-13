const express = require('express');
const { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    productosAleatorios,
    addProductImages,
    deleteProductImage
} = require('../controllers/products.controllers');
const upload = require('../middleware/uploadImages');

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', upload.array('imagenes', 20), createProduct); // Permite hasta 20 imágenes
router.get('/randoms', productosAleatorios);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/:id', getProductById);

// Gestión de imágenes
router.post('/:id/imagenes', upload.array('imagenes', 5), addProductImages); // Agregar imágenes
router.delete('/:id/imagenes/:imageId', deleteProductImage); // Eliminar una imagen

module.exports = router;