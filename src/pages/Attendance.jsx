import React, { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import {
  LogIn,
  LogOut,
  Timer,
  Clock,
  Users,
} from "lucide-react";

// ✅ ALL static styles outside component — prevents re-render focus loss
const styles = {
  page: { padding: "2rem", height: "100%", overflowY: "auto" },
  header: { marginBottom: "1.75rem" },
  grid: {
    display: "grid",
    gridTemplateColumns: "300px 1fr",
    gap: "1.25rem",
    alignItems: "start",
  },
  leftCol: { display: "flex", flexDirection: "column", gap: "1rem" },
  card: {
    background: "#131d2e",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "1.5rem",
  },
  smallCard: {
    background: "#131d2e",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "1.25rem",
  },
  sectionLbl: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#4a5a78",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "1.25rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  scanInput: {
    textAlign: "center",
    fontFamily: "JetBrains Mono, monospace",
    letterSpacing: "0.05em",
    marginBottom: "0.625rem",
  },
  hint: {
    fontSize: "0.7rem",
    color: "#4a5a78",
    textAlign: "center",
    marginTop: "0.75rem",
    lineHeight: 1.5,
  },
  hintCode: {
    color: "#a855f7",
    background: "rgba(168,85,247,0.1)",
    padding: "0.1rem 0.3rem",
    borderRadius: 4,
  },
  statRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.625rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  statLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.82rem",
    color: "#8b9cbf",
  },
  tableCard: {
    background: "#131d2e",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.25rem",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  tableTitle: { fontWeight: 700, fontSize: "0.9rem", color: "#f0f4ff" },
  tableCount: { fontSize: "0.75rem", color: "#4a5a78" },
  tableBody: { maxHeight: 520, overflowY: "auto" },
  emptyCell: { textAlign: "center", padding: "4rem", color: "#4a5a78" },
  emptyIcon: { margin: "0 auto 0.75rem", display: "block", opacity: 0.3 },
  dateInput: { width: "auto" },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "rgba(249,115,22,0.12)",
    border: "1px solid rgba(249,115,22,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f97316",
    fontSize: "0.75rem",
    fontWeight: 700,
    flexShrink: 0,
  },
  memberInfo: { display: "flex", alignItems: "center", gap: "0.5rem" },
  memberName: { fontSize: "0.85rem", fontWeight: 600, color: "#f0f4ff" },
  memberPhone: { fontSize: "0.7rem", color: "#4a5a78" },
  entryTime: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "0.8rem",
    color: "#22c55e",
  },
  exitTime: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "0.8rem",
    color: "#ef4444",
  },
  duration: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    color: "#f97316",
    fontSize: "0.8rem",
    fontWeight: 600,
    background: "rgba(249,115,22,0.1)",
    padding: "0.2rem 0.5rem",
    borderRadius: 6,
    width: "fit-content",
    fontFamily: "JetBrains Mono, monospace",
  },
  insideBadge: {
    background: "rgba(234,179,8,0.12)",
    color: "#eab308",
    border: "1px solid rgba(234,179,8,0.25)",
    padding: "0.2rem 0.6rem",
    borderRadius: 20,
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
  },
};

export default function Attendance() {
  const [todayLog, setTodayLog] = useState([]);
  const [filterDate, setFilterDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [filtered, setFiltered] = useState([]);

  // ─── Load data ────────────────────────────────────────────────────
  const loadToday = useCallback(() => {
    window.gymAPI.getTodayAttendance().then(setTodayLog);
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  useEffect(() => {
    window.gymAPI.getAttendanceByDate(filterDate).then(setFiltered);
  }, [filterDate]);

  const isToday = filterDate === format(new Date(), "yyyy-MM-dd");
  const displayList = isToday ? todayLog : filtered;
  const inside = todayLog.filter((a) => a.entry_time && !a.exit_time).length;
  const complete = todayLog.filter((a) => a.exit_time).length;

  // ─── Handlers — all stable with useCallback ───────────────────────
  const handleDateChange = useCallback((e) => {
    setFilterDate(e.target.value);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      {/* Header */}
      <div className="animate-fade-up" style={styles.header}>
        <h1 className="section-header">Attendance</h1>
        <p className="section-sub">
          Access log — {format(new Date(), "EEEE, MMMM d")}
        </p>
      </div>

      <div style={styles.grid}>
        {/* ── Left Column ─────────────────────────────────────── */}
        <div style={styles.leftCol}>
          {/* Device info card */}
          <div className="card animate-fade-up stagger-1" style={styles.card}>
            <div style={styles.sectionLbl}>
              <Clock size={12} style={{ color: "#f97316" }} />
              Access Control
            </div>
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  margin: "0 auto 1.25rem",
                  background: "rgba(249,115,22,0.08)",
                  border: "2px solid rgba(249,115,22,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clock size={40} color="rgba(249,115,22,0.5)" />
              </div>
              <div
                style={{
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  color: "#f0f4ff",
                  marginBottom: "0.5rem",
                }}
              >
                Managed by Device
              </div>
              <p style={{ fontSize: "0.75rem", color: "#4a5a78", lineHeight: 1.6 }}>
                Attendance is logged automatically when members scan their
                fingerprint at the Hikvision terminal.
              </p>
            </div>
          </div>

          {/* Today stats card */}
          <div
            className="card animate-fade-up stagger-2"
            style={styles.smallCard}
          >
            <div style={styles.sectionLbl}>Today's Stats</div>

            {[
              {
                label: "Total Entries",
                val: todayLog.length,
                color: "#f97316",
                Icon: LogIn,
              },
              {
                label: "Still Inside",
                val: inside,
                color: "#22c55e",
                Icon: Users,
              },
              {
                label: "Completed",
                val: complete,
                color: "#3b82f6",
                Icon: LogOut,
              },
            ].map(({ label, val, color, Icon }) => (
              <div key={label} style={styles.statRow}>
                <div style={styles.statLabel}>
                  <Icon size={13} color={color} />
                  {label}
                </div>
                <span style={{ fontSize: "1.1rem", fontWeight: 800, color }}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Column — Log Table ─────────────────────── */}
        <div className="animate-fade-up stagger-2" style={styles.tableCard}>
          {/* Table header */}
          <div style={styles.tableHeader}>
            <div>
              <div style={styles.tableTitle}>Attendance Log</div>
              <div style={styles.tableCount}>{displayList.length} records</div>
            </div>

            {/* ✅ Date input with stable onChange handler */}
            <input
              type="date"
              value={filterDate}
              onChange={handleDateChange}
              className="input"
              style={styles.dateInput}
            />
          </div>

          {/* Table body */}
          <div style={styles.tableBody}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ position: "sticky", top: 0, zIndex: 1 }}>
                  {["Member", "Entry", "Exit", "Duration", "Status"].map(
                    (h) => (
                      <th key={h} className="table-header">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {displayList.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyCell}>
                      <Clock size={36} style={styles.emptyIcon} />
                      No attendance records for this date
                    </td>
                  </tr>
                ) : (
                  displayList.map((a) => <TableRow key={a.id} a={a} />)
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ✅ Separate component = stable, no re-render issues
function TableRow({ a }) {
  const [hovered, setHovered] = useState(false);

  const handleEnter = useCallback(() => setHovered(true), []);
  const handleLeave = useCallback(() => setHovered(false), []);

  return (
    <tr
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: hovered ? "#1a2540" : "transparent",
        transition: "background 0.1s",
      }}
    >
      {/* Member */}
      <td className="table-cell" style={{ borderBottom: "none" }}>
        <div style={styles.memberInfo}>
          <div style={styles.memberAvatar}>{a.full_name?.charAt(0)}</div>
          <div>
            <div style={styles.memberName}>{a.full_name}</div>
            <div style={styles.memberPhone}>{a.phone}</div>
          </div>
        </div>
      </td>

      {/* Entry */}
      <td className="table-cell" style={{ borderBottom: "none" }}>
        <span style={styles.entryTime}>
          <LogIn size={11} /> {a.entry_time || "—"}
        </span>
      </td>

      {/* Exit */}
      <td className="table-cell" style={{ borderBottom: "none" }}>
        <span style={styles.exitTime}>
          <LogOut size={11} /> {a.exit_time || "—"}
        </span>
      </td>

      {/* Duration */}
      <td className="table-cell" style={{ borderBottom: "none" }}>
        {a.duration_minutes != null ? (
          <span style={styles.duration}>
            <Timer size={11} /> {a.duration_minutes}m
          </span>
        ) : (
          <span style={{ color: "#4a5a78", fontSize: "0.8rem" }}>—</span>
        )}
      </td>

      {/* Status */}
      <td className="table-cell" style={{ borderBottom: "none" }}>
        {a.exit_time ? (
          <span className="badge-active">Done</span>
        ) : a.entry_time ? (
          <span style={styles.insideBadge}>● Inside</span>
        ) : null}
      </td>
    </tr>
  );
}
