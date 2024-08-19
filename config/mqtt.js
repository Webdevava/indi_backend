const path = require("path");

module.exports = {
  endpoint: "a3uoz4wfsx2nz3-ats.iot.ap-south-1.amazonaws.com",
  certPath: path.join(__dirname, "./certs/test.cert.pem.crt"),
  keyPath: path.join(__dirname, "./certs/test.private.pem.key"),
  caPath: path.join(__dirname, "./certs/root-ca.crt"),
  clientId: "mqtt-client-" + Math.random().toString(16).substr(2, 8),
  topicsToSubscribe: ["apm/device/data", "apm/logo"],
};
