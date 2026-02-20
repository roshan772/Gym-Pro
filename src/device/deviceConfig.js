const DEFAULT_DEV_URL = process.env.MOCK_DEVICE_URL || "http://localhost:3001";
const DEFAULT_PROD_URL = process.env.REAL_DEVICE_URL || "http://<real_device_IP>";

const runtimeEnv = (process.env.ELECTRON_ENV || process.env.NODE_ENV || "production")
  .toString()
  .trim()
  .toLowerCase();

const DEVICE_URL = runtimeEnv === "development" ? DEFAULT_DEV_URL : DEFAULT_PROD_URL;

module.exports = {
  DEVICE_URL,
  runtimeEnv,
};
