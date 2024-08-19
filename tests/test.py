import os
import time
import json
import random
import string
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from datetime import datetime
# Load environment variables from /etc/publisher.env
def load_env(file_path):
    with open(file_path) as f:
        for line in f:
            if '=' in line:
                key, value = line.strip().split('=', 1)
                os.environ[key] = value
# Path to your environment file
ENV_FILE_PATH = '/etc/publisher.env'
load_env(ENV_FILE_PATH)
# Retrieve environment variables
AWS_IOT_ENDPOINT = os.getenv("AWS_IOT_ENDPOINT")
AWS_IOT_CERTIFICATE = os.getenv("AWS_IOT_CERTIFICATE")
AWS_IOT_PRIVATE_KEY = os.getenv("AWS_IOT_PRIVATE_KEY")
AWS_IOT_ROOT_CA = os.getenv("AWS_IOT_ROOT_CA")
PUB_TOPIC = os.getenv("PUB_TOPIC")
SUB_TOPIC = os.getenv("SUB_TOPIC")
if not all([AWS_IOT_ENDPOINT, AWS_IOT_CERTIFICATE, AWS_IOT_PRIVATE_KEY, AWS_IOT_ROOT_CA, PUB_TOPIC, SUB_TOPIC]):
    raise ValueError("Missing environment variables. Please ensure all required environment variables are set.")
# Initialize the AWSIoTMQTTClient
client = AWSIoTMQTTClient("myClientID")
client.configureEndpoint(AWS_IOT_ENDPOINT, 8883)
client.configureCredentials(AWS_IOT_ROOT_CA, AWS_IOT_PRIVATE_KEY, AWS_IOT_CERTIFICATE)
# Callback function when a message is received
def on_message(client, userdata, message):
    print(f"Received message: {message.payload.decode('utf-8')} on topic: {message.topic}")
# Configure the client
client.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
client.configureDrainingFrequency(2)  # Draining: 2 Hz
client.configureConnectDisconnectTimeout(10)  # 10 sec
client.configureMQTTOperationTimeout(5)  # 5 sec
# Connect to AWS IoT
client.connect()
client.subscribe(SUB_TOPIC, 1, on_message)
# Functions for generating random data
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
            "Type": 1,
            "Cell_Info": {
                 "region":"India",
                "lat": 19.7515,  # Latitude for Maharashtra, India
                "lon": 75.7139,  # Longitude for Maharashtra, India
            },
            "Installing": random_boolean(),
        },

        "GUEST_REGISTRATION": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": 2,
            "guest_id": random_number(),
            "registering": random_boolean(),
            "guest_age": random_number(18, 80),
            "guest_male": random_boolean(),
        },

        "MEMBER_GUEST_DECLARATION": {
            "ID": random_number(),
            "TS":3,
            "Type": random_number(),
            "member_keys": [random_boolean() for _ in range(3)],
            "guests": [random_boolean() for _ in range(3)],
            "confidence": random_float(0.0, 1.0),
        },

        "CONFIGURATION": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": 4,
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
            "Type": 5,
            "TS": current_timestamp(),
            "Meter_tamper": random_boolean(),
            "Tv_plug_tamper": random_boolean(),
            "Tamper_ts": current_timestamp(),
        },

        "SOS_ALARM": {
            "ID": random_number(),
            "AlertType": random_alert_type(),
            "Type": 6,
            "TS": current_timestamp(),
            "sos": random_boolean(),
        },

        "BATTERY_ALARM": {
            "ID": random_number(),
            "AlertType": random_alert_type(),
            "Type": 7,
            "TS": current_timestamp(),
            "main_bat_fail": random_boolean(),
            "rtc_fail": random_boolean(),
            "rtc_bat_low": random_boolean(),
        },

        "METER_INSTALLATION": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type":8,
            "HHID": random_string(10),
            "Success": random_boolean(),
        },

        "VOLTAGE_STATS": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": 9,
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
            "Type": 10,
            "battery_temp": random_float(0, 100),
            "arm_core_temp": random_float(0, 100),
            "power_pcb_temp": random_float(0, 100),
            "rtc_temp": random_float(0, 100),
        },

        "NTP_SYNC": {
            "ID": random_number(),
            "TS": current_timestamp(),
            "Type": 11,
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
            "Type": 12,
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
            "Type": 13,
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
def publish_data():
    while True:
        try:
                # Generate random data
                device_data = generate_device_data()
                # Publish to AWS IoT
                client.publish(PUB_TOPIC, json.dumps(device_data), 1)
                print(f"Published device data: {device_data}")
        except Exception as e:
                print(f"Unexpected error: {e}")
                # Wait for the next interval (e.g., 10 seconds)
                time.sleep(10)
        try:
                publish_data()
        except KeyboardInterrupt:
                print("Disconnecting...")
        finally:
                client.disconnect()