// const connectDB = require("./src/config/mongoDB");
const deviceSchema = require("../models/deviceData");
// const deviceAlertsSchema = require("./src/models/alertsModel");
const { faker } = require("@faker-js/faker");

const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://ankurauti:ankurauti02@cluster0.ng3tq.mongodb.net/APM2?retryWrites=true&w=majority&appName=Cluster0");
    console.log("MongoDB connected");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
connectDB();

const APM1Ids = [
  100001, 100002, 100003, 100004, 100005, 100006, 100007, 100008, 100009,
  100010,
];

const APM2Ids = [
  200001, 200002, 200003, 200004, 200005, 200006, 200007, 200008, 200009,
  200010,
];
const APM3Ids = [
  300001, 300002, 300003, 300004, 300005, 300006, 300007, 300008, 300009,
  300010,
];

//   const randomAPM1id = APM1Ids[Math.floor(Math.random() * APM1Ids.length)];
//   const randomAPM2id = APM1Ids[Math.floor(Math.random() * APM2Ids.length)];
//   const randomAPM3id = APM1Ids[Math.floor(Math.random() * APM3Ids.length)];

// Function to randomly select one of the APM IDs
function getRandomDeviceId() {
  // Array of all device arrays
  const allIds = [APM1Ids, APM2Ids, APM3Ids];

  // Randomly select one of the ID arrays
  const randomIdsArray = allIds[Math.floor(Math.random() * allIds.length)];

  // Randomly select an ID from the chosen array
  const randomDeviceId =
    randomIdsArray[Math.floor(Math.random() * randomIdsArray.length)];

  return randomDeviceId;
}

const dominicanRepublicLocations = [
  { lat: 18.4861, lon: -69.9312 }, // Santo Domingo
  { lat: 19.7808, lon: -70.6871 }, // Santiago
  { lat: 18.4274, lon: -68.9728 }, // Punta Cana
  { lat: 19.0502, lon: -70.1496 }, // Puerto Plata
  { lat: 18.809, lon: -69.811 }, // La Romana
  { lat: 18.7357, lon: -70.1627 }, // San Pedro de Macorís
  { lat: 19.5513, lon: -71.0758 }, // Mao
  { lat: 19.217, lon: -69.336 }, // Nagua
  { lat: 19.6122, lon: -71.2186 }, // Monte Cristi
  { lat: 18.5885, lon: -68.4053 }, // Higüey
];

let lastDeviceId = 0;
let lastAlertId = 0;

function generateRandomData() {
  lastDeviceId++;

  const randomDominicanRepublicLocation =
    dominicanRepublicLocations[
      Math.floor(Math.random() * dominicanRepublicLocations.length)
    ];

  const alertTypes = ["Generated", "Pending", "Resolved"];
  const randomAlertType =
    alertTypes[Math.floor(Math.random() * alertTypes.length)];
  
    const HWversion = ["APM1", "APM2", "APM3"];
    const randomHWversion =
      HWversion[Math.floor(Math.random() * alertTypes.length)];

  return {
    DEVICE_ID: 100001,
    LOCATION: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 1,
      Cell_Info: {
        region:"India",
        lat: randomDominicanRepublicLocation.lat,
        lon: randomDominicanRepublicLocation.lon,
      },
      Installing: faker.datatype.boolean(),
    },
    GUEST_REGISTRATION: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 2,
      guest_id: faker.number.int({ min: 1, max: 6 }),
      registering: faker.datatype.boolean(),
      guest_age: faker.number.int({ min: 6, max: 80 }),
      guest_male: faker.datatype.boolean(),
    },
    MEMBER_GUEST_DECLARATION: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 3,
      member_keys: Array(12)
        .fill()
        .map(() => faker.datatype.boolean()),
      guests: Array(5)
        .fill()
        .map(() => faker.datatype.boolean()),
      confidence: 80,
    },
    CONFIGURATION: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 4,
      differential_mode: faker.datatype.boolean(),
      member_keys: Array(12)
        .fill()
        .map(() => faker.datatype.boolean()),
      guest_cancellation_time: 300,
      software_version: faker.system.semver(),
      hardware_version: randomHWversion,
      power_pcb_firmware_version: faker.system.semver(),
      remote_firmware_version: faker.system.semver(),
      audio_configuration: Array(5)
        .fill()
        .map(() => faker.datatype.boolean()),
      audience_day_start_time: 600,
      no_of_sessions: 8,
    },
    TAMPER_ALARM: {
      ID: lastDeviceId,
      AlertType: randomAlertType,
      Type: 5,
      TS: Date.now(),
      Meter_tamper: faker.datatype.boolean(),
      Tv_plug_tamper: faker.datatype.boolean(),
      Tamper_ts: Date.now(),
    },
    SOS_ALARM: {
      ID: lastDeviceId,
      AlertType: randomAlertType,
      Type: 6,
      TS: Date.now(),
      sos: faker.datatype.boolean(),
    },
    BATTERY_ALARM: {
      ID: lastDeviceId,
      AlertType: randomAlertType,
      Type: 7,
      TS: Date.now(),
      main_bat_fail: faker.datatype.boolean(),
      rtc_fail: faker.datatype.boolean(),
      rtc_bat_low: faker.datatype.boolean(),
    },
    METER_INSTALLATION: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 8,
      HHID: "APM32",
      Success: faker.datatype.boolean(),
    },
    VOLTAGE_STATS: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 9,
      high_rail_voltage: 3000,
      mid_rail_voltage: 1500,
      gsm_rail_voltage: 3300,
      rtc_battery_voltage: 3200,
      li_ion_battery_voltage: 3800,
      remote_battery_voltage: 2500,
    },
    TEMPERATURE_STATS: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 10,
      battery_temp: 25,
      arm_core_temp: 30,
      power_pcb_temp: 28,
      rtc_temp: 27,
    },
    NTP_SYNC: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 11,
      server: "time.google.com",
      system_time: Date.now(),
      success: faker.datatype.boolean(),
      error_code: 0,
      drift: 5,
      jumped: faker.datatype.boolean(),
    },
    AUDIENCE_SESSION_CLOSE: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 12,
      stop_time: 930,
      viewing_member_keys: Array(12)
        .fill()
        .map(() => faker.datatype.boolean()),
      viewing_guests: Array(5)
        .fill()
        .map(() => faker.datatype.boolean()),
      tv_on: faker.datatype.boolean(),
      last_watermark_id: 123,
      tv_event_ts: 456,
      last_watermark_id_ts: Date.now(),
      marked: 80,
    },
    NETWORK_LATCH: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 13,
      Ip_up: faker.datatype.boolean(),
      Sim: faker.number.int({ min: 1, max: 2 }),
    },
    REMOTE_PAIRING: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 14,
      remote_id: 123456789,
      success: faker.datatype.boolean(),
    },
    REMOTE_ACTIVITY: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 15,
      lock: faker.datatype.boolean(),
      orr: faker.datatype.boolean(),
      absent_key_press: faker.datatype.boolean(),
      drop: faker.datatype.boolean(),
    },
    SIM_ALERT: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 16,
      AlertType: randomAlertType,
      sim1_absent: faker.datatype.boolean(),
      sim1_changed: faker.datatype.boolean(),
      sim2_absent: faker.datatype.boolean(),
      sim2_changed: faker.datatype.boolean(),
    },
    SYSTEM_ALARM: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 17,
      name: "System Alarm",
      AlertType: randomAlertType,
      Details: {
        name: "System Error",
        error_code: faker.number.int({ min: 400, max: 599 }),
        message: faker.lorem.words({ min: 5, max: 10 }),
      },
    },
    SYSTEM_INFO: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 18,
      rpi_serial: faker.string.alphanumeric(10),
      pcb_serial: faker.string.alphanumeric(6),
      imei: faker.string.numeric(15),
      imsi_1: faker.string.numeric(15),
      imsi_2: faker.string.numeric(15),
      eeprom: faker.number.int(),
      wifi_serial: faker.string.alphanumeric(7),
      mac_serial: faker.string.alphanumeric(6),
      remote_serial: faker.number.int(),
    },
    CONFIG_UPDATE: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 19,
      key: "timeout",
      value: "60",
      old_value: "30",
    },
    ALIVE: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 20,
      state: faker.datatype.boolean(),
    },
    METER_OTA: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 21,
      previous: faker.system.semver(),
      update: faker.system.semver(),
      success: faker.datatype.boolean(),
    },
    POWER: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 22,
      Tv: faker.datatype.boolean(),
      Main: faker.datatype.boolean(),
      Smps: faker.datatype.boolean(),
    },
    BATTERY_VOLTAGE: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 23,
      Rtc: 2882,
      Meter: 4164,
    },
    BOOT: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 24,
      boot_ts: Date.now(),
      last_boot_ts: Date.now(),
      last_shutdown_ts: Date.now(),
      clean: faker.datatype.boolean(),
    },
    INSTALL_READY: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 25,
      hhid: faker.number.int(),
      remote_id: faker.number.int(),
      sim1_imsi: faker.string.numeric(15),
      sim2_imsi: faker.string.numeric(15),
      sim1_pass: faker.datatype.boolean(),
      sim2_pass: faker.datatype.boolean(),
    },
    BOOT_V2: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 26,
      rtc_ts: Date.now(),
      ntp_ts: Date.now(),
      cell_ts: Date.now(),
      boot_ts: Date.now(),
      clean: faker.datatype.boolean(),
      time_approximated: faker.datatype.boolean(),
      events_ignored: faker.datatype.boolean(),
    },
    STB: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 27,
      state: faker.datatype.boolean(),
    },
    DERIVED_TV_STATUS: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 28,
      state: faker.datatype.boolean(),
    },
    AUDIO_SOURCE: {
      ID: lastDeviceId,
      TS: Date.now(),
      Type: 29,
      Status: "line_in",
    },
  };
}


async function saveDataToMongo(inputJSON, schema) {
  try {
    const result = await schema.insertMany(inputJSON);
    if (result.length > 0) {
      return {
        statusCode: 200,
        message: "Document inserted successfully",
      };
    } else {
      throw new Error("Document not inserted");
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

function sendDataToMongoEvery5min() {
  setInterval(() => {
    const dummyData = generateRandomData();
    saveDataToMongo([dummyData], deviceSchema)
      .then((result) => {
        console.log(result.message);
      })
      .catch((error) => {
        console.error(error.message);
      });
  }, 5000); // 5 seconds in milliseconds
}

sendDataToMongoEvery5min();
