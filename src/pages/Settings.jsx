import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  LogOut,
  Shield,
  CheckCircle,
  AlertCircle,
  Dumbbell,
  Key,
  Info,
} from "lucide-react";

export default function Settings() {
  const admin = JSON.parse(sessionStorage.getItem("gymAdmin") || "{}");
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (form.newPassword.length < 6)
      return setMsg({
        type: "error",
        text: "Password must be at least 6 characters",
      });
    if (form.newPassword !== form.confirmPassword)
      return setMsg({ type: "error", text: "Passwords do not match" });
    setLoading(true);
    const res = await window.gymAPI.changePassword(form);
    setMsg({
      type: res.success ? "success" : "error",
      text: res.success ? "Password updated successfully!" : res.message,
    });
    if (res.success)
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setLoading(false);
  };

  const logout = () => {
    sessionStorage.removeItem("gymAdmin");
    navigate("/login");
  };

  const Section = ({ icon: Icon, iconColor, title, children }) => (
    <div className="card animate-fade-up" style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: `${iconColor}15`,
            border: `1px solid ${iconColor}25`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={14} color={iconColor} />
        </div>
        <h2
          style={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {title}
        </h2>
      </div>
      <div style={{ padding: "1.5rem" }}>{children}</div>
    </div>
  );

  return (
    <div style={{ padding: "2rem", height: "100%", overflowY: "auto" }}>
      <div className="animate-fade-up" style={{ marginBottom: "1.75rem" }}>
        <h1 className="section-header">Settings</h1>
        <p className="section-sub">Account, security & app information</p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "1.25rem",
          maxWidth: 860,
          alignItems: "start",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Profile */}
          <Section icon={Shield} iconColor="#f97316" title="Admin Profile">
            <div
              style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 18,
                  flexShrink: 0,
                  background: "linear-gradient(135deg, #f97316, #c2410c)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  color: "white",
                  boxShadow: "0 6px 24px rgba(249,115,22,0.35)",
                }}
              >
                {(admin.name || "A").charAt(0)}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {admin.name || "Admin"}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    marginTop: "0.2rem",
                  }}
                >
                  {admin.email}
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    marginTop: "0.5rem",
                    padding: "0.25rem 0.75rem",
                    borderRadius: 20,
                    background: "rgba(249,115,22,0.1)",
                    border: "1px solid rgba(249,115,22,0.2)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#f97316",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  <Shield size={10} /> Administrator
                </span>
              </div>
            </div>
          </Section>

          {/* Change Password */}
          <Section icon={Key} iconColor="#3b82f6" title="Change Password">
            <form
              onSubmit={handleChangePassword}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {[
                ["currentPassword", "Current Password"],
                ["newPassword", "New Password"],
                ["confirmPassword", "Confirm New Password"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="label">{label}</label>
                  <div style={{ position: "relative" }}>
                    <Lock
                      size={14}
                      style={{
                        position: "absolute",
                        left: 11,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--text-muted)",
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      type="password"
                      value={form[field]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [field]: e.target.value }))
                      }
                      className="input"
                      style={{ paddingLeft: "2.2rem" }}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              ))}

              {msg && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1rem",
                    borderRadius: 10,
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    background:
                      msg.type === "success"
                        ? "rgba(34,197,94,0.1)"
                        : "rgba(239,68,68,0.1)",
                    border: `1px solid ${msg.type === "success" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                    color: msg.type === "success" ? "#4ade80" : "#fca5a5",
                  }}
                >
                  {msg.type === "success" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  {msg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: "fit-content" }}
              >
                <Key size={14} /> {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </Section>

          {/* Logout */}
          <Section icon={LogOut} iconColor="#ef4444" title="Session">
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                marginBottom: "1rem",
              }}
            >
              Signed in as{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                {admin.email}
              </span>
            </p>
            <button onClick={logout} className="btn-danger">
              <LogOut size={15} /> Sign Out
            </button>
          </Section>
        </div>

        {/* Right: App Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            className="card animate-fade-up stagger-1"
            style={{ padding: "1.5rem", textAlign: "center" }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                background: "linear-gradient(135deg, #f97316, #c2410c)",
                borderRadius: 16,
                margin: "0 auto 1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 6px 24px rgba(249,115,22,0.3)",
              }}
            >
              <Dumbbell size={26} color="white" />
            </div>
            <div
              style={{
                fontSize: "1.1rem",
                fontWeight: 900,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              GymPro Admin
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginTop: "0.3rem",
              }}
            >
              Version 1.0.0
            </div>
          </div>

          <div
            className="card animate-fade-up stagger-2"
            style={{ padding: "1.25rem" }}
          >
            <div
              style={{
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Info size={11} /> App Info
            </div>
            {[
              ["Framework", "Electron + React"],
              ["Database", "SQLite (Local)"],
              ["UI Library", "Tailwind v4"],
              ["Platform", "Desktop"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <span
                  style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
                >
                  {k}
                </span>
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                  }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>


        </div>
      </div>
    </div>
  );
}
