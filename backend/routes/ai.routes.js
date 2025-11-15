const express = require("express");
const { generateAIResponse } = require("../controllers/aichat.controllers");

const router = express.Router();

router.post("/chat", generateAIResponse);

module.exports = router;