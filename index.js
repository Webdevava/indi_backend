require("dotenv").config();
const cors = require("cors"); // Import cors
const express = require("express");
const mongoose = require("mongoose");
// const graphRoutes = require("./routes/graphRoutes");
const mqttRoutes = require("./routes/mqttRoutes");
const authRoutes = require("./routes/authRoutes");
const searchRoutes = require("./routes/searchRoutes");
const mqttService = require("./services/mqttService");

const app = express();

mongoose.connect(process.env.MONGODB_URI);


app.use(
  cors({
    origin: "*", // You can specify a specific origin instead of "*", e.g., "http://localhost:3000"
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use("/mqtt", mqttRoutes);
app.use("/auth", authRoutes);
app.use("/search", searchRoutes);
// app.use("/graph", graphRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await mqttService.initMQTT();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
