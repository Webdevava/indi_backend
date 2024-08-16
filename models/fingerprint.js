const mongoose = require("mongoose");

const fingerprintSchema = new mongoose.Schema({
  device_id: { type: Number },
  channel_id: { type: String, required: true },
  timestamp: { type: Number },
});

module.exports = mongoose.model("Fingerprint", fingerprintSchema);
