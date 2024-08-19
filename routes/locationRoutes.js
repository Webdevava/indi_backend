const express = require("express");
const router = express.Router();
const Device = require("../models/deviceData"); // Adjust path if needed

// Helper function to find devices with ID starting with a specific prefix
const findDevicesByHardwareVersion = async (hardwareVersion) => {
  return Device.find(
    {
      "CONFIGURATION.hardware_version": hardwareVersion,
      "LOCATION.Cell_Info": { $exists: true }, // Ensure LOCATION.Cell_Info field exists
    },
    {
      DEVICE_ID: 1,
      "CONFIGURATION.hardware_version": 1, // Include hardware_version in the result
      "LOCATION.Cell_Info.lat": 1,
      "LOCATION.Cell_Info.lon": 1,
    }
  ).lean(); // Use lean to get plain JavaScript objects
};

// Get locations for devices with a specific hardware version
router.get("/locations/hardware_version/:version", async (req, res) => {
  try {
    const { version } = req.params;
    const devices = await findDevicesByHardwareVersion(version);
    // Transform data to include DEVICE_ID, hardware_version, lat, lon
    const locations = devices.map((device) => ({
      DEVICE_ID: device.DEVICE_ID,
      hardware_version: device.CONFIGURATION.hardware_version, // Include hardware_version
      lat: device.LOCATION.Cell_Info.lat,
      lon: device.LOCATION.Cell_Info.lon,
    }));
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all locations
router.get("/locations", async (req, res) => {
  try {
    const devices = await Device.find(
      { "LOCATION.Cell_Info": { $exists: true } },
      {
        DEVICE_ID: 1,
        "CONFIGURATION.hardware_version": 1, // Include hardware_version in the result
        "LOCATION.Cell_Info.lat": 1,
        "LOCATION.Cell_Info.lon": 1,
      }
    ).lean(); // Use lean to get plain JavaScript objects
    // Transform data to include DEVICE_ID, hardware_version, lat, lon
    const locations = devices.map((device) => ({
      DEVICE_ID: device.DEVICE_ID,
      hardware_version: device.CONFIGURATION.hardware_version, // Include hardware_version
      lat: device.LOCATION.Cell_Info.lat,
      lon: device.LOCATION.Cell_Info.lon,
    }));
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
