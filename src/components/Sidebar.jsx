import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Fingerprint,
  CreditCard,
  BarChart3,
  Settings as SettingsIcon,
  LogOut,
  Dumbbell,
  ChevronRight,
  UserCog,
  Bell,
} from "lucide-react";

const NAV = [
  {
    to: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    color: "#f97316",
    roles: ["admin", "sub_admin"],
  },
  {
    to: "/members",
    icon: Users,
    label: "Members",
    color: "#3b82f6",
    roles: ["admin", "sub_admin"],
  },
  {
    to: "/attendance",
    icon: Fingerprint,
    label: "Attendance",
    color: "#a855f7",
    roles: ["admin", "sub_admin"],
  },
  {
    to: "/payments",
    icon: CreditCard,
    label: "Payments",
    color: "#22c55e",
    roles: ["admin", "sub_admin"],
  },
  {
    to: "/expired-alerts",
    icon: Bell,
    label: "Expired Alerts",
    color: "#ef4444",
    roles: ["admin", "sub_admin"],
  },
  {
    to: "/reports",
    icon: BarChart3,
    label: "Reports",
    color: "#eab308",
    roles: ["admin"],
  }, // ✅ Admin only
  {
    to: "/admins",
    icon: UserCog,
    label: "Admins",
    color: "#ec4899",
    roles: ["admin"],
  }, // ✅ Admin only
  {
    to: "/settings",
    icon: SettingsIcon,
    label: "Settings",
    color: "#94a3b8",
    roles: ["admin", "sub_admin"],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { admin, logout } = useAuth();
  const [hovered, setHovered] = useState(null);

  // Safety check
  if (!admin) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#080c14",
        }}
      >
        <p style={{ color: "#8b9cbf" }}>Loading...</p>
      </div>
    );
  }

  // ✅ Filter navigation items based on user role
  const visibleNav = NAV.filter((item) => item.roles.includes(admin.role));

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "var(--bg-base)",
        overflow: "hidden",
      }}
    >
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: "240px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow top */}
        <div
          style={{
            position: "absolute",
            top: -60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 200,
            height: 120,
            background:
              "radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div
          style={{
            padding: "1.5rem 1.25rem 1.25rem",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                background: "linear-gradient(135deg, #f97316, #c2410c)",
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(249,115,22,0.35)",
                flexShrink: 0,
              }}
            >
              <Dumbbell size={20} color="white" />
            </div>
            <div>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.02em",
                }}
              >
                GymPro
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {admin.role === "admin" ? "Admin Panel" : "Sub-Admin Panel"}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav
          style={{
            flex: 1,
            padding: "0.875rem 0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              color: "var(--text-muted)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0 0.5rem",
              marginBottom: "0.5rem",
            }}
          >
            Navigation
          </div>
          {visibleNav.map(({ to, icon: Icon, label, color }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={`nav-item ${isActive ? "nav-item-active" : "nav-item-inactive"}`}
                onMouseEnter={() => setHovered(to)}
                onMouseLeave={() => setHovered(null)}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isActive
                      ? `${color}20`
                      : hovered === to
                        ? "rgba(255,255,255,0.05)"
                        : "transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <Icon
                    size={16}
                    color={
                      isActive
                        ? color
                        : hovered === to
                          ? "var(--text-primary)"
                          : "var(--text-muted)"
                    }
                  />
                </div>
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && (
                  <ChevronRight size={14} style={{ opacity: 0.5 }} />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: "0.875rem 0.75rem",
            borderTop: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              padding: "0.625rem 0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background:
                  admin.role === "admin"
                    ? "linear-gradient(135deg, #f97316, #c2410c)"
                    : "linear-gradient(135deg, #3b82f6, #2563eb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "0.85rem",
                fontWeight: 700,
                flexShrink: 0,
                boxShadow:
                  admin.role === "admin"
                    ? "0 2px 8px rgba(249,115,22,0.3)"
                    : "0 2px 8px rgba(59,130,246,0.3)",
              }}
            >
              {(admin.name || "A").charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {admin.name || "Admin"}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-muted)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {admin.email || ""}
              </div>
              {/* ✅ Show role badge */}
              {admin.role === "sub_admin" && (
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#3b82f6",
                    background: "rgba(59,130,246,0.1)",
                    padding: "0.1rem 0.4rem",
                    borderRadius: 4,
                    marginTop: "0.2rem",
                    display: "inline-block",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Sub-Admin
                </div>
              )}
            </div>
          </div>
          <button
            onClick={logout}
            className="nav-item nav-item-inactive"
            style={{
              width: "100%",
              background: "none",
              border: "1px solid transparent",
              fontSize: "0.82rem",
              color: "#f87171",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(239,68,68,0.08)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main
        style={{ flex: 1, overflowY: "auto", background: "var(--bg-base)" }}
      >
        <Outlet />
      </main>
    </div>
  );
}
