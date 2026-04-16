const express = require("express");
const router = express.Router();
const { handleChat } = require("../controllers/chatbotController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Chatbot — any authenticated user
router.post("/generate", authMiddleware, handleChat);

module.exports = router;
