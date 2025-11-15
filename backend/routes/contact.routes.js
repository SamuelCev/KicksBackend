const express = require('express');
const { contactUs } = require('../controllers/contact.controllers');

const router = express.Router();

router.post('/', contactUs);

module.exports = router;