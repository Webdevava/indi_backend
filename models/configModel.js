const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  deviceId: { type: Number },
  topic: { type: String },
  config: { type: String },
  ts: { type: Date, default: Date.now },
});

const Config = mongoose.model("Config", configSchema);
module.exports = Config;
