const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("gymAPI", {
  // Auth
  login: (data) => ipcRenderer.invoke("auth:login", data),
  changePassword: (data) => ipcRenderer.invoke("auth:changePassword", data),

  // Members
  getMembers: () => ipcRenderer.invoke("members:getAll"),
  searchMembers: (q) => ipcRenderer.invoke("members:search", q),
  getMemberById: (id) => ipcRenderer.invoke("members:getById", id),
  addMember: (m) => ipcRenderer.invoke("members:add", m),
  updateMember: (m) => ipcRenderer.invoke("members:update", m),
  deleteMember: (id) => ipcRenderer.invoke("members:delete", id),
  renewMember: (d) => ipcRenderer.invoke("members:renew", d),

  // Attendance
  getTodayAttendance: () => ipcRenderer.invoke("attendance:getToday"),
  getAttendanceByDate: (date) =>
    ipcRenderer.invoke("attendance:getByDate", date),
  getMemberAttendance: (id) => ipcRenderer.invoke("attendance:getByMember", id),

  // Payments
  addPayment: (p) => ipcRenderer.invoke("payments:add", p),
  getMemberPayments: (id) => ipcRenderer.invoke("payments:getByMember", id),
  getAllPayments: () => ipcRenderer.invoke("payments:getAll"),
  getTodayRevenue: () => ipcRenderer.invoke("payments:getTodayRevenue"),
  getMonthlyRevenue: () => ipcRenderer.invoke("payments:getMonthlyRevenue"),

  // Dashboard
  getDashboardStats: () => ipcRenderer.invoke("dashboard:stats"),

  // Reports
  getMonthlyReport: (m) => ipcRenderer.invoke("reports:monthly", m),
  getExpiredMembers: () => ipcRenderer.invoke("reports:expired"),
  getAttendanceReport: (r) => ipcRenderer.invoke("reports:attendance", r),

  // Admins
  getAdmins: () => ipcRenderer.invoke("admins:getAll"),
  addAdmin: (d) => ipcRenderer.invoke("admins:add", d),
  deleteAdmin: (id) => ipcRenderer.invoke("admins:delete", id),
  blockMember: (id) => ipcRenderer.invoke("members:block", id),
  unblockMember: (id) => ipcRenderer.invoke("members:unblock", id),

  markNotificationSent: (id) =>
    ipcRenderer.invoke("members:markNotificationSent", id),

  // ── Hikvision Device ───────────────────────────────────────────────────────
  // These methods invoke IPC channels handled in the main process.
  // Device IP and credentials are NEVER exposed here — only the results are.

  /**
   * Check device connectivity and retrieve basic hardware info.
   * @returns {Promise<{success, synced, deviceName?, model?, firmwareVersion?, serialNumber?, error?}>}
   */
  getDeviceStatus: () => ipcRenderer.invoke("hikvision:getStatus"),

  /**
   * Remotely open the door / turnstile from the UI.
   * @param {number} [doorNo]  Optional door number (defaults to env HIKVISION_DOOR_NO)
   * @returns {Promise<{success, synced, error?}>}
   */
  openDoor: (doorNo) => ipcRenderer.invoke("hikvision:openDoor", doorNo),

  /**
   * Manually sync a specific member to the device.
   * Useful after the device was offline when the member was registered.
   *
   * @param {{
   *   employeeNo: string,
   *   name: string,
   *   Valid: { enable: boolean, beginTime: string, endTime: string }
   * }} memberPayload
   * @returns {Promise<{success, synced, error?}>}
   */
  syncMemberToDevice: (memberPayload) =>
    ipcRenderer.invoke("hikvision:syncMember", memberPayload),
});
