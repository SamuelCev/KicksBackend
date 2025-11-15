const express = require('express');
const { subscribeUser } = require('../controllers/suscripcion.controllers');

const router = express.Router();

router.post('/', subscribeUser);

module.exports = router;