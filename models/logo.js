const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema({
  device_id: { type: Number },
  channel_id: { type: String, required: true },
  confidence: { type: Number },
  timestamp: { type: Number },
});

module.exports = mongoose.model("Logo", logoSchema);
