// dotenv is loaded inside app.whenReady() below — using app.getAppPath() gives
// a reliable absolute path to .env that works in both dev and packaged builds.

const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

if (require("electron-squirrel-startup")) app.quit();

let db = null;
let deviceService = null;

// const isDev = true; // change later
// if (isDev) {
//   const startMockServer = require("./device/mock-hikvision");
//   startMockServer(3001);
// }

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
  mainWindow.webContents.openDevTools();
  mainWindow.once("ready-to-show", () => mainWindow.show());
};

app.whenReady().then(() => {
  // ── Load .env FIRST with an explicit path ───────────────────────────────
  // app.getAppPath() is the project root in dev AND in packaged builds,
  // unlike process.cwd() which can differ in production installers.
  const envPath = path.join(app.getAppPath(), ".env");
  const dotenvResult = require("dotenv").config({ path: envPath });
  if (dotenvResult.error) {
    console.warn("[Main] .env not loaded:", dotenvResult.error.message);
  } else {
    console.log("[Main] .env loaded from:", envPath);
  }

  // ── KEY FIX: Load db.js using absolute path from project root ──────────
  const dbPath = path.join(app.getAppPath(), "src", "database", "db.js");
  db = require(dbPath);

  // Device service is safe to require after dotenv has loaded env vars
  const deviceServicePath = path.join(app.getAppPath(), "src", "device", "deviceService.js");
  deviceService = require(deviceServicePath);

  registerIpcHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

function registerIpcHandlers() {
  // ── Auth ──────────────────────────────────────────────────────────
  ipcMain.handle("auth:login", (_, d) => db.login(d.email, d.password));
  ipcMain.handle("auth:changePassword", (_, d) => db.changePassword(d));

  // ── Members ───────────────────────────────────────────────────────
  ipcMain.handle("members:getAll", () => db.getAllMembers());
  ipcMain.handle("members:search", (_, q) => db.searchMembers(q));
  ipcMain.handle("members:getById", (_, id) => db.getMemberById(id));
  ipcMain.handle("members:add", (_, m) => db.addMember(m));
  ipcMain.handle("members:update", (_, m) => db.updateMember(m));
  ipcMain.handle("members:delete", (_, id) => db.deleteMember(id));
  ipcMain.handle("members:renew", (_, d) => db.renewMember(d));

  // ── Attendance ────────────────────────────────────────────────────
  ipcMain.handle("attendance:getToday", () => db.getTodayAttendance());
  ipcMain.handle("attendance:getByDate", (_, date) =>
    db.getAttendanceByDate(date),
  );
  ipcMain.handle("attendance:getByMember", (_, id) =>
    db.getMemberAttendance(id),
  );

  // (attendance:scan removed — attendance is now logged by the Hikvision device)

  // ── Payments ──────────────────────────────────────────────────────
  ipcMain.handle("payments:add", (_, p) => db.addPayment(p));
  ipcMain.handle("payments:getByMember", (_, id) => db.getMemberPayments(id));
  ipcMain.handle("payments:getAll", () => db.getAllPayments());
  ipcMain.handle("payments:getTodayRevenue", () => db.getTodayRevenue());
  ipcMain.handle("payments:getMonthlyRevenue", () => db.getMonthlyRevenue());

  // ── Dashboard ─────────────────────────────────────────────────────
  ipcMain.handle("dashboard:stats", () => db.getDashboardStats());

  // ── Reports ───────────────────────────────────────────────────────
  ipcMain.handle("reports:monthly", (_, m) => db.getMonthlyReport(m));
  ipcMain.handle("reports:expired", () => db.getExpiredMembers());
  ipcMain.handle("reports:attendance", (_, r) => db.getAttendanceReport(r));

  // ── Admins ────────────────────────────────────────────────────────
  ipcMain.handle("admins:getAll", () => db.getAllAdmins());
  ipcMain.handle("admins:add", (_, d) => db.addAdmin(d));
  ipcMain.handle("admins:delete", (_, id) => db.deleteAdmin(id));
  ipcMain.handle("members:block", (_, id) => db.blockMember(id));
  ipcMain.handle("members:unblock", (_, id) => db.unblockMember(id));

  ipcMain.handle("members:markNotificationSent", (_, id) =>
    db.markNotificationSent(id),
  );

  // ── Hikvision Device ──────────────────────────────────────────────
  // All handlers run in main process — credentials NEVER reach the renderer.

  /**
   * Check if the device is reachable and return its info.
   * Used by the Settings page to show connection status.
   */
  ipcMain.handle("hikvision:getStatus", async () => {
    try {
      return await deviceService.getDeviceStatus();
    } catch (err) {
      console.error("[IPC] hikvision:getStatus error:", err.message);
      return { success: false, synced: false, error: err.message };
    }
  });

  /**
   * Remotely open the door / turnstile from the app UI.
   * Accepts an optional doorNo (defaults to HIKVISION_DOOR_NO env var).
   */
  ipcMain.handle("hikvision:openDoor", async (_, doorNo) => {
    try {
      return await deviceService.openDoor(doorNo);
    } catch (err) {
      console.error("[IPC] hikvision:openDoor error:", err.message);
      return { success: false, synced: false, error: err.message };
    }
  });

  /**
   * Manually push a member's data to the device.
   * Useful after network outages or for re-syncing a specific member.
   * Expects a member payload matching buildDeviceUserPayload() shape.
   */
  ipcMain.handle("hikvision:syncMember", async (_, memberPayload) => {
    try {
      return await deviceService.addUser(memberPayload);
    } catch (err) {
      console.error("[IPC] hikvision:syncMember error:", err.message);
      return { success: false, synced: false, error: err.message };
    }
  });
}
