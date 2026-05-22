const axios = require("axios");

exports.handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ reply: "Message is required." });

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful fitness assistant. Answer fitness, diet, workout and gym related questions clearly." },
                    { role: "user", content: message }
                ]
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    // ✅ FIXED: was "${BASE_URL}" (literal string) — now uses env variable
                    "HTTP-Referer": process.env.BASE_URL || "https://yourdomain.com",
                    "X-Title": "Gym Management System"
                }
            }
        );

        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error("AI Error:", error.response?.data || error.message);
        res.status(500).json({ reply: "AI server error. Please try again." });
    }
};
