const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");

const databaseRoutes = require("./routes/databaseRoutes");
const foodSurplusRoutes = require("./routes/foodSurplusRoutes");
const userRoutes = require("./routes/userRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const predictionRoutes = require("./routes/predictionRoutes");


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("RESTful API FoodRescue berjalan dan terhubung ke MongoDB Atlas");
});

app.use("/api", databaseRoutes);
app.use("/api/food-surplus", foodSurplusRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/ai", predictionRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
};

startServer();