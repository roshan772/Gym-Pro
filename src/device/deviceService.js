/**
 * deviceService.js
 *
 * Adapter layer between the database (db.js) and the physical Hikvision device.
 *
 * db.js calls these methods:
 *   deviceService.addUser(payload)          → when a new member is created
 *   deviceService.editUser(payload)         → when a member's profile is updated
 *   deviceService.renewMembership(payload)  → when membership is renewed
 *   deviceService.deleteUser(employeeNo)    → when a member is permanently deleted
 *
 * All calls are forwarded to hikvisionService which handles the actual ISAPI HTTP calls.
 *
 * This module runs ONLY in the Electron main process.
 */

"use strict";

const hikvision = require("./hikvisionService");

// ── Guard ─────────────────────────────────────────────────────────────────────

const SYNC_DISABLED =
  process.env.DISABLE_DEVICE_SYNC === "1" || process.env.NODE_ENV === "test";

if (SYNC_DISABLED) {
  console.log(
    "[DeviceService] ⚠️  Device sync is DISABLED (DISABLE_DEVICE_SYNC=1 or NODE_ENV=test). " +
      "All device calls will be skipped."
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Wraps a hikvision call and catches errors so a device failure never
 * crashes the local database operation that triggered it.
 */
async function safeCall(label, fn) {
  if (SYNC_DISABLED) {
    return { synced: false, skipped: true, reason: "DISABLE_DEVICE_SYNC" };
  }

  try {
    const result = await fn();
    return { synced: true, ...result };
  } catch (err) {
    console.error(`[DeviceService] ${label} failed:`, err.message);
    return { synced: false, error: err.message };
  }
}

// ── Public Adapter Methods ────────────────────────────────────────────────────

/**
 * Called by db.addMember() after the member row is inserted.
 *
 * Creates the user on the device with their membership validity window.
 * employeeNo is set to the member's DB id so the two systems stay in sync.
 *
 * Note on fingerprints:
 *   Fingerprint enrollment is done DIRECTLY on the physical device keypad.
 *   The device stores the template internally and associates it with the
 *   employeeNo.  Your software does not need to push fingerprint data —
 *   it only needs to ensure the employeeNo (member id) exists on the device
 *   BEFORE the member enrolls their fingerprint at the terminal.
 *
 * @param {object} payload  Result of buildDeviceUserPayload() in db.js
 */
async function addUser(payload) {
  console.log(`[DeviceService] addUser → id=${payload.employeeNo} name="${payload.name}"`);
  return safeCall("addUser", () => hikvision.addOrUpdateUser(payload));
}

/**
 * Called by db.updateMember() after profile fields (name, phone, etc.) change.
 *
 * Uses the same ISAPI endpoint as addUser — the device handles upsert logic.
 * Fingerprint templates already enrolled on the device are unaffected.
 *
 * @param {object} payload  Result of buildDeviceUserPayload() in db.js
 */
async function editUser(payload) {
  console.log(`[DeviceService] editUser → id=${payload.employeeNo} name="${payload.name}"`);
  return safeCall("editUser", () => hikvision.addOrUpdateUser(payload));
}

/**
 * Called by db.renewMember() after the membership date is extended in the DB.
 *
 * Best-practice: NEVER delete and re-add on renewal.  Only update the
 * Valid.endTime.  This preserves the fingerprint template stored on the device,
 * saving the member from having to re-enroll.
 *
 * @param {object} payload  Result of buildDeviceUserPayload() in db.js
 *                          Valid.endTime will contain the new expiry date.
 */
async function renewMembership(payload) {
  console.log(
    `[DeviceService] renewMembership → id=${payload.employeeNo} ` +
      `newEndTime="${payload.Valid.endTime}"`
  );
  return safeCall("renewMembership", () => hikvision.addOrUpdateUser(payload));
}

/**
 * Called by db.deleteMember() when a member is (soft) deleted in the app.
 *
 * ⚠️  Deletes the user AND their fingerprint from the device.
 *     Only invoke for permanent removal.  For expired memberships,
 *     prefer renewMembership (with a past endTime the device denies access
 *     automatically without destroying the fingerprint template).
 *
 * @param {string|number} employeeNo  The member's DB id
 */
async function deleteUser(employeeNo) {
  console.log(`[DeviceService] deleteUser → id=${employeeNo}`);
  return safeCall("deleteUser", () => hikvision.deleteUser(employeeNo));
}

/**
 * Directly accessible from IPC handler in main.js for manual admin actions.
 * Exposed through the device: namespace in preload.js.
 */
async function openDoor(doorNo) {
  console.log(`[DeviceService] openDoor → door=${doorNo ?? "default"}`);
  return safeCall("openDoor", () => hikvision.openDoor(doorNo));
}

/**
 * Health-check / connectivity test.
 * Called from the Settings page to confirm device is reachable.
 */
async function getDeviceStatus() {
  console.log("[DeviceService] getDeviceStatus →");
  return safeCall("getDeviceStatus", () => hikvision.getDeviceInfo());
}

module.exports = {
  addUser,
  editUser,
  renewMembership,
  deleteUser,
  openDoor,
  getDeviceStatus,
};
