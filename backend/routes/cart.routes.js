const express = require('express');
const { getCartByUserId, addItemToCart, removeItemFromCart } = require('../controllers/cart.controllers');

const router = express.Router();

router.get('/', getCartByUserId);
router.post('/', addItemToCart);
router.delete('/:itemId', removeItemFromCart);

module.exports = router;