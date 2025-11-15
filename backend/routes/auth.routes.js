const express = require('express');
const router = express.Router();

const { loginRequired } = require('../middleware/auth.middleware');
const usuarioController = require('../controllers/auth.controllers');

// Rutas públicas 
router.post('/register', usuarioController.register);
router.post('/login', usuarioController.login);
router.post('/logout', usuarioController.logout);
// Rutas protegidas 
router.get('/perfil', loginRequired, usuarioController.getProfile);
router.put('/perfil', loginRequired, usuarioController.updateProfile);
router.put('/cambiar-contraseña', loginRequired, usuarioController.changePassword);

module.exports = router;
