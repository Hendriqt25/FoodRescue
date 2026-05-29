const axios = require("axios");
const PredictionModel = require("../models/prediction");

const predictionFood = async (req, res) => {
    try {
        const predictionInput = new PredictionModel(req.body);
        const validation = predictionFood.validate();
        const payload = prediction.toPayload();

        if (!validation.isValid){
            return res.status(400).json({
                success: false,
                message: validation.message
        })};

        const aiResponse = await axios.post(
            `${process.env.AI_SERVICE_URL}/predict`,
            payload
        );

        return res.status(200).json({
            success: true,
            message: "Prediksi telah dilaksanakan",
            input: payload,
            result: aiResponse.data,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Gagal Prediksi",
            error: error.message,
        });
    }
}

module.exports = {
    predictionFood,
};