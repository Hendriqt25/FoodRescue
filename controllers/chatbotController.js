const axios = require("axios");
const ChatbotModel = require("../models/chatbotModel");

const chatWithBot = async (req, res) => {
    try {
        const chatbotInput = new ChatbotModel(req.body);
        const validation = chatbotInput.validate();

        if (!validation.isValid) {
        return res.status(400).json({
            success: false,
            message: validation.message,
        });
        }

        const payload = chatbotInput.toPayload();
        const aiResponse = await axios.post(
            `${process.env.AI_SERVICE_URL}/chatbot`,
            payload
        );

        return res.status(200).json({
            success: true,
            message: "Chatbot berhasil merespons",
            input: payload,
            result: aiResponse.data,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal merespons",
            error: error.message,
        });
    }
};

module.exports = {
    chatWithBot,
};