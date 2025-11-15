const express = require('express');
const { getCartByUserId, addItemToCart, removeItemFromCart, updateItemQuantity } = require('../controllers/cart.controllers');
const { loginRequired } = require('../middleware/auth.middleware');
const router = express.Router();

router.get('/', loginRequired, getCartByUserId);
router.post('/', loginRequired, addItemToCart);
router.put('/:itemId', loginRequired, updateItemQuantity);
router.delete('/:itemId', loginRequired, removeItemFromCart);

module.exports = router;