const express = require("express");
const Logo = require("../models/logo"); // Ensure you require the Logo model
const Fingerprint = require("../models/fingerprint"); 
const Config = require("../models/configModel")
const router = express.Router();
const Device = require("../models/deviceData"); // Adjust the path as necessary

// Global search endpoint
router.get("/all", async (req, res) => {
  try {
    const {
      deviceIdMin,
      deviceIdMax,
      deviceId,
      lat,
      lon,
      networkLatchIpUp,
      meterInstallationHhid,
      locationInstalling,
      networkLatchSim,
      meterInstallationSuccess,
      configurationHardwareVersion,
    } = req.query;

    let query = {};

    if (deviceId) {
      query["DEVICE_ID"] = deviceId;
    } else {
      if (deviceIdMin && deviceIdMax) {
        query["DEVICE_ID"] = {
          $gte: Number(deviceIdMin),
          $lte: Number(deviceIdMax),
        };
      }
    }

    if (lat && lon) {
      query["LOCATION.Cell_Info.lat"] = Number(lat);
      query["LOCATION.Cell_Info.lon"] = Number(lon);
    }

    if (networkLatchIpUp !== undefined) {
      query["NETWORK_LATCH.Ip_up"] = networkLatchIpUp === "true";
    }

    if (meterInstallationHhid) {
      query["METER_INSTALLATION.HHID"] = meterInstallationHhid;
    }

    if (locationInstalling !== undefined) {
      query["LOCATION.Installing"] = locationInstalling === "true";
    }

    if (networkLatchSim) {
      query["NETWORK_LATCH.Sim"] = networkLatchSim;
    }

    if (meterInstallationSuccess !== undefined) {
      query["METER_INSTALLATION.Success"] = meterInstallationSuccess === "true";
    }

    if (configurationHardwareVersion) {
      query["CONFIGURATION.hardware_version"] = configurationHardwareVersion;
    }

    const devices = await Device.find(query);

    // Get all device IDs to fetch corresponding logos and fingerprints
    const deviceIds = devices.map((device) => device.DEVICE_ID);

    // Fetch corresponding logos and fingerprints
    const logos = await Logo.find({ device_id: { $in: deviceIds } });
    const fingerprints = await Fingerprint.find({
      device_id: { $in: deviceIds },
    });

    const results = devices.map((device) => {
      const deviceLogos = logos.filter(
        (logo) => logo.device_id === device.DEVICE_ID
      );
      const deviceFingerprints = fingerprints.filter(
        (fp) => fp.device_id === device.DEVICE_ID
      );

      return {
        DEVICE_ID: device.DEVICE_ID,
        "LOCATION.Cell_Info.lat": device.LOCATION?.Cell_Info?.lat,
        "LOCATION.Cell_Info.lon": device.LOCATION?.Cell_Info?.lon,
        "METER_INSTALLATION.HHID": device.METER_INSTALLATION?.HHID,
        "METER_INSTALLATION.Success": device.METER_INSTALLATION?.Success,
        "NETWORK_LATCH.Ip_up": device.NETWORK_LATCH?.Ip_up,
        "ALIVE.state": device.ALIVE?.state,
        "CONFIGURATION.software_version":
          device.CONFIGURATION?.software_version,
        "CONFIGURATION.hardware_version":
          device.CONFIGURATION?.hardware_version,
        "NETWORK_LATCH.Sim": device.NETWORK_LATCH?.Sim,
        "LOCATION.Installing": device.LOCATION?.Installing,
        "LOCATION.region": device.LOCATION?.region,
        "TAMPER_ALARM.AlertType": device.TAMPER_ALARM?.AlertType,
        "TAMPER_ALARM.type": device.TAMPER_ALARM?.Type,
        "SOS_ALARM.AlertType": device.SOS_ALARM?.AlertType,
        "SOS_ALARM.type": device.SOS_ALARM?.Type,
        "BATTERY_ALARM.AlertType": device.BATTERY_ALARM?.AlertType,
        "BATTERY_ALARM.type": device.BATTERY_ALARM?.Type,
        "SIM_ALERT.AlertType": device.SIM_ALERT?.AlertType,
        "SIM_ALERT.type": device.SIM_ALERT?.Type,
        "SYSTEM_ALARM.AlertType": device.SYSTEM_ALARM?.AlertType,
        "SYSTEM_ALARM.type": device.SYSTEM_ALARM?.Type,
        "CONFIG_UPDATE.value": device.CONFIG_UPDATE?.value,
        "CONFIG_UPDATE.old_value": device.CONFIG_UPDATE?.old_value,
        "METER_OTA.previous": device.METER_OTA?.previous,
        "METER_OTA.update": device.METER_OTA?.update,
        "METER_OTA.success": device.METER_OTA?.success,
        logos: deviceLogos, // Include logos for this device
        fingerprints: deviceFingerprints, // Include fingerprints for this device
      };
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const {
      deviceIdMin,
      deviceIdMax,
      deviceId,
      lat,
      lon,
      networkLatchIpUp,
      meterInstallationHhid,
      locationInstalling,
      networkLatchSim,
      meterInstallationSuccess,
      configurationHardwareVersion,
    } = req.query;

    let query = {};

    if (deviceId) {
      query["DEVICE_ID"] = deviceId;
    } else {
      if (deviceIdMin && deviceIdMax) {
        query["DEVICE_ID"] = {
          $gte: Number(deviceIdMin),
          $lte: Number(deviceIdMax),
        };
      }
    }

    if (lat && lon) {
      query["LOCATION.Cell_Info.lat"] = Number(lat);
      query["LOCATION.Cell_Info.lon"] = Number(lon);
    }

    if (networkLatchIpUp !== undefined) {
      query["NETWORK_LATCH.Ip_up"] = networkLatchIpUp === "true";
    }

    if (meterInstallationHhid) {
      query["METER_INSTALLATION.HHID"] = meterInstallationHhid;
    }

    if (locationInstalling !== undefined) {
      query["LOCATION.Installing"] = locationInstalling === "true";
    }

    if (networkLatchSim) {
      query["NETWORK_LATCH.Sim"] = networkLatchSim;
    }

    if (meterInstallationSuccess !== undefined) {
      query["METER_INSTALLATION.Success"] = meterInstallationSuccess === "true";
    }

    if (configurationHardwareVersion) {
      query["CONFIGURATION.hardware_version"] = configurationHardwareVersion;
    }

    const latestDevice = await Device.findOne(query).sort({ timestamp: -1 });

    if (!latestDevice) {
      return res
        .status(404)
        .json({ message: "No device found matching the criteria." });
    }

    // Fetch corresponding logos and fingerprints for the latest device
    const deviceLogos = await Logo.find({ device_id: latestDevice.DEVICE_ID });
    const deviceFingerprints = await Fingerprint.find({
      device_id: latestDevice.DEVICE_ID,
    });

    const result = {
      DEVICE_ID: latestDevice.DEVICE_ID,
      "LOCATION.Cell_Info.lat": latestDevice.LOCATION?.Cell_Info?.lat,
      "LOCATION.Cell_Info.lon": latestDevice.LOCATION?.Cell_Info?.lon,
      "METER_INSTALLATION.HHID": latestDevice.METER_INSTALLATION?.HHID,
      "METER_INSTALLATION.Success": latestDevice.METER_INSTALLATION?.Success,
      "NETWORK_LATCH.Ip_up": latestDevice.NETWORK_LATCH?.Ip_up,
      "ALIVE.state": latestDevice.ALIVE?.state,
      "CONFIGURATION.software_version":
        latestDevice.CONFIGURATION?.software_version,
      "CONFIGURATION.hardware_version":
        latestDevice.CONFIGURATION?.hardware_version,
      "NETWORK_LATCH.Sim": latestDevice.NETWORK_LATCH?.Sim,
      "LOCATION.Installing": latestDevice.LOCATION?.Installing,
      "LOCATION.region": latestDevice.LOCATION?.region,
      "TAMPER_ALARM.AlertType": latestDevice.TAMPER_ALARM?.AlertType,
      "TAMPER_ALARM.type": latestDevice.TAMPER_ALARM?.Type,
      "SOS_ALARM.AlertType": latestDevice.SOS_ALARM?.AlertType,
      "SOS_ALARM.type": latestDevice.SOS_ALARM?.Type,
      "BATTERY_ALARM.AlertType": latestDevice.BATTERY_ALARM?.AlertType,
      "BATTERY_ALARM.type": latestDevice.BATTERY_ALARM?.Type,
      "SIM_ALERT.AlertType": latestDevice.SIM_ALERT?.AlertType,
      "SIM_ALERT.type": latestDevice.SIM_ALERT?.Type,
      "SYSTEM_ALARM.AlertType": latestDevice.SYSTEM_ALARM?.AlertType,
      "SYSTEM_ALARM.type": latestDevice.SYSTEM_ALARM?.Type,
      "CONFIG_UPDATE.value": latestDevice.CONFIG_UPDATE?.value,
      "CONFIG_UPDATE.old_value": latestDevice.CONFIG_UPDATE?.old_value,
      "METER_OTA.previous": latestDevice.METER_OTA?.previous,
      "METER_OTA.update": latestDevice.METER_OTA?.update,
      "METER_OTA.success": latestDevice.METER_OTA?.success,
      logos: deviceLogos, // Include logos for this device
      fingerprints: deviceFingerprints, // Include fingerprints for this device
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});


router.get("/alerts", async (req, res) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId) {
      return res.status(400).json({ error: "deviceId is required" });
    }

    // Fetch the device data
    const device = await Device.findOne({ DEVICE_ID: deviceId });

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    // Extract alert information
    const alerts = {
      TAMPER_ALARM: {
        type: device.TAMPER_ALARM?.Type,
        AlertType: device.TAMPER_ALARM?.AlertType,
      },
      SOS_ALARM: {
        type: device.SOS_ALARM?.Type,
        AlertType: device.SOS_ALARM?.AlertType,
      },
      BATTERY_ALARM: {
        type: device.BATTERY_ALARM?.Type,
        AlertType: device.BATTERY_ALARM?.AlertType,
      },
      SIM_ALERT: {
        type: device.SIM_ALERT?.Type,
        AlertType: device.SIM_ALERT?.AlertType,
      },
      SYSTEM_ALARM: {
        type: device.SYSTEM_ALARM?.Type,
        AlertType: device.SYSTEM_ALARM?.AlertType,
      },
    };

    // Send the response
    res.json(alerts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching alerts." });
  }
});

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
    const devices = await Device.find({});
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get("/devices/alert", async (req, res) => {
  try {
    const { alertType } = req.query;

    if (!alertType) {
      return res.status(400).json({ error: "AlertType is required." });
    }

    // Build the query object
    const query = {
      "TAMPER_ALARM.AlertType": alertType,
    };

    // Fetch the data
    const devices = await Device.find(query, {
      DEVICE_ID: 1,
      "TAMPER_ALARM.Type": 1,
      "TAMPER_ALARM.AlertType": 1,
      _id: 0, // Exclude the MongoDB document ID from the results
    });

    // Send the response
    res.json(devices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

// API to get all devices by alert types
router.get("/devices/alerts", async (req, res) => {
  try {
    // Build the query object to find devices that have any of the alert types
    const query = {
      $or: [
        { "TAMPER_ALARM.AlertType": { $exists: true } },
        { "SOS_ALARM.AlertType": { $exists: true } },
        { "BATTERY_ALARM.AlertType": { $exists: true } },
        { "SIM_ALERT.AlertType": { $exists: true } },
        { "SYSTEM_ALARM.AlertType": { $exists: true } },
      ],
    };

    // Fetch the data
    const devices = await Device.find(query, {
      DEVICE_ID: 1,
      "TAMPER_ALARM.Type": 1,
      "TAMPER_ALARM.AlertType": 1,
      "SOS_ALARM.Type": 1,
      "SOS_ALARM.AlertType": 1,
      "BATTERY_ALARM.Type": 1,
      "BATTERY_ALARM.AlertType": 1,
      "SIM_ALERT.Type": 1,
      "SIM_ALERT.AlertType": 1,
      "SYSTEM_ALARM.Type": 1,
      "SYSTEM_ALARM.AlertType": 1,
      _id: 0, // Exclude the MongoDB document ID from the results
    });

    // Send the response
    res.json(devices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});


router.get("/config/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Step 1: Fetch the latest record for the specified device
    const latestDevice = await Device.findOne({ DEVICE_ID: deviceId }).sort({
      ts: -1,
    });

    if (!latestDevice) {
      return res.status(404).json({ message: "Device not found." });
    }

    // Step 2: Get the configuration data for the specified device
    const configuration = await Config.findOne({ deviceId });

    // Step 3: Combine device data with configuration data
    const result = {
      DEVICE_ID: latestDevice.DEVICE_ID,
      "METER_INSTALLATION.HHID": latestDevice.METER_INSTALLATION?.HHID,
      "NETWORK_LATCH.Ip_up": latestDevice.NETWORK_LATCH?.Ip_up,
      CONFIG: configuration ? configuration.config : null, // Add config data if available
      TIMESTAMP: latestDevice.ts, // Add timestamp to result
    };

    res.json(result);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data." });
  }
});



module.exports = router;
