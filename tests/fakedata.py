import random
import string
from datetime import datetime, timedelta

def random_string(length=8):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

def random_boolean():
    return random.choice([True, False])

def random_number(min_value=0, max_value=100):
    return random.randint(min_value, max_value)

def random_float(min_value=0.0, max_value=100.0):
    return round(random.uniform(min_value, max_value), 2)

def current_timestamp():
    return int(datetime.now().timestamp())

def random_alert_type():
    return random.choice(["pending", "generated", "resolved"])

def random_audio_source():
    return random.choice(["HDMI", "AUX", "MIC"])

def generate_device_data():
    return {
        "DEVICE_ID": 100001,

        "LOCATION": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "Cell_Info": {
                "lat": random_float(-90, 90),
                "lon": random_float(-180, 180),
            },
            "Installing": random_boolean(),
        },

        "GUEST_REGISTRATION": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "guest_id": random_number(),
            "registering": random_boolean(),
            "guest_age": random_number(18, 80),
            "guest_male": random_boolean(),
        },

        "MEMBER_GUEST_DECLARATION": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "member_keys": [random_boolean() for _ in range(3)],
            "guests": [random_boolean() for _ in range(3)],
            "confidence": random_float(0.0, 1.0),
        },

        "CONFIGURATION": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "differential_mode": random_boolean(),
            "member_keys": [random_boolean() for _ in range(3)],
            "guest_cancellation_time": random_number(),
            "software_version": f"{random_number(1, 10)}.{random_number(0, 9)}.{random_number(0, 9)}",
            "power_pcb_firmware_version": f"{random_number(1, 10)}.{random_number(0, 9)}.{random_number(0, 9)}",
            "remote_firmware_version": f"{random_number(1, 10)}.{random_number(0, 9)}.{random_number(0, 9)}",
            "audio_configuration": [random_boolean() for _ in range(3)],
            "audience_day_start_time": random_number(),
            "no_of_sessions": random_number(1, 10),
        },

        "TAMPER_ALARM": {
            "ID": random_number(),
            "AlertType": random_alert_type(),
            "Type": random_number(),
            "TS": current_timestamp(),
            "Meter_tamper": random_boolean(),
            "Tv_plug_tamper": random_boolean(),
            "Tamper_ts": current_timestamp(),
        },

        "SOS_ALARM": {
            "ID": random_number(),
            "AlertType": random_alert_type(),
            "Type": random_number(),
            "TS": current_timestamp(),
            "sos": random_boolean(),
        },

        "BATTERY_ALARM": {
            "ID": random_number(),
            "AlertType": random_alert_type(),
            "Type": random_number(),
            "TS": current_timestamp(),
            "main_bat_fail": random_boolean(),
            "rtc_fail": random_boolean(),
            "rtc_bat_low": random_boolean(),
        },

        "METER_INSTALLATION": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "HHID": random_string(10),
            "Success": random_boolean(),
        },

        "VOLTAGE_STATS": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "high_rail_voltage": random_float(0, 10),
            "mid_rail_voltage": random_float(0, 10),
            "gsm_rail_voltage": random_float(0, 10),
            "rtc_battery_voltage": random_float(0, 10),
            "li_ion_battery_voltage": random_float(0, 10),
            "remote_battery_voltage": random_float(0, 10),
        },

        "TEMPERATURE_STATS": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "battery_temp": random_float(0, 100),
            "arm_core_temp": random_float(0, 100),
            "power_pcb_temp": random_float(0, 100),
            "rtc_temp": random_float(0, 100),
        },

        "NTP_SYNC": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "server": random_string(15),
            "system_time": current_timestamp(),
            "success": random_boolean(),
            "error_code": random_number(0, 5),
            "drift": random_float(0, 5),
            "jumped": random_boolean(),
        },

        "AUDIENCE_SESSION_CLOSE": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "stop_time": current_timestamp(),
            "viewing_member_keys": [random_boolean() for _ in range(3)],
            "viewing_guests": [random_boolean() for _ in range(3)],
            "tv_on": random_boolean(),
            "last_watermark_id": random_number(),
            "tv_event_ts": current_timestamp(),
            "last_watermark_id_ts": current_timestamp(),
            "marked": random_number(0, 10),
        },

        "NETWORK_LATCH": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "Ip_up": random_boolean(),
            "Sim": random.choice([1, 2]),
        },

        "REMOTE_PAIRING": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "remote_id": random_number(),
            "success": random_boolean(),
        },

        "REMOTE_ACTIVITY": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "lock": random_boolean(),
            "orr": random_boolean(),
            "absent_key_press": random_boolean(),
            "drop": random_boolean(),
        },

        "SIM_ALERT": {
            "ID": random_number(),
            "AlertType": random_alert_type(),
            "Type": random_number(),
            "TS": current_timestamp(),
            "sim1_absent": random_boolean(),
            "sim1_changed": random_boolean(),
            "sim2_absent": random_boolean(),
            "sim2_changed": random_boolean(),
        },

        "SYSTEM_ALARM": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "name": random_string(10),
            "AlertType": random_alert_type(),
            "Details": {"detail_key": random_string(5)},
        },

        "SYSTEM_INFO": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "rpi_serial": random_string(10),
            "pcb_serial": random_string(10),
            "imei": random_string(15),
            "imsi_1": random_string(15),
            "imsi_2": random_string(15),
            "eeprom": random_number(0, 100),
            "wifi_serial": random_string(10),
            "mac_serial": random_string(12),
            "remote_serial": random_number(0, 100),
        },

        "CONFIG_UPDATE": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "key": random_string(10),
            "value": random_string(10),
            "old_value": random_string(10),
        },

        "ALIVE": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "state": random_boolean(),
        },

        "METER_OTA": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "previous": random_string(10),
            "update": random_string(10),
            "success": random_boolean(),
        },

        "BATTERY_VOLTAGE": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "Rtc": random_float(0, 10),
            "Meter": random_float(0, 10),
        },

        "BOOT": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "boot_ts": current_timestamp(),
            "install": random_number(0, 100),
            "last_boot": current_timestamp(),
            "relay_status": [random_boolean() for _ in range(3)],
        },

        "BOOT_V2": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
            "boot_ts": current_timestamp(),
            "install": random_number(0, 100),
            "last_boot": current_timestamp(),
            "last_boot": random_number(0, 100),
        },

          "STB": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
    "derived":  random_boolean(),
  },
  "DERIVED_TV_STATUS": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
    "derived": random_boolean(),
  },

  "AUDIO_SOURCE": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": random_number(),
    "source": random_audio_source(),
  },
    }

# Generate and print fake data
data = generate_device_data()
for key, value in data.items():
    print(f"{key}: {value}")
