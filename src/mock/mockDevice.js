/**
 * mockDevice.js
 *
 * A minimal Express server that mimics the Hikvision DS-K1T8003EF ISAPI surface.
 * Run this during development when the physical device is not on the network.
 *
 * Usage:
 *   node src/mock/mockDevice.js
 *
 * Then set in .env:
 *   HIKVISION_HOST=127.0.0.1
 *   HIKVISION_PORT=3001
 *   HIKVISION_USER=admin
 *   HIKVISION_PASS=any
 */

"use strict";

const express = require("express");

const PORT = process.argv[2] ? parseInt(process.argv[2]) : 3001;
const app = express();

// Accept XML bodies
app.use(express.text({ type: ["application/xml", "text/xml", "*/*"] }));

// In-memory user store
const users = new Map();

function xmlOk(extra = "") {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<ResponseStatus>\n  <requestURL>/ISAPI/AccessControl/...</requestURL>\n  <statusCode>1</statusCode>\n  <statusString>OK</statusString>\n  ${extra}\n</ResponseStatus>`;
}

function xmlErr(code, msg) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<ResponseStatus>\n  <statusCode>${code}</statusCode>\n  <statusString>${msg}</statusString>\n</ResponseStatus>`;
}

// ── GET /ISAPI/System/deviceInfo ───────────────────────────────────────────
app.get("/ISAPI/System/deviceInfo", (req, res) => {
  console.log("[MockDevice] GET /ISAPI/System/deviceInfo");
  res.type("xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<DeviceInfo>
  <deviceName>MockGymDevice</deviceName>
  <deviceID>MOCK-001</deviceID>
  <model>DS-K1T8003EF</model>
  <serialNumber>MOCK-SN-20260101</serialNumber>
  <firmwareVersion>V2.0.0_mock</firmwareVersion>
  <firmwareReleasedDate>2026-01-01</firmwareReleasedDate>
  <deviceType>AccessControlTerminal</deviceType>
</DeviceInfo>`);
});

// ── POST /ISAPI/AccessControl/UserInfo/Record (add/update user) ────────────
app.post("/ISAPI/AccessControl/UserInfo/Record", (req, res) => {
  const body = req.body || "";
  const empMatch = body.match(/<employeeNo>([^<]+)<\/employeeNo>/);
  const nameMatch = body.match(/<name>([^<]+)<\/name>/);
  const endMatch = body.match(/<endTime>([^<]+)<\/endTime>/);

  const employeeNo = empMatch ? empMatch[1] : "?";
  const name = nameMatch ? nameMatch[1] : "?";
  const endTime = endMatch ? endMatch[1] : "?";

  users.set(employeeNo, { employeeNo, name, endTime });
  console.log(`[MockDevice] POST UserInfo/Record → id=${employeeNo} name="${name}" until=${endTime}`);
  res.type("xml").send(xmlOk());
});

// ── DELETE /ISAPI/AccessControl/UserInfo/Record?employeeNo=X ──────────────
app.delete("/ISAPI/AccessControl/UserInfo/Record", (req, res) => {
  const employeeNo = req.query.employeeNo;
  if (!employeeNo) {
    return res.status(400).type("xml").send(xmlErr(4, "Missing employeeNo"));
  }
  const existed = users.delete(employeeNo);
  console.log(`[MockDevice] DELETE UserInfo/Record → id=${employeeNo} existed=${existed}`);
  res.type("xml").send(xmlOk());
});

// ── PUT /ISAPI/AccessControl/RemoteControl/door/:doorNo ───────────────────
app.put("/ISAPI/AccessControl/RemoteControl/door/:doorNo", (req, res) => {
  const { doorNo } = req.params;
  console.log(`[MockDevice] PUT RemoteControl/door/${doorNo} → 🔓 DOOR OPENED`);
  res.type("xml").send(xmlOk());
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, "127.0.0.1", () => {
  console.log(`\n[MockDevice] 🟢 Hikvision mock server running at http://127.0.0.1:${PORT}`);
  console.log("[MockDevice] Set in .env:");
  console.log(`  HIKVISION_HOST=127.0.0.1`);
  console.log(`  HIKVISION_PORT=${PORT}`);
  console.log("[MockDevice] Press Ctrl+C to stop.\n");
});
