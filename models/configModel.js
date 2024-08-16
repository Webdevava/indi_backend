const mongoose = require("mongoose");

// Define the schema for storing configurations
const configSchema = new mongoose.Schema({
  deviceId: String,
  topic: String,
  config: String,
  ts: { type: Date, default: Date.now },
});

// Create and export the model
const Config = mongoose.model("Config", configSchema);
module.exports = Config;
