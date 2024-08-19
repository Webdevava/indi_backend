const express = require("express");
const mongoose = require("mongoose");
const Logo = require("../models/logo"); // Ensure you require the Logo model
const Fingerprint = require("../models/fingerprint");
const Config = require("../models/configModel");
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
      online,
      hhid,
      locationInstalling,
      sim,
      installation,
      hw,
    } = req.query;

    let query = {};

    // Build the query based on the provided parameters
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

    if (online !== undefined) {
      query["NETWORK_LATCH.Ip_up"] = online === "true";
    }

    if (hhid) {
      query["METER_INSTALLATION.HHID"] = hhid;
    }

    if (locationInstalling !== undefined) {
      query["LOCATION.Installing"] = locationInstalling === "true";
    }

    if (sim) {
      query["NETWORK_LATCH.Sim"] = sim;
    }

    if (installation !== undefined) {
      query["METER_INSTALLATION.Success"] = installation === "true";
    }

    if (hw) {
      query["CONFIGURATION.hardware_version"] = hw;
    }

    // Fetch all devices based on the query
    const devices =
      Object.keys(query).length === 0
        ? await Device.find()
        : await Device.find(query);

    // Get all device IDs to fetch corresponding data
    const deviceIds = devices.map((device) => device.DEVICE_ID);

    // Access MongoDB database directly for other collections
    const db = mongoose.connection.db;

    // Fetch the latest 10 logos and last 10 accuracies for each device
    const logoResults = await db
      .collection("Logo")
      .find({ device_id: { $in: deviceIds } })
      .sort({ ts: -1 }) // Sort by timestamp descending
      .toArray();

    const accuracyResults = await db
      .collection("Accuracy")
      .find({ deviceId: { $in: deviceIds } })
      .sort({ Timestamp: -1 }) // Sort by timestamp descending
      .toArray();

    // Fetch temperature data from the devicedatas collection
    const temperatureResults = await db
      .collection("devicedatas")
      .find({ DEVICE_ID: { $in: deviceIds } })
      .toArray();

    // Create a map of channel names to images
    const logoImageMap = {};
    const logoImages = await db
      .collection("logo-images")
      .find({ channel_id: { $in: logoResults.map((logo) => logo.Channel_ID) } })
      .toArray();

    logoImages.forEach((item) => {
      logoImageMap[item.channel_name] = item.images;
    });

    // Create a map of device IDs to their latest temperature stats
    const temperatureMap = temperatureResults.reduce((map, temp) => {
      if (temp.TEMPERATURE_STATS) {
        map[temp.DEVICE_ID] = temp.TEMPERATURE_STATS.battery_temp;
      }
      return map;
    }, {});

    // Combine devices with the latest 10 logos, last 10 accuracies, and temperature stats
    const results = devices.map((device) => {
      const deviceLogoResults = logoResults
        .filter((logo) => logo.device_id === device.DEVICE_ID)
        .slice(0, 10); // Get latest 10 logos

      const deviceAccuracyResults = accuracyResults
        .filter((accuracy) => accuracy.deviceId === device.DEVICE_ID)
        .slice(0, 10); // Get last 10 accuracies

      return {
        DEVICE_ID: device.DEVICE_ID,
        lat: device.LOCATION?.Cell_Info?.lat,
        lon: device.LOCATION?.Cell_Info?.lon,
        hhid: device.METER_INSTALLATION?.HHID,
        meterSuccess: device.METER_INSTALLATION?.Success,
        connectivity_status: device.NETWORK_LATCH?.Ip_up,
        sim: device.NETWORK_LATCH?.Sim,
        installing: device.LOCATION?.Installing,
        hardwareVersion: device.CONFIGURATION?.hardware_version,
        temp: temperatureMap[device.DEVICE_ID] || null, // Add battery temperature
        logos: deviceLogoResults.map((logo) => ({
          timestamp: logo.ts,
          channel_id: logo.Channel_ID,
          accuracy: logo.accuracy,
          images: logoImageMap[logo.channel_name] || [],
        })),
        accuracies: deviceAccuracyResults.map((accuracy) => ({
          audio_logo: accuracy.AFPResult,
          logo_logo: accuracy.LogoResult,
          priority: accuracy.Priority,
          ts: accuracy.Timestamp,
        })),
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
      online,
      hhid,
      locationInstalling,
      sim,
      installation,
      hw,
    } = req.query;

    let matchQuery = {};

    // Build the match query based on provided parameters
    if (deviceId) {
      matchQuery["DEVICE_ID"] = Number(deviceId);
    } else if (deviceIdMin && deviceIdMax) {
      matchQuery["DEVICE_ID"] = {
        $gte: Number(deviceIdMin),
        $lte: Number(deviceIdMax),
      };
    }

    if (lat && lon) {
      matchQuery["LOCATION.Cell_Info.lat"] = Number(lat);
      matchQuery["LOCATION.Cell_Info.lon"] = Number(lon);
    }

    if (online !== undefined) {
      matchQuery["NETWORK_LATCH.Ip_up"] = online === "true";
    }

    if (hhid) {
      matchQuery["METER_INSTALLATION.HHID"] = hhid;
    }

    if (locationInstalling !== undefined) {
      matchQuery["LOCATION.Installing"] = locationInstalling === "true";
    }

    if (sim) {
      matchQuery["NETWORK_LATCH.Sim"] = sim;
    }

    if (installation !== undefined) {
      matchQuery["METER_INSTALLATION.Success"] = installation === "true";
    }

    if (hw) {
      matchQuery["CONFIGURATION.hardware_version"] = hw;
    }

    // Fetch the latest document for each DEVICE_ID matching the criteria
    const latestDevices = await Device.aggregate([
      { $match: matchQuery }, // Match the query criteria
      { $sort: { ts: -1 } }, // Sort by timestamp in descending order (assuming 'ts' is your timestamp field)
      {
        $group: {
          _id: "$DEVICE_ID", // Group by DEVICE_ID
          latestRecord: { $first: "$$ROOT" }, // Get the first (latest) record per group
        },
      },
      {
        $lookup: {
          from: "AFPResult",
          localField: "latestRecord.DEVICE_ID",
          foreignField: "device_id", // Ensure this matches the field in AFPResult collection
          as: "AFPResult",
          pipeline: [
            { $sort: { time: -1 } }, // Sort by time in descending order
            { $limit: 1 }, // Get the latest entry
          ],
        },
      },
      {
        $lookup: {
          from: "logos",
          localField: "latestRecord.DEVICE_ID",
          foreignField: "device_id", // Ensure this matches the field in logos collection
          as: "LogoResult",
          pipeline: [
            { $sort: { ts: -1 } }, // Sort by ts (timestamp) in descending order
            { $limit: 1 }, // Get the latest entry
          ],
        },
      },
      {
        $lookup: {
          from: "Accuracy",
          localField: "latestRecord.DEVICE_ID",
          foreignField: "deviceId", // Ensure this matches the field in Accuracy collection
          as: "Accuracy",
          pipeline: [
            { $sort: { Timestamp: -1 } }, // Sort by Timestamp in descending order
            { $limit: 1 }, // Get the single latest entry per device
          ],
        },
      },
      {
        $lookup: {
          from: "logo-images",
          let: {
            logoChannelName: { $arrayElemAt: ["$Accuracy.Channel_ID", 0] }, // Get Channel_ID from Accuracy
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$channel_name", "$$logoChannelName"] }, // Match Channel_ID from Accuracy
              },
            },
            { $project: { _id: 0, images: 1 } },
          ],
          as: "Images",
        },
      },
      {
        $addFields: {
          "latestRecord.AFPResult": { $arrayElemAt: ["$AFPResult", 0] }, // Get the latest AFPResult
          "latestRecord.LogoResult": { $arrayElemAt: ["$LogoResult", 0] }, // Get the latest LogoResult
          "latestRecord.Accuracy": { $arrayElemAt: ["$Accuracy", 0] }, // Get the latest unique Accuracy entry
          "latestRecord.Images": { $arrayElemAt: ["$Images", 0] }, // Get the latest logo-images
        },
      },
      {
        $replaceRoot: { newRoot: "$latestRecord" }, // Replace root with latest document
      },
      {
        $project: {
          _id: 0,
          DEVICE_ID: 1,
          region: "$LOCATION.Cell_Info.region",
          lat: "$LOCATION.Cell_Info.lat",
          lon: "$LOCATION.Cell_Info.lon",
          hhid: "$METER_INSTALLATION.HHID",
          meterSuccess: "$METER_INSTALLATION.Success",
          connectivity_status: "$NETWORK_LATCH.Ip_up",
          aliveState: "$ALIVE.state",
          softwareVersion: "$CONFIGURATION.software_version",
          hardwareVersion: "$CONFIGURATION.hardware_version",
          sim: "$NETWORK_LATCH.Sim",
          installing: "$LOCATION.Installing",
          tamperAlarmAlertType: "$TAMPER_ALARM.AlertType",
          tamperAlarmType: "$TAMPER_ALARM.Type",
          sosAlarmAlertType: "$SOS_ALARM.AlertType",
          sosAlarmType: "$SOS_ALARM.Type",
          batteryAlarmAlertType: "$BATTERY_ALARM.AlertType",
          batteryAlarmType: "$BATTERY_ALARM.Type",
          simAlertAlertType: "$SIM_ALERT.AlertType",
          simAlertType: "$SIM_ALERT.Type",
          systemAlarmAlertType: "$SYSTEM_ALARM.AlertType",
          systemAlarmType: "$SYSTEM_ALARM.Type",
          configUpdateValue: "$CONFIG_UPDATE.value",
          configUpdateOldValue: "$CONFIG_UPDATE.old_value",
          meterOtaPrevious: "$METER_OTA.previous",
          meterOtaUpdate: "$METER_OTA.update",
          meterOtaSuccess: "$METER_OTA.success",
          afpResult: {
            channelId: "$AFPResult.Channel_ID",
            time: "$AFPResult.time",
          },
          logoResult: {
            channelName: "$LogoResult.Channel_ID",
            accuracy: "$LogoResult.accuracy",
            ts: "$LogoResult.ts",
          },
          accuracyResult: {
            audio_logo: "$Accuracy.AFPResult",
            logo_logo: "$Accuracy.LogoResult",
            priority: "$Accuracy.Priority",
            ts: "$Accuracy.Timestamp",
            channelId: "$Accuracy.Channel_ID", // Include Channel_ID
            accuracyTimestamp: "$Accuracy.Timestamp", // Include Timestamp
          },
          images: "$Images.images", // Include images array
        },
      },
    ]);

    if (latestDevices.length === 0) {
      return res
        .status(404)
        .json({ message: "No devices found matching the criteria." });
    }

    res.json(latestDevices);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});


router.get("/live", async (req, res) => {
  try {
    const {
      deviceId,
      lat,
      lon,
      online,
      hhid,
      locationInstalling,
      sim,
      installation,
      hw,
    } = req.query;

    let matchQuery = {};

    // Build the match query based on provided parameters
    if (deviceId) {
      matchQuery["DEVICE_ID"] = Number(deviceId);
    }

    if (lat && lon) {
      matchQuery["LOCATION.Cell_Info.lat"] = Number(lat);
      matchQuery["LOCATION.Cell_Info.lon"] = Number(lon);
    }

    if (online !== undefined) {
      matchQuery["NETWORK_LATCH.Ip_up"] = online === "true";
    }

    if (hhid) {
      matchQuery["METER_INSTALLATION.HHID"] = hhid;
    }

    if (locationInstalling !== undefined) {
      matchQuery["LOCATION.Installing"] = locationInstalling === "true";
    }

    if (sim) {
      matchQuery["NETWORK_LATCH.Sim"] = sim;
    }

    if (installation !== undefined) {
      matchQuery["METER_INSTALLATION.Success"] = installation === "true";
    }

    if (hw) {
      matchQuery["CONFIGURATION.hardware_version"] = hw;
    }

    // Fetch all documents matching the criteria
    const deviceData = await Device.aggregate([
      { $match: matchQuery }, // Match the query criteria

      { $limit: 1 }, // Limit to a single device

      {
        $lookup: {
          from: "AFPResult",
          localField: "DEVICE_ID",
          foreignField: "device_id",
          as: "AFPResults",
          pipeline: [
            { $sort: { time: -1 } }, // Sort AFPResult by time in descending order
            { $limit: 10 }, // Limit to the latest 10 results
          ],
        },
      },
      {
        $lookup: {
          from: "logos",
          localField: "DEVICE_ID",
          foreignField: "device_id",
          as: "LogoResults",
          pipeline: [
            { $sort: { ts: -1 } }, // Sort LogoResult by ts (timestamp) in descending order
            { $limit: 10 }, // Limit to the latest 10 results
          ],
        },
      },
      {
        $lookup: {
          from: "Accuracy",
          localField: "DEVICE_ID",
          foreignField: "deviceId",
          as: "AccuracyResults",
          pipeline: [
            { $sort: { Timestamp: -1 } }, // Sort Accuracy by Timestamp in descending order
            { $limit: 1 }, // Limit to the latest result
          ],
        },
      },
      {
        $lookup: {
          from: "logo-images",
          let: {
            accuracyChannelId: {
              $arrayElemAt: ["$AccuracyResults.Channel_ID", 0], // Extract the Channel_ID from Accuracy
            },
          },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$channel_name", "$$accuracyChannelId"] },
              },
            },
            { $project: { _id: 0, images: 1 } },
          ],
          as: "Images",
        },
      },
      {
        $addFields: {
          AFPResults: { $ifNull: ["$AFPResults", []] },
          LogoResults: { $ifNull: ["$LogoResults", []] },
          AccuracyResults: { $ifNull: ["$AccuracyResults", []] },
          Images: { $ifNull: ["$Images", []] },
        },
      },
      {
        $project: {
          _id: 0,
          DEVICE_ID: 1,
          region: "$LOCATION.Cell_Info.region",
          lat: "$LOCATION.Cell_Info.lat",
          lon: "$LOCATION.Cell_Info.lon",
          hhid: "$METER_INSTALLATION.HHID",
          meterSuccess: "$METER_INSTALLATION.Success",
          connectivity_status: "$NETWORK_LATCH.Ip_up",
          aliveState: "$ALIVE.state",
          softwareVersion: "$CONFIGURATION.software_version",
          hardwareVersion: "$CONFIGURATION.hardware_version",
          sim: "$NETWORK_LATCH.Sim",
          installing: "$LOCATION.Installing",
          tamperAlarmAlertType: "$TAMPER_ALARM.AlertType",
          tamperAlarmType: "$TAMPER_ALARM.Type",
          sosAlarmAlertType: "$SOS_ALARM.AlertType",
          sosAlarmType: "$SOS_ALARM.Type",
          batteryAlarmAlertType: "$BATTERY_ALARM.AlertType",
          batteryAlarmType: "$BATTERY_ALARM.Type",
          simAlertAlertType: "$SIM_ALERT.AlertType",
          simAlertType: "$SIM_ALERT.Type",
          systemAlarmAlertType: "$SYSTEM_ALARM.AlertType",
          systemAlarmType: "$SYSTEM_ALARM.Type",
          configUpdateValue: "$CONFIG_UPDATE.value",
          configUpdateOldValue: "$CONFIG_UPDATE.old_value",
          meterOtaPrevious: "$METER_OTA.previous",
          meterOtaUpdate: "$METER_OTA.update",
          meterOtaSuccess: "$METER_OTA.success",
          afpResults: "$AFPResults",
          logoResults: "$LogoResults",
          accuracyResults: "$AccuracyResults",
          images: "$Images.images",
        },
      },
    ]);

    if (deviceData.length === 0) {
      return res
        .status(404)
        .json({ message: "No device found matching the criteria." });
    }

    res.json(deviceData[0]); // Since we are limiting to 1 device, return the first element
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});




// router.get("/live", async (req, res) => {
//   try {
//     const {
//       deviceIdMin,
//       deviceIdMax,
//       deviceId,
//       lat,
//       lon,
//       online,
//       hhid,
//       locationInstalling,
//       sim,
//       installation,
//       hw,
//     } = req.query;

//     let matchQuery = {};

//     // Build the match query based on provided parameters
//     if (deviceId) {
//       matchQuery["DEVICE_ID"] = Number(deviceId);
//     } else if (deviceIdMin && deviceIdMax) {
//       matchQuery["DEVICE_ID"] = {
//         $gte: Number(deviceIdMin),
//         $lte: Number(deviceIdMax),
//       };
//     }

//     if (lat && lon) {
//       matchQuery["LOCATION.Cell_Info.lat"] = Number(lat);
//       matchQuery["LOCATION.Cell_Info.lon"] = Number(lon);
//     }

//     if (online !== undefined) {
//       matchQuery["NETWORK_LATCH.Ip_up"] = online === "true";
//     }

//     if (hhid) {
//       matchQuery["METER_INSTALLATION.HHID"] = hhid;
//     }

//     if (locationInstalling !== undefined) {
//       matchQuery["LOCATION.Installing"] = locationInstalling === "true";
//     }

//     if (sim) {
//       matchQuery["NETWORK_LATCH.Sim"] = sim;
//     }

//     if (installation !== undefined) {
//       matchQuery["METER_INSTALLATION.Success"] = installation === "true";
//     }

//     if (hw) {
//       matchQuery["CONFIGURATION.hardware_version"] = hw;
//     }

//     console.log("Match Query:", matchQuery); // Debugging

//     // Access the native MongoDB driver through Mongoose
//     const db = mongoose.connection.db;

//     // Fetch the last 10 logo accuracies based on the criteria
//     const latestLogoAccuracies = await db
//       .collection("Accuracy")
//       .aggregate([
//         { $match: matchQuery }, // Match the query criteria
//         { $sort: { Timestamp: -1 } }, // Sort by timestamp in descending order to get latest entries first
//         { $limit: 10 }, // Limit to the last 10 entries
//         {
//           $lookup: {
//             from: "logos",
//             localField: "LogoResult",
//             foreignField: "Channel_ID",
//             as: "LogoData",
//           },
//         },
//         {
//           $unwind: "$LogoData", // Unwind the LogoData array
//         },
//         {
//           $lookup: {
//             from: "AFPResult",
//             localField: "AFPResult",
//             foreignField: "Channel_ID",
//             as: "AFPData",
//           },
//         },
//         {
//           $unwind: "$AFPData", // Unwind the AFPData array
//         },
//         {
//           $project: {
//             _id: 0,
//             device_id: "$LogoData.device_id",
//             audio_logo: "$AFPData.Channel_ID", // Get audio logo channel ID from AFPResult
//             logo_logo: "$LogoData.Channel_ID", // Get logo channel ID from logos
//             priority: "$Priority",
//             ts: "$Timestamp",
//             logo_accuracy: "$LogoData.accuracy",
//             afp_time: "$AFPData.time", // Get time from AFPResult
//           },
//         },
//         { $sort: { ts: -1 } }, // Ensure the sorting is by timestamp in descending order in the final output
//       ])
//       .toArray(); // Convert aggregation cursor to an array

//     console.log("Latest Logo Accuracies:", latestLogoAccuracies); // Debugging

//     if (latestLogoAccuracies.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No logo accuracies found matching the criteria." });
//     }

//     res.json(latestLogoAccuracies);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     res.status(500).json({ error: "An error occurred while fetching data." });
//   }
// });


router.get("/alerts", async (req, res) => {
  try {
    const { deviceId, AlertType } = req.query;

    // Function to extract and filter alerts from a device
    const extractAlerts = (device) => {
      const alertTypes = [
        "TAMPER_ALARM",
        "SOS_ALARM",
        "BATTERY_ALARM",
        "SIM_ALERT",
        "SYSTEM_ALARM",
      ];

      return alertTypes
        .map((type) => {
          const alert = device[type];
          return (
            alert && {
              DEVICE_ID: device.DEVICE_ID,
              Type: alert.Type,
              AlertType: alert.AlertType,
              timestamp: alert.timestamp,
            }
          );
        })
        .filter(
          (alert) =>
            alert !== null && (!AlertType || alert.AlertType === AlertType)
        );
    };

    let alerts = [];

    if (deviceId) {
      // Fetch the specific device
      const device = await Device.findOne({ DEVICE_ID: deviceId });
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }

      // Extract and filter alerts for the specific device
      alerts = extractAlerts(device);
    } else {
      // Fetch all devices and extract alerts
      const devices = await Device.find();
      alerts = devices.flatMap(extractAlerts);
    }

    // Sort the alerts by timestamp
    const sortedAlerts = alerts.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Send the response as an array of alert objects
    res.json(sortedAlerts);
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

// GET /config - Fetch the latest data for all devices
router.get("/config", async (req, res) => {
  try {
    // Step 1: Fetch the latest records for all devices
    const latestDevices = await Device.aggregate([
      { $sort: { ts: -1 } },
      { $group: { _id: "$DEVICE_ID", latestRecord: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$latestRecord" } },
    ]).exec();

    console.log("Latest Devices:", latestDevices);

    // Step 2: Get the latest configuration data for each device
    const latestConfigurations = await Config.aggregate([
      { $sort: { ts: -1 } },
      { $group: { _id: "$deviceId", latestConfig: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$latestConfig" } },
    ]).exec();

    console.log("Latest Configurations:", latestConfigurations);

    // Step 3: Combine device data with configuration data
    const results = latestDevices.map((device) => {
      const config = latestConfigurations.find(
        (conf) => conf.deviceId === device.DEVICE_ID
      );

      return {
        DEVICE_ID: device.DEVICE_ID,
        hhid: device.METER_INSTALLATION?.HHID,
        hardware_version: device.CONFIGURATION?.hardware_version,
        online: device.NETWORK_LATCH?.Ip_up,
        CONFIG: config?.config,
        CONFIG_TS: config?.ts,
        TIMESTAMP: device.CONFIGURATION?.TS,
      };
    });

    res.json(results);
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data." });
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
      hhid: latestDevice.METER_INSTALLATION?.HHID,
      online: latestDevice.NETWORK_LATCH?.Ip_up,
      CONFIG: configuration ? configuration.config : "v1.0.2", // Default to "v1.0.2" if no config is found
      TIMESTAMP: latestDevice.ts,
    };

    res.json(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data." });
  }
});

module.exports = router;
