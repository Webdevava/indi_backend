const mongoose = require("mongoose");

const logoSchema = new mongoose.Schema({
  device_id: { type: Number },
 Channel_ID: { type: String, required: true },
  accuracy: { type: Number },
  ts: { type: Number },
});

module.exports = mongoose.model("Logo", logoSchema);


