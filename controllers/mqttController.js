const mqttService = require("../services/mqttService");
const Config = require("../models/configModel"); // Import the Config model

exports.publishMessage = async (req, res) => {
  try {
    const { topic, message, deviceId } = req.body;

    // Publish the message to the MQTT topic
    await mqttService.publishMessage(topic, message);

    // Store the message, topic, and device ID in MongoDB
    const newConfig = new Config({
      deviceId,
      topic,
      config: message,
    });
    await newConfig.save();

    res
      .status(200)
      .json({ message: "Message published and stored successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
