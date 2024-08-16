const mongoose = require("mongoose");

const devSchema = new mongoose.Schema({
  DEVICE_ID: { type: String },

  LOCATION: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    Cell_Info: {
      lat: { type: Number },
      lon: { type: Number },
    },
    Installing: { type: Boolean, default: true },
  },

  GUEST_REGISTRATION: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    guest_id: { type: Number },
    registering: { type: Boolean },
    guest_age: { type: Number },
    guest_male: { type: Boolean },
  },

  MEMBER_GUEST_DECLARATION: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    member_keys: [{ type: Boolean }],
    guests: [{ type: Boolean }],
    confidence: { type: Number },
  },

  CONFIGURATION: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    differential_mode: { type: Boolean },
    member_keys: [{ type: Boolean }],
    guest_cancellation_time: { type: Number },
    software_version: { type: String },
    power_pcb_firmware_version: { type: String },
    remote_firmware_version: { type: String },
    audio_configuration: [{ type: Boolean }],
    audience_day_start_time: { type: Number },
    no_of_sessions: { type: Number },
  },
  TAMPER_ALARM: {
    ID: { type: Number },
    AlertType: { type: String, required: true },
    Type: { type: Number },
    TS: { type: Number },
    Meter_tamper: { type: Boolean },
    Tv_plug_tamper: { type: Boolean },
    Tamper_ts: { type: Number },
  },
  SOS_ALARM: {
    ID: { type: Number },
    AlertType: { type: String, required: true },
    Type: { type: Number },
    TS: { type: Number },
    sos: { type: Boolean },
  },
  BATTERY_ALARM: {
    ID: { type: Number },
    AlertType: { type: String, required: true },
    Type: { type: Number },
    TS: { type: Number },
    main_bat_fail: { type: Boolean },
    rtc_fail: { type: Boolean },
    rtc_bat_low: { type: Boolean },
  },

  METER_INSTALLATION: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    HHID: { type: String },
    Success: { type: Boolean },
  },

  VOLTAGE_STATS: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    high_rail_voltage: { type: Number },
    mid_rail_voltage: { type: Number },
    gsm_rail_voltage: { type: Number },
    rtc_battery_voltage: { type: Number },
    li_ion_battery_voltage: { type: Number },
    remote_battery_voltage: { type: Number },
  },

  TEMPERATURE_STATS: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    battery_temp: { type: Number },
    arm_core_temp: { type: Number },
    power_pcb_temp: { type: Number },
    rtc_temp: { type: Number },
  },

  NTP_SYNC: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    server: { type: String },
    system_time: { type: Number },
    success: { type: Boolean },
    error_code: { type: Number },
    drift: { type: Number },
    jumped: { type: Boolean },
  },

  AUDIENCE_SESSION_CLOSE: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    stop_time: { type: Number },
    viewing_member_keys: [{ type: Boolean }],
    viewing_guests: [{ type: Boolean }],
    tv_on: { type: Boolean },
    last_watermark_id: { type: Number },
    tv_event_ts: { type: Number },
    last_watermark_id_ts: { type: Number },
    marked: { type: Number },
  },

  NETWORK_LATCH: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    Ip_up: { type: Boolean },
    Sim: { type: Number }, // 1 for sim1 2 for sim2
  },

  REMOTE_PAIRING: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    remote_id: { type: Number },
    success: { type: Boolean },
  },

  REMOTE_ACTIVITY: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    lock: { type: Boolean },
    orr: { type: Boolean },
    absent_key_press: { type: Boolean },
    drop: { type: Boolean },
  },
  SIM_ALERT: {
    ID: { type: Number },
    AlertType: { type: String, required: true },
    Type: { type: Number },
    TS: { type: Number },
    sim1_absent: { type: Boolean },
    sim1_changed: { type: Boolean },
    sim2_absent: { type: Boolean },
    sim2_changed: { type: Boolean },
  },
  SYSTEM_ALARM: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    name: { type: String },
    AlertType: { type: String, required: true },
    Details: { type: mongoose.Schema.Types.Mixed },
  },

  SYSTEM_INFO: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    rpi_serial: { type: String },
    pcb_serial: { type: String },
    imei: { type: String },
    imsi_1: { type: String },
    imsi_2: { type: String },
    eeprom: { type: Number },
    wifi_serial: { type: String },
    mac_serial: { type: String },
    remote_serial: { type: Number },
  },

  CONFIG_UPDATE: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    key: { type: String },
    value: { type: String },
    old_value: { type: String },
  },

  ALIVE: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    state: { type: Boolean },
  },

  METER_OTA: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    previous: { type: String },
    update: { type: String },
    success: { type: Boolean },
  },

  BATTERY_VOLTAGE: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    Rtc: { type: Number },
    Meter: { type: Number },
  },

  BOOT: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    boot_ts: { type: Number },
    install: { type: Number },
    last_boot: { type: Number },
    relay_status: [{ type: Boolean }],
  },

  BOOT_V2: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    boot_ts: { type: Number },
    install: { type: Number },
    last_boot: { type: Number },
    relay_status: [{ type: Boolean }],
  },

  STB: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    derived: { type: Boolean },
  },
  DERIVED_TV_STATUS: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    derived: { type: Boolean },
  },

  AUDIO_SOURCE: {
    ID: { type: Number },
    TS: { type: Number },
    Type: { type: Number },
    source: { type: String },
  }
});

const Device = mongoose.model("deviceInfo", devSchema, "iot_device_info");

module.exports = Device;
