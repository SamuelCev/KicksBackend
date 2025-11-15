const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateAIResponse = async (req, res) => {
    try {
        const { messages } = req.body;

        const systemPrompt = {
            role: "system",
            content: "Eres un asistente útil y amigable. Responde de manera clara y concisa."
        };

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [systemPrompt, ...messages],
        });

        res.json({ response: completion.choices[0].message });
    } catch (error) {
        console.error("Error generating AI response:", error);
        res.status(500).json({ error: "Error generating AI response" });
    }
};

module.exports = { generateAIResponse };