/**
 * hikvisionService.js
 *
 * Low-level ISAPI client for the Hikvision DS-K1T8003EF access control device.
 *
 * ─── Architecture ──────────────────────────────────────────────────────────────
 *  This module runs EXCLUSIVELY in the Electron MAIN process.
 *  It is required by deviceService.js → db.js → main.js (main process chain).
 *  Device credentials NEVER leave the main process.
 * ───────────────────────────────────────────────────────────────────────────────
 *
 * Public API
 * ──────────────────────────────────────────────────────────────────────────────
 *  addOrUpdateUser(userPayload)  → POST   /ISAPI/AccessControl/UserInfo/Record
 *  deleteUser(employeeNo)        → DELETE /ISAPI/AccessControl/UserInfo/Record
 *  openDoor(doorNo?)             → PUT    /ISAPI/AccessControl/RemoteControl/door/{n}
 *  getDeviceInfo()               → GET    /ISAPI/System/deviceInfo
 */

"use strict";

const axios = require("axios");
const { getConfig } = require("./deviceConfig");

// ── XML Builders ──────────────────────────────────────────────────────────────

/**
 * Build the <UserInfo> XML body for add/update operations.
 *
 * userPayload shape (from buildDeviceUserPayload in db.js):
 * {
 *   employeeNo:     string   // member DB id (must be unique on device)
 *   name:           string
 *   Valid: {
 *     enable:       boolean
 *     beginTime:    "YYYY-MM-DDT00:00:00"
 *     endTime:      "YYYY-MM-DDT23:59:59"
 *   }
 * }
 */
function buildUserXML(userPayload) {
  const { employeeNo, name, Valid } = userPayload;
  const enable = Valid.enable !== false ? "true" : "false";

  return `<?xml version="1.0" encoding="UTF-8"?>
<UserInfo>
  <employeeNo>${escapeXML(String(employeeNo))}</employeeNo>
  <name>${escapeXML(String(name))}</name>
  <userType>normal</userType>
  <Valid>
    <enable>${enable}</enable>
    <beginTime>${Valid.beginTime}</beginTime>
    <endTime>${Valid.endTime}</endTime>
  </Valid>
</UserInfo>`;
}

/**
 * Build the <RemoteControlDoor> XML body for remote door open.
 */
function buildOpenDoorXML() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<RemoteControlDoor>
  <cmd>open</cmd>
</RemoteControlDoor>`;
}

/** Minimal XML entity escaping for user-supplied strings */
function escapeXML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Axios Instance Factory ────────────────────────────────────────────────────

/**
 * Returns a fresh axios instance configured for the device.
 * Config is re-read on every call so hot-changes to process.env are respected.
 */
function createClient() {
  const cfg = getConfig();
  return axios.create({
    baseURL: cfg.baseURL,
    auth: cfg.auth,                      // HTTP Basic Auth header — main process only
    timeout: cfg.timeoutMs,
    headers: {
      "Content-Type": "application/xml",
      Accept: "application/xml, text/xml, */*",
    },
    // Accept 2xx AND the Hikvision-specific redirect codes
    validateStatus: (status) => status >= 200 && status < 400,
  });
}

// ── Error Normalisation ───────────────────────────────────────────────────────

/**
 * Converts an axios error into a consistent Error object with extra context.
 * Extracts the Hikvision <statusString> from the XML response when available.
 */
function normaliseError(context, err) {
  let message = `[Hikvision:${context}] `;

  if (err.response) {
    // Device replied with a non-2xx status
    const body = typeof err.response.data === "string" ? err.response.data : "";
    const hikMsg = extractXMLTag(body, "statusString") || extractXMLTag(body, "subStatusCode");
    message += `HTTP ${err.response.status}`;
    if (hikMsg) message += ` — ${hikMsg}`;
  } else if (err.request) {
    // Request was made but no response (timeout, network unreachable)
    message += err.code === "ECONNABORTED"
      ? "Request timed out. Is the device reachable?"
      : `No response from device (${err.code || "network error"})`;
  } else {
    message += err.message;
  }

  const out = new Error(message);
  out.original = err;
  return out;
}

/** Pull the text content of the first matching XML tag from a string */
function extractXMLTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`));
  return match ? match[1].trim() : null;
}

// ── Public Service Methods ────────────────────────────────────────────────────

/**
 * Add or update a user on the device.
 *
 * The Hikvision DS-K1T8003EF uses the same endpoint for create and update.
 * If employeeNo already exists on the device the record is overwritten.
 *
 * Best practice for membership expiry:
 *   ► Do NOT delete the user. Instead call this method with Valid.enable=true
 *     and an updated endTime. The device enforces time-based access automatically.
 *   ► Only delete when the member is permanently removed from the gym system.
 *
 * @param {object} userPayload  Result of buildDeviceUserPayload() from db.js
 * @returns {Promise<{success: boolean, status: number}>}
 */
async function addOrUpdateUser(userPayload) {
  const client = createClient();
  const xml = buildUserXML(userPayload);

  try {
    console.log(`[Hikvision] addOrUpdateUser → employeeNo=${userPayload.employeeNo} name="${userPayload.name}"`);
    const response = await client.post("/AccessControl/UserInfo/Record", xml);
    console.log(`[Hikvision] addOrUpdateUser ✓ status=${response.status}`);
    return { success: true, status: response.status };
  } catch (err) {
    throw normaliseError("addOrUpdateUser", err);
  }
}

/**
 * Delete a user from the device by their employeeNo.
 *
 * ⚠️  Deleting removes fingerprint templates too. Only call this when the
 *     member is permanently leaving; for expiry use addOrUpdateUser with a
 *     past/current endTime instead so fingerprints are preserved for renewal.
 *
 * @param {string|number} employeeNo  The member's DB id (= device employeeNo)
 * @returns {Promise<{success: boolean, status: number}>}
 */
async function deleteUser(employeeNo) {
  const client = createClient();

  try {
    console.log(`[Hikvision] deleteUser → employeeNo=${employeeNo}`);
    const response = await client.delete(
      `/AccessControl/UserInfo/Record?employeeNo=${encodeURIComponent(String(employeeNo))}`
    );
    console.log(`[Hikvision] deleteUser ✓ status=${response.status}`);
    return { success: true, status: response.status };
  } catch (err) {
    throw normaliseError("deleteUser", err);
  }
}

/**
 * Remotely open the door / turnstile.
 *
 * @param {number} [doorNo=1]  Door/relay number on the device (usually 1)
 * @returns {Promise<{success: boolean, status: number}>}
 */
async function openDoor(doorNo) {
  const cfg = getConfig();
  const door = doorNo ?? cfg.doorNo ?? 1;
  const client = createClient();
  const xml = buildOpenDoorXML();

  try {
    console.log(`[Hikvision] openDoor → door=${door}`);
    const response = await client.put(
      `/AccessControl/RemoteControl/door/${door}`,
      xml
    );
    console.log(`[Hikvision] openDoor ✓ status=${response.status}`);
    return { success: true, status: response.status };
  } catch (err) {
    throw normaliseError("openDoor", err);
  }
}

/**
 * Fetch basic device information (model, firmware version, serial number).
 * Useful as a connectivity/health check.
 *
 * @returns {Promise<{success: boolean, deviceName?: string, serialNumber?: string, firmwareVersion?: string}>}
 */
async function getDeviceInfo() {
  const client = createClient();

  try {
    console.log("[Hikvision] getDeviceInfo →");
    const response = await client.get("/System/deviceInfo");
    const xml = typeof response.data === "string" ? response.data : "";

    const info = {
      success: true,
      deviceName:      extractXMLTag(xml, "deviceName"),
      serialNumber:    extractXMLTag(xml, "serialNumber"),
      firmwareVersion: extractXMLTag(xml, "firmwareVersion"),
      deviceType:      extractXMLTag(xml, "deviceType"),
      model:           extractXMLTag(xml, "model"),
    };

    console.log(`[Hikvision] getDeviceInfo ✓ model="${info.model}" fw="${info.firmwareVersion}"`);
    return info;
  } catch (err) {
    throw normaliseError("getDeviceInfo", err);
  }
}

module.exports = {
  addOrUpdateUser,
  deleteUser,
  openDoor,
  getDeviceInfo,
};
