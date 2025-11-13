const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, productosAleatorios } = require('../controllers/products.controllers');

const router = express.Router();

router.get('/', getAllProducts);
router.post('/', createProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/:id', getProductById);
router.get('/randoms', productosAleatorios);

module.exports = router;