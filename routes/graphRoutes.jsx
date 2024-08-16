const express = require("express");
const router = express.Router();
const Device = require("../models/deviceData"); // Adjust the path as necessary

// Helper function to count devices with specific conditions
const countDevices = async (query) => {
  try {
    const count = await Device.countDocuments(query);
    return count;
  } catch (error) {
    console.error(error);
    throw new Error("Error counting devices");
  }
};

// Total number of devices by Hardware Version
router.get("/total-devices/:hardwareVersion", async (req, res) => {
  try {
    const { hardwareVersion } = req.params;
    const count = await countDevices({
      "CONFIGURATION.hardware_version": hardwareVersion,
    });
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Total number of devices by Hardware Version and Location Installing
router.get(
  "/total-devices/:hardwareVersion/location-installing",
  async (req, res) => {
    try {
      const { hardwareVersion } = req.params;
      const count = await countDevices({
        "CONFIGURATION.hardware_version": hardwareVersion,
        "LOCATION.Installing": true,
      });
      res.json({ total: count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Total number of devices by Hardware Version and Network Latch IP Up
router.get(
  "/total-devices/:hardwareVersion/network-latch-ip-up",
  async (req, res) => {
    try {
      const { hardwareVersion } = req.params;
      const count = await countDevices({
        "CONFIGURATION.hardware_version": hardwareVersion,
        "NETWORK_LATCH.Ip_up": true,
      });
      res.json({ total: count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Total number of devices by Hardware Version and Installation Success
router.get(
  "/total-devices/:hardwareVersion/installation-success",
  async (req, res) => {
    try {
      const { hardwareVersion } = req.params;
      const count = await countDevices({
        "CONFIGURATION.hardware_version": hardwareVersion,
        "METER_INSTALLATION.Success": true,
      });
      res.json({ total: count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Total number of devices by Hardware Version and Audience Session Close TV On
router.get(
  "/total-devices/:hardwareVersion/audience-session-close-tv-on",
  async (req, res) => {
    try {
      const { hardwareVersion } = req.params;
      const count = await countDevices({
        "CONFIGURATION.hardware_version": hardwareVersion,
        "AUDIENCE_SESSION_CLOSE.tv_on": true,
      });
      res.json({ total: count });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Total number of all devices
router.get("/total-devices/all", async (req, res) => {
  try {
    const count = await countDevices({});
    res.json({ total: count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
