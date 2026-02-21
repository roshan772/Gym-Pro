const Database = require("better-sqlite3");
const path = require("path");
const bcrypt = require("bcryptjs");
const { format, addMonths, addYears, isAfter, parseISO } = require("date-fns");
const deviceService = require("../device/deviceService");

const { app } = require("electron");
const DB_PATH = path.join(app.getPath("userData"), "gymproAdmin.db");

const db = new Database(DB_PATH);

const DEVICE_SYNC_DISABLED =
  process.env.DISABLE_DEVICE_SYNC === "1" || process.env.NODE_ENV === "test";

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema ────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL DEFAULT 'Admin',
    email      TEXT    UNIQUE NOT NULL,
    password   TEXT    NOT NULL,
    role       TEXT    NOT NULL DEFAULT 'admin',
    created_at TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS members (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name         TEXT    NOT NULL,
    phone             TEXT,
    address           TEXT,
    membership_type   TEXT    NOT NULL,
    start_date        TEXT    NOT NULL,
    expiry_date       TEXT    NOT NULL,
    membership_fee    REAL    NOT NULL DEFAULT 0,
    fingerprint_id    TEXT    UNIQUE,
    photo             TEXT,
    status            TEXT    NOT NULL DEFAULT 'active',
    deleted           INTEGER NOT NULL DEFAULT 0,
    blocked           INTEGER NOT NULL DEFAULT 0,
    notification_sent INTEGER NOT NULL DEFAULT 0,
    created_at        TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id        INTEGER NOT NULL,
    date             TEXT    NOT NULL,
    entry_time       TEXT,
    exit_time        TEXT,
    duration_minutes INTEGER,
    FOREIGN KEY (member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id    INTEGER NOT NULL,
    amount       REAL    NOT NULL,
    payment_date TEXT    NOT NULL,
    payment_type TEXT    NOT NULL DEFAULT 'membership',
    notes        TEXT    DEFAULT '',
    FOREIGN KEY (member_id) REFERENCES members(id)
  );

  CREATE TABLE IF NOT EXISTS whatsapp_queue (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id   INTEGER NOT NULL,
    phone       TEXT    NOT NULL,
    message     TEXT    NOT NULL,
    status      TEXT    NOT NULL DEFAULT 'pending',
    sent_at     TEXT,
    error       TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (member_id) REFERENCES members(id)
  );
  
  
`);
try {
  db.prepare(
    `
    UPDATE admins 
    SET role = 'admin' 
    WHERE email = 'admin@gym.com' 
    AND (role IS NULL OR role = '')
  `,
  ).run();
  console.log("✅ Admin role fixed");
} catch (err) {
  console.log("Admin role already set or error:", err.message);
}

try {
  db.prepare(
    "ALTER TABLE members ADD COLUMN notification_sent INTEGER NOT NULL DEFAULT 0",
  ).run();
} catch (err) {
  // Column already exists, ignore
}

// ── Seed default admin ────────────────────────────────────────────
const adminExists = db
  .prepare("SELECT id FROM admins WHERE email = ?")
  .get("admin@gym.com");
if (!adminExists) {
  db.prepare("INSERT INTO admins (name, email, password) VALUES (?,?,?)").run(
    "Gym Owner",
    "admin@gym.com",
    bcrypt.hashSync("admin123", 10),
  );
}

// ── Helpers ───────────────────────────────────────────────────────
const todayStr = () => format(new Date(), "yyyy-MM-dd");
const nowTime = () => format(new Date(), "HH:mm:ss");

function calcExpiry(startDate, membershipType) {
  const start = parseISO(startDate);
  if (membershipType === "1_month")
    return format(addMonths(start, 1), "yyyy-MM-dd");
  if (membershipType === "3_months")
    return format(addMonths(start, 3), "yyyy-MM-dd");
  if (membershipType === "1_year")
    return format(addYears(start, 1), "yyyy-MM-dd");
  return startDate;
}

function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function buildDeviceUserPayload(member) {
  if (!member || !member.id) return null;
  const beginTime = member.start_date
    ? `${member.start_date}T00:00:00`
    : new Date().toISOString();
  const endTime = member.expiry_date
    ? `${member.expiry_date}T23:59:59`
    : "2099-12-31T23:59:59";

  return {
    employeeNo: String(member.id),
    name: member.full_name,
    phoneNo: member.phone || "",
    address: member.address || "",
    membershipType: member.membership_type,
    status: member.status || "active",
    Valid: {
      enable: true,
      beginTime,
      endTime,
    },
  };
}

async function syncDevice(actionLabel, executor) {
  if (DEVICE_SYNC_DISABLED) return { synced: false, skipped: true };
  try {
    const deviceResponse = await executor();
    return { synced: true, deviceResponse };
  } catch (error) {
    console.warn(`[Device Sync] ${actionLabel} failed:`, error.message);
    return { synced: false, error: error.message };
  }
}

async function syncMemberToDevice(action, member) {
  if (!member) return { synced: false, reason: "member-not-found" };
  if (action === "delete") {
    return syncDevice("delete member", () =>
      deviceService.deleteUser(member.id),
    );
  }

  const payload = buildDeviceUserPayload(member);
  if (!payload) return { synced: false, reason: "invalid-payload" };

  if (action === "add") {
    return syncDevice("add member", () => deviceService.addUser(payload));
  }

  if (action === "renew") {
    return syncDevice("renew member", () =>
      deviceService.renewMembership(payload),
    );
  }

  return syncDevice("update member", () => deviceService.editUser(payload));
}

// ── AUTH ──────────────────────────────────────────────────────────
function login(email, password) {
  const admin = db.prepare("SELECT * FROM admins WHERE email = ?").get(email);
  if (!admin) return { success: false, message: "Invalid email or password" };
  if (!bcrypt.compareSync(password, admin.password))
    return { success: false, message: "Invalid email or password" };

  //Return role in the response
  return {
    success: true,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
}
function changePassword({ currentPassword, newPassword }) {
  const admin = db.prepare("SELECT * FROM admins LIMIT 1").get();
  if (!bcrypt.compareSync(currentPassword, admin.password))
    return { success: false, message: "Current password is incorrect" };
  db.prepare("UPDATE admins SET password = ? WHERE id = ?").run(
    bcrypt.hashSync(newPassword, 10),
    admin.id,
  );
  return { success: true };
}

// ── MEMBERS ───────────────────────────────────────────────────────
function getAllMembers() {
  return db
    .prepare("SELECT * FROM members WHERE deleted = 0 ORDER BY created_at DESC")
    .all();
}

function searchMembers(query) {
  const q = `%${query}%`;
  return db
    .prepare(
      "SELECT * FROM members WHERE deleted = 0 AND (full_name LIKE ? OR phone LIKE ?) ORDER BY full_name",
    )
    .all(q, q);
}

function getMemberById(id) {
  return db
    .prepare("SELECT * FROM members WHERE id = ? AND deleted = 0")
    .get(id);
}

async function addMember(m) {
  const expiry = calcExpiry(m.start_date, m.membership_type);
  const result = db
    .prepare(
      `
    INSERT INTO members
      (full_name, phone, address, membership_type, start_date, expiry_date,
       membership_fee, photo, status)
    VALUES (?,?,?,?,?,?,?,?,'active')
  `,
    )
    .run(
      m.full_name,
      m.phone || "",
      m.address || "",
      m.membership_type,
      m.start_date,
      expiry,
      m.membership_fee,
      m.photo || null,
    );

  db.prepare(
    `
    INSERT INTO payments (member_id, amount, payment_date, payment_type, notes)
    VALUES (?,?,?,'membership','Initial registration')
  `,
  ).run(result.lastInsertRowid, m.membership_fee, m.start_date);

  const newMember = {
    ...m,
    id: result.lastInsertRowid,
    expiry_date: expiry,
    status: "active",
  };

  const deviceSync = await syncMemberToDevice("add", newMember);

  if (!deviceSync.synced && !deviceSync.skipped) {
    console.error(
      `[DB] addMember: device sync FAILED for member id=${newMember.id} name="${newMember.full_name}". ` +
        `Reason: ${deviceSync.error || deviceSync.reason || "unknown"}`
    );
  } else if (deviceSync.synced) {
    console.log(
      `[DB] addMember: device sync OK for member id=${newMember.id} name="${newMember.full_name}"`
    );
  }

  return {
    success: true,
    id: result.lastInsertRowid,
    expiry_date: expiry,
    deviceSync,
  };
}

async function updateMember(m) {
  db.prepare(
    `
    UPDATE members SET full_name=?, phone=?, address=?, photo=?
    WHERE id=?
  `,
  ).run(
    m.full_name,
    m.phone || "",
    m.address || "",
    m.photo || null,
    m.id,
  );

  const updatedMember = getMemberById(m.id);
  const deviceSync = await syncMemberToDevice("update", updatedMember);

  return { success: true, deviceSync };
}

async function deleteMember(id) {
  const member = getMemberById(id);
  db.prepare("UPDATE members SET deleted = 1 WHERE id = ?").run(id);

  const deviceSync = member
    ? await syncMemberToDevice("delete", member)
    : { synced: false, reason: "member-not-found" };

  return { success: true, deviceSync };
}

async function renewMember({ memberId, membershipType, fee, startDate }) {
  const expiry = calcExpiry(startDate, membershipType);
  db.prepare(
    `
    UPDATE members
    SET membership_type=?, start_date=?, expiry_date=?, membership_fee=?, status='active', blocked=0, notification_sent=0
    WHERE id=?
  `,
  ).run(membershipType, startDate, expiry, fee, memberId);

  db.prepare(
    `
    INSERT INTO payments (member_id, amount, payment_date, payment_type, notes)
    VALUES (?,?,?,'renewal',?)
  `,
  ).run(
    memberId,
    fee,
    startDate,
    `Renewed: ${membershipType.replace("_", " ")}`,
  );

  const updatedMember = getMemberById(memberId);
  const deviceSync = await syncMemberToDevice("renew", updatedMember);

  return { success: true, expiry_date: expiry, deviceSync };
}

function blockMember(id) {
  db.prepare("UPDATE members SET blocked = 1 WHERE id = ?").run(id);
  return { success: true };
}

function unblockMember(id) {
  db.prepare("UPDATE members SET blocked = 0 WHERE id = ?").run(id);
  return { success: true };
}

function markNotificationSent(memberId) {
  db.prepare("UPDATE members SET notification_sent = 1 WHERE id = ?").run(
    memberId,
  );
  return { success: true };
}

// ── ATTENDANCE ────────────────────────────────────────────────────
// processScan removed — attendance is logged by the Hikvision device

function getTodayAttendance() {
  return db
    .prepare(
      `
    SELECT a.*, m.full_name, m.phone, m.membership_type
    FROM attendance a JOIN members m ON a.member_id = m.id
    WHERE a.date = ? ORDER BY a.entry_time DESC
  `,
    )
    .all(todayStr());
}

function getAttendanceByDate(date) {
  return db
    .prepare(
      `
    SELECT a.*, m.full_name, m.phone
    FROM attendance a JOIN members m ON a.member_id = m.id
    WHERE a.date = ? ORDER BY a.entry_time DESC
  `,
    )
    .all(date);
}

function getMemberAttendance(memberId) {
  return db
    .prepare(
      "SELECT * FROM attendance WHERE member_id = ? ORDER BY date DESC LIMIT 60",
    )
    .all(memberId);
}

// ── PAYMENTS ──────────────────────────────────────────────────────
function addPayment(p) {
  db.prepare(
    `
    INSERT INTO payments (member_id, amount, payment_date, payment_type, notes)
    VALUES (?,?,?,?,?)
  `,
  ).run(
    p.member_id,
    p.amount,
    p.payment_date,
    p.payment_type || "membership",
    p.notes || "",
  );
  return { success: true };
}

function getMemberPayments(memberId) {
  return db
    .prepare(
      "SELECT * FROM payments WHERE member_id = ? ORDER BY payment_date DESC",
    )
    .all(memberId);
}

function getAllPayments() {
  return db
    .prepare(
      `
    SELECT p.*, m.full_name FROM payments p
    JOIN members m ON p.member_id = m.id
    ORDER BY p.payment_date DESC, p.id DESC LIMIT 200
  `,
    )
    .all();
}

function getTodayRevenue() {
  return db
    .prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE payment_date = ?",
    )
    .get(todayStr()).total;
}

function getMonthlyRevenue() {
  const month = format(new Date(), "yyyy-MM");
  return db
    .prepare(
      "SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE strftime('%Y-%m', payment_date) = ?",
    )
    .get(month).total;
}

// ── DASHBOARD ─────────────────────────────────────────────────────
function getDashboardStats() {
  const today = todayStr();
  return {
    total: db.prepare("SELECT COUNT(*) as c FROM members WHERE deleted=0").get()
      .c,
    active: db
      .prepare(
        "SELECT COUNT(*) as c FROM members WHERE deleted=0 AND expiry_date>=?",
      )
      .get(today).c,
    expired: db
      .prepare(
        "SELECT COUNT(*) as c FROM members WHERE deleted=0 AND expiry_date<?",
      )
      .get(today).c,
    todayAttendance: db
      .prepare("SELECT COUNT(*) as c FROM attendance WHERE date=?")
      .get(today).c,
    todayRevenue: getTodayRevenue(),
    monthlyRevenue: getMonthlyRevenue(),
    revenueChart: db
      .prepare(
        `
      SELECT strftime('%Y-%m', payment_date) as month, COALESCE(SUM(amount),0) as total
      FROM payments WHERE payment_date >= date('now','-6 months')
      GROUP BY month ORDER BY month ASC
    `,
      )
      .all(),
    recentMembers: db
      .prepare(
        "SELECT * FROM members WHERE deleted=0 ORDER BY created_at DESC LIMIT 5",
      )
      .all(),
  };
}

// ── REPORTS ───────────────────────────────────────────────────────
function getMonthlyReport(month) {
  return db
    .prepare(
      `
    SELECT p.*, m.full_name FROM payments p
    JOIN members m ON p.member_id = m.id
    WHERE strftime('%Y-%m', p.payment_date) = ?
    ORDER BY p.payment_date DESC
  `,
    )
    .all(month);
}

function getExpiredMembers() {
  return db
    .prepare(
      "SELECT * FROM members WHERE deleted=0 AND expiry_date<? ORDER BY expiry_date DESC",
    )
    .all(todayStr());
}

function getAttendanceReport({ startDate, endDate }) {
  return db
    .prepare(
      `
    SELECT a.*, m.full_name FROM attendance a
    JOIN members m ON a.member_id = m.id
    WHERE a.date BETWEEN ? AND ?
    ORDER BY a.date DESC, a.entry_time DESC
  `,
    )
    .all(startDate, endDate);
}

// ── ADMIN MANAGEMENT ──────────────────────────────────────────────
function getAllAdmins() {
  return db
    .prepare(
      "SELECT id, name, email, role, created_at FROM admins ORDER BY created_at DESC",
    )
    .all();
}

function addAdmin({ name, email, password, role }) {
  const hashed = bcrypt.hashSync(password, 10);
  try {
    const result = db
      .prepare(
        `
      INSERT INTO admins (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `,
      )
      .run(name, email, hashed, role || "sub_admin");
    return { success: true, id: result.lastInsertRowid };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function deleteAdmin(id) {
  const admin = db.prepare("SELECT email FROM admins WHERE id = ?").get(id);
  if (admin && admin.email === "admin@gym.com")
    return { success: false, message: "Cannot delete main admin account" };
  db.prepare("DELETE FROM admins WHERE id = ?").run(id);
  return { success: true };
}

// ── EXPORTS ───────────────────────────────────────────────────────
module.exports = {
  login,
  changePassword,
  getAllMembers,
  searchMembers,
  getMemberById,
  addMember,
  updateMember,
  deleteMember,
  renewMember,
  blockMember,
  unblockMember,
  markNotificationSent,
  getTodayAttendance,
  getAttendanceByDate,
  getMemberAttendance,
  addPayment,
  getMemberPayments,
  getAllPayments,
  getTodayRevenue,
  getMonthlyRevenue,
  getDashboardStats,
  getMonthlyReport,
  getExpiredMembers,
  getAttendanceReport,
  getAllAdmins,
  addAdmin,
  deleteAdmin,
};
