const express = require('express');
const { getCaptcha, verifyCaptcha } = require('../controllers/captcha.controllers');

const router = express.Router();

router.get('/generate', getCaptcha);
router.post('/validate', verifyCaptcha);

module.exports = router;
