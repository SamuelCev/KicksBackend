const express = require('express');
const { getCartByUserId, addItemToCart, removeItemFromCart, updateItemQuantity } = require('../controllers/cart.controllers');

const router = express.Router();

router.get('/', getCartByUserId);
router.post('/', addItemToCart);
router.put('/:itemId', updateItemQuantity);
router.delete('/:itemId', removeItemFromCart);

module.exports = router;