import React, { useState, useEffect } from "react";
import { format, subMonths } from "date-fns";
import {
  TrendingUp,
  Users,
  Calendar,
  FileText,
  AlertTriangle,
} from "lucide-react";

export default function Reports() {
  const [tab, setTab] = useState("revenue");
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [monthlyData, setMonthlyData] = useState([]);
  const [expired, setExpired] = useState([]);
  const [attRange, setAttRange] = useState({
    startDate: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [attReport, setAttReport] = useState([]);

  useEffect(() => {
    window.gymAPI.getMonthlyReport(month).then(setMonthlyData);
  }, [month]);
  useEffect(() => {
    window.gymAPI.getExpiredMembers().then(setExpired);
  }, []);
  useEffect(() => {
    window.gymAPI.getAttendanceReport(attRange).then(setAttReport);
  }, [attRange]);

  const monthTotal = monthlyData.reduce((s, p) => s + p.amount, 0);

  const TABS = [
    { id: "revenue", label: "Revenue", icon: TrendingUp, color: "#f97316" },
    {
      id: "expired",
      label: "Expired Members",
      icon: AlertTriangle,
      color: "#ef4444",
    },
    { id: "attendance", label: "Attendance", icon: Calendar, color: "#a855f7" },
  ];

  const TYPE_COLOR = {
    membership: "#f97316",
    renewal: "#22c55e",
    supplement: "#3b82f6",
    training: "#a855f7",
    other: "#94a3b8",
  };

  return (
    <div style={{ padding: "2rem", height: "100%", overflowY: "auto" }}>
      <div className="animate-fade-up" style={{ marginBottom: "1.75rem" }}>
        <h1 className="section-header">Reports</h1>
        <p className="section-sub">Business analytics & insights</p>
      </div>

      {/* Tab bar */}
      <div
        className="animate-fade-up stagger-1"
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          background: "var(--bg-card)",
          padding: "0.375rem",
          borderRadius: 12,
          width: "fit-content",
          border: "1px solid var(--border)",
        }}
      >
        {TABS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: 9,
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              border: "none",
              background: tab === id ? `${color}15` : "transparent",
              color: tab === id ? color : "var(--text-muted)",
              boxShadow: tab === id ? `inset 0 0 0 1px ${color}30` : "none",
            }}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Revenue */}
      {tab === "revenue" && (
        <div
          className="animate-fade-up"
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input"
              style={{ width: "auto" }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.625rem 1rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--text-muted)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Total
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 900,
                    color: "#f97316",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  LKR {monthTotal.toLocaleString()}
                </div>
              </div>
              <div
                style={{ width: 1, height: 32, background: "var(--border)" }}
              />
              <div>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--text-muted)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Payments
                </div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 900,
                    color: "var(--text-primary)",
                  }}
                >
                  {monthlyData.length}
                </div>
              </div>
            </div>
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Member", "Amount", "Type", "Date", "Notes"].map((h) => (
                    <th key={h} className="table-header">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthlyData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "4rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <FileText
                        size={36}
                        style={{
                          margin: "0 auto .75rem",
                          display: "block",
                          opacity: 0.3,
                        }}
                      />
                      No payments in {month}
                    </td>
                  </tr>
                ) : (
                  monthlyData.map((p) => (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--bg-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        className="table-cell"
                        style={{
                          borderBottom: "none",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                        }}
                      >
                        {p.full_name}
                      </td>
                      <td
                        className="table-cell"
                        style={{
                          borderBottom: "none",
                          fontFamily: "JetBrains Mono, monospace",
                          fontWeight: 700,
                          color: "#22c55e",
                        }}
                      >
                        LKR {p.amount.toLocaleString()}
                      </td>
                      <td
                        className="table-cell"
                        style={{ borderBottom: "none" }}
                      >
                        <span
                          style={{
                            background: `${TYPE_COLOR[p.payment_type] || "#94a3b8"}15`,
                            color: TYPE_COLOR[p.payment_type] || "#94a3b8",
                            border: `1px solid ${TYPE_COLOR[p.payment_type] || "#94a3b8"}30`,
                            padding: "0.2rem 0.55rem",
                            borderRadius: 6,
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            textTransform: "capitalize",
                          }}
                        >
                          {p.payment_type}
                        </span>
                      </td>
                      <td
                        className="table-cell"
                        style={{
                          borderBottom: "none",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "0.78rem",
                        }}
                      >
                        {p.payment_date}
                      </td>
                      <td
                        className="table-cell"
                        style={{
                          borderBottom: "none",
                          color: "var(--text-muted)",
                          fontSize: "0.8rem",
                        }}
                      >
                        {p.notes || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expired */}
      {tab === "expired" && (
        <div className="animate-fade-up">
          <div className="card" style={{ overflow: "hidden" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem 1.25rem",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <AlertTriangle size={16} style={{ color: "#ef4444" }} />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "var(--text-primary)",
                }}
              >
                Expired Members
              </span>
              <span
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#fca5a5",
                  padding: "0.15rem 0.6rem",
                  borderRadius: 20,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  marginLeft: "auto",
                }}
              >
                {expired.length} expired
              </span>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Name",
                    "Phone",
                    "Type",
                    "Expired On",
                    "Days Overdue",
                    "Action",
                  ].map((h) => (
                    <th key={h} className="table-header">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expired.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        textAlign: "center",
                        padding: "4rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      🎉 No expired members!
                    </td>
                  </tr>
                ) : (
                  expired.map((m) => {
                    const days = Math.floor(
                      (Date.now() - new Date(m.expiry_date)) / 86400000,
                    );
                    return (
                      <tr
                        key={m.id}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          transition: "background 0.1s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--bg-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <td
                          className="table-cell"
                          style={{
                            borderBottom: "none",
                            color: "var(--text-primary)",
                            fontWeight: 600,
                          }}
                        >
                          {m.full_name}
                        </td>
                        <td
                          className="table-cell"
                          style={{
                            borderBottom: "none",
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: "0.8rem",
                          }}
                        >
                          {m.phone || "—"}
                        </td>
                        <td
                          className="table-cell"
                          style={{
                            borderBottom: "none",
                            color: "var(--text-secondary)",
                            textTransform: "capitalize",
                            fontSize: "0.82rem",
                          }}
                        >
                          {m.membership_type?.replace("_", " ")}
                        </td>
                        <td
                          className="table-cell"
                          style={{
                            borderBottom: "none",
                            color: "#fca5a5",
                            fontFamily: "JetBrains Mono, monospace",
                            fontSize: "0.8rem",
                          }}
                        >
                          {m.expiry_date}
                        </td>
                        <td
                          className="table-cell"
                          style={{ borderBottom: "none" }}
                        >
                          <span className="badge-expired">{days}d ago</span>
                        </td>
                        <td
                          className="table-cell"
                          style={{ borderBottom: "none" }}
                        >
                          <a
                            href={`#/members/${m.id}?renew=1`}
                            style={{
                              color: "#22c55e",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              textDecoration: "none",
                              background: "rgba(34,197,94,0.1)",
                              padding: "0.25rem 0.6rem",
                              borderRadius: 6,
                              border: "1px solid rgba(34,197,94,0.2)",
                            }}
                          >
                            Renew →
                          </a>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance */}
      {tab === "attendance" && (
        <div
          className="animate-fade-up"
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {[
              ["From:", "startDate"],
              ["To:", "endDate"],
            ].map(([lbl, key]) => (
              <div
                key={key}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {lbl}
                </span>
                <input
                  type="date"
                  value={attRange[key]}
                  onChange={(e) =>
                    setAttRange((r) => ({ ...r, [key]: e.target.value }))
                  }
                  className="input"
                  style={{ width: "auto" }}
                />
              </div>
            ))}
            <div
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "0.5rem 0.875rem",
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                fontWeight: 600,
              }}
            >
              {attReport.length} records
            </div>
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Member", "Date", "Entry", "Exit", "Duration"].map((h) => (
                    <th key={h} className="table-header">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attReport.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "4rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      <Calendar
                        size={36}
                        style={{
                          margin: "0 auto .75rem",
                          display: "block",
                          opacity: 0.3,
                        }}
                      />
                      No records in selected range
                    </td>
                  </tr>
                ) : (
                  attReport.map((a) => (
                    <tr
                      key={a.id}
                      style={{
                        borderBottom: "1px solid var(--border)",
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--bg-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td
                        className="table-cell"
                        style={{
                          borderBottom: "none",
                          color: "var(--text-primary)",
                          fontWeight: 600,
                        }}
                      >
                        {a.full_name}
                      </td>
                      <td
                        className="table-cell"
                        style={{
                          borderBottom: "none",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "0.8rem",
                        }}
                      >
                        {a.date}
                      </td>
                      <td
                        className="table-cell"
                        style={{
                          borderBottom: "none",
                          color: "#22c55e",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "0.8rem",
                        }}
                      >
                        {a.entry_time || "—"}
                      </td>
                      <td
                        className="table-cell"
                        style={{
                          borderBottom: "none",
                          color: "#ef4444",
                          fontFamily: "JetBrains Mono, monospace",
                          fontSize: "0.8rem",
                        }}
                      >
                        {a.exit_time || "—"}
                      </td>
                      <td
                        className="table-cell"
                        style={{ borderBottom: "none" }}
                      >
                        {a.duration_minutes != null ? (
                          <span
                            style={{
                              color: "#f97316",
                              fontFamily: "JetBrains Mono, monospace",
                              fontWeight: 700,
                              fontSize: "0.8rem",
                            }}
                          >
                            {a.duration_minutes}m
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
