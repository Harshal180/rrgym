// src/services/chatbotService.js
// Fitness chatbot API calls.

import api from "./api";

const chatbotService = {
  // Send a message to the AI chatbot
  sendMessage: (message) =>
    api.post("/api/chatbot", { message }),
};

export default chatbotService;
