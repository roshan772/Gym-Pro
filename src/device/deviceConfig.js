/**
 * deviceConfig.js
 *
 * Single source of truth for all Hikvision device connection settings.
 * Values are loaded from environment variables (set in .env for dev,
 * or from the OS environment in production).
 *
 * This module runs ONLY in the Electron main process.
 * It is never sent to or accessible from the renderer.
 */

"use strict";

function getConfig() {
  const host = process.env.HIKVISION_HOST;
  const port = parseInt(process.env.HIKVISION_PORT || "80", 10);
  const username = process.env.HIKVISION_USER;
  const password = process.env.HIKVISION_PASS;
  const doorNo = parseInt(process.env.HIKVISION_DOOR_NO || "1", 10);
  const timeoutMs = parseInt(process.env.HIKVISION_TIMEOUT_MS || "8000", 10);

  if (!host || !username || !password) {
    console.warn(
      "[DeviceConfig] HIKVISION_HOST / HIKVISION_USER / HIKVISION_PASS are not set. " +
        "Device sync will fail. Set them in your .env file."
    );
  }

  return {
    /** Device LAN IP address */
    host,
    /** HTTP port (default 80) */
    port,
    /** ISAPI base URL, e.g. http://192.168.8.150/ISAPI */
    baseURL: `http://${host}:${port}/ISAPI`,
    /** HTTP Basic Auth credentials */
    auth: { username, password },
    /** Default door number for remote-open commands */
    doorNo,
    /** Axios request timeout in milliseconds */
    timeoutMs,
  };
}

module.exports = { getConfig };
