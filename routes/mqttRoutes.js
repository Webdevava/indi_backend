const express = require("express");
const mqttController = require("../controllers/mqttController");
const router = express.Router();

router.post("/publish", mqttController.publishMessage);

module.exports = router;
