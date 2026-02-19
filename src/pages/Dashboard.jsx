import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  DollarSign,
  TrendingUp,
  Plus,
  Fingerprint,
  CreditCard,
  Search,
  ArrowUpRight,
  AlertTriangle, // ✅ Add this import
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import StatCard from "../components/StatCard";
import { format, isAfter, parseISO } from "date-fns";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-light)",
        borderRadius: 10,
        padding: "0.75rem 1rem",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
      }}
    >
      <p
        style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          marginBottom: "0.3rem",
        }}
      >
        Month {label}
      </p>
      <p style={{ fontSize: "1rem", fontWeight: 700, color: "#f97316" }}>
        LKR {payload[0].value?.toLocaleString()}
      </p>
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.gymAPI.getDashboardStats().then(setStats);
  }, []);

  if (!stats)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid rgba(249,115,22,0.3)",
              borderTopColor: "#f97316",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );

  const chartData = stats.revenueChart.map((r) => ({
    month: r.month?.slice(5),
    Revenue: Math.round(r.total || 0),
  }));

  const quickActions = [
    {
      icon: Plus,
      label: "Add Member",
      sub: "Register new member",
      to: "/members/add",
      color: "#f97316",
    },
    {
      icon: Search,
      label: "Members",
      sub: "View all members",
      to: "/members",
      color: "#3b82f6",
    },
    {
      icon: Fingerprint,
      label: "Attendance",
      sub: "Scan & view log",
      to: "/attendance",
      color: "#a855f7",
    },
    {
      icon: CreditCard,
      label: "Payments",
      sub: "Revenue & records",
      to: "/payments",
      color: "#22c55e",
    },
  ];

  return (
    <div style={{ padding: "2rem", overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div
        className="animate-fade-up"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "1.75rem",
        }}
      >
        <div>
          <h1 className="section-header">Dashboard</h1>
          <p className="section-sub">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <button
          onClick={() => navigate("/members/add")}
          className="btn-primary"
        >
          <Plus size={15} /> Add Member
        </button>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <StatCard
          icon={Users}
          label="Total Members"
          value={stats.total}
          color="blue"
          index={0}
        />
        <StatCard
          icon={UserCheck}
          label="Active Members"
          value={stats.active}
          color="green"
          index={1}
        />
        <StatCard
          icon={UserX}
          label="Expired Members"
          value={stats.expired}
          color="red"
          index={2}
        />
        <StatCard
          icon={Calendar}
          label="Today's Attendance"
          value={stats.todayAttendance}
          sub="check-ins today"
          color="purple"
          index={3}
        />
        <StatCard
          icon={DollarSign}
          label="Today's Revenue"
          value={`LKR ${stats.todayRevenue.toLocaleString()}`}
          color="yellow"
          index={4}
        />
        <StatCard
          icon={TrendingUp}
          label="Monthly Revenue"
          value={`LKR ${stats.monthlyRevenue.toLocaleString()}`}
          color="orange"
          index={5}
        />
      </div>

      {/* ✅ Expired Members Alert Banner */}
      {stats.expired > 0 && (
        <div
          className="card animate-fade-up stagger-6"
          style={{
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => navigate("/expired-alerts")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.12)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={22} style={{ color: "#ef4444" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#fca5a5",
              }}
            >
              {stats.expired} expired member{stats.expired !== 1 ? "s" : ""}{" "}
              need renewal reminder
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#8b9cbf",
                marginTop: "0.15rem",
              }}
            >
              Click to send WhatsApp notifications manually
            </div>
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            View <ArrowUpRight size={14} />
          </div>
        </div>
      )}

      {/* Bottom Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Quick Actions */}
        <div
          className="card animate-fade-up stagger-3"
          style={{ padding: "1.25rem" }}
        >
          <div
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.875rem",
            }}
          >
            Quick Actions
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {quickActions.map(({ icon: Icon, label, sub, to, color }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.625rem 0.75rem",
                  borderRadius: 10,
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  textAlign: "left",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.borderColor = "var(--border-light)";
                  e.currentTarget.style.transform = "translateX(3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-surface)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={14} color={color} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
                  >
                    {sub}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <div
          className="card animate-fade-up stagger-4"
          style={{ padding: "1.5rem" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Revenue
              </div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginTop: "0.1rem",
                }}
              >
                Last 6 Months
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "var(--green-dim)",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: 8,
                padding: "0.3rem 0.65rem",
              }}
            >
              <TrendingUp size={12} color="#22c55e" />
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#22c55e",
                }}
              >
                Revenue
              </span>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={chartData} barSize={28}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="transparent"
                  tick={{
                    fontSize: 11,
                    fill: "var(--text-muted)",
                    fontFamily: "Outfit",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="transparent"
                  tick={{
                    fontSize: 11,
                    fill: "var(--text-muted)",
                    fontFamily: "Outfit",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(255,255,255,0.03)", radius: 6 }}
                />
                <Bar
                  dataKey="Revenue"
                  fill="url(#barGrad)"
                  radius={[6, 6, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
                    <stop offset="100%" stopColor="#c2410c" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: 190,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted)",
                gap: "0.5rem",
              }}
            >
              <TrendingUp size={32} opacity={0.3} />
              <p style={{ fontSize: "0.85rem" }}>No revenue data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Members */}
      {stats.recentMembers?.length > 0 && (
        <div
          className="card animate-fade-up stagger-5"
          style={{ overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Recent Members
            </div>
            <button
              onClick={() => navigate("/members")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#f97316",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              View all <ArrowUpRight size={13} />
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Member", "Phone", "Type", "Status", "Expiry"].map((h) => (
                  <th key={h} className="table-header">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.recentMembers.map((m) => {
                const active = isAfter(parseISO(m.expiry_date), new Date());
                return (
                  <tr
                    key={m.id}
                    onClick={() => navigate(`/members/${m.id}`)}
                    style={{ cursor: "pointer", transition: "background 0.1s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td className="table-cell">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background:
                              "linear-gradient(135deg, rgba(249,115,22,0.3), rgba(249,115,22,0.1))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#f97316",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {m.full_name.charAt(0)}
                        </div>
                        <span
                          style={{
                            color: "var(--text-primary)",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                          }}
                        >
                          {m.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell">{m.phone || "—"}</td>
                    <td
                      className="table-cell"
                      style={{
                        color: "var(--text-secondary)",
                        textTransform: "capitalize",
                      }}
                    >
                      {m.membership_type?.replace("_", " ")}
                    </td>
                    <td className="table-cell">
                      <span
                        className={active ? "badge-active" : "badge-expired"}
                      >
                        {active ? "Active" : "Expired"}
                      </span>
                    </td>
                    <td
                      className="table-cell"
                      style={{
                        color: active ? "var(--text-secondary)" : "#fca5a5",
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "0.8rem",
                      }}
                    >
                      {m.expiry_date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
