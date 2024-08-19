const mongoose = require("mongoose");

const fingerprintSchema = new mongoose.Schema({
  device_id: { type: Number },
  Channel_ID: { type: String, required: true },
  time: { type: Number },
});

module.exports = mongoose.model("AFPResult", fingerprintSchema);
