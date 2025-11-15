const express = require('express');
const { createOrder, getPaises, infoTransferencia, getOxxoDetails, getVentas, getVentasPorCategoria } = require('../controllers/ordenes.controllers');
const { loginRequired } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/', loginRequired, createOrder);
router.get('/paises', loginRequired, getPaises);
router.get('/info-transferencia', loginRequired, infoTransferencia);
router.get('/oxxo-details', loginRequired, getOxxoDetails);
router.get('/ventas', loginRequired, getVentas);
router.get('/ventas-por-categoria', loginRequired, getVentasPorCategoria);
module.exports = router;