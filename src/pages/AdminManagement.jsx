import React, { useEffect, useState, useCallback } from "react";
import { Shield, Plus, Trash2, UserCog, Check, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";

const styles = {
  page: { padding: "2rem", height: "100%", overflowY: "auto" },
  card: {
    background: "#131d2e",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
};

export default function AdminManagement() {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "sub_admin",
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const data = await window.gymAPI.getAdmins();
    setAdmins(data);
  }, []);

  useEffect(() => {
    // Only admin can access this page
    if (admin?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    load();
  }, [admin, load, navigate]);

  const handleAdd = useCallback(
    async (e) => {
      e.preventDefault();
      setError("");
      const res = await window.gymAPI.addAdmin(form);
      if (res.success) {
        setSaved(true);
        setTimeout(() => {
          setModalOpen(false);
          setSaved(false);
          setForm({ name: "", email: "", password: "", role: "sub_admin" });
          load();
        }, 900);
      } else {
        setError(res.message || "Failed to add admin");
      }
    },
    [form, load],
  );

  const handleDelete = useCallback(
    async (id, name) => {
      if (window.confirm(`Delete admin "${name}"?`)) {
        const res = await window.gymAPI.deleteAdmin(id);
        if (res.success) {
          load();
        } else {
          alert(res.message);
        }
      }
    },
    [load],
  );

  const handleChange = useCallback((e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }, []);

  // Don't render if not admin
  if (admin?.role !== "admin") return null;

  return (
    <div style={styles.page}>
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
          <h1 className="section-header">Admin Management</h1>
          <p className="section-sub">Manage admin and sub-admin accounts</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={15} /> Add Sub-Admin
        </button>
      </div>

      {/* Info Card */}
      <div
        className="animate-fade-up stagger-1"
        style={{
          background: "rgba(59,130,246,0.08)",
          border: "1px solid rgba(59,130,246,0.2)",
          borderRadius: 12,
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "flex-start",
          gap: "1rem",
        }}
      >
        <Shield
          size={20}
          style={{ color: "#3b82f6", flexShrink: 0, marginTop: 2 }}
        />
        <div>
          <div
            style={{
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "#60a5fa",
              marginBottom: "0.35rem",
            }}
          >
            Sub-Admin Permissions
          </div>
          <div
            style={{ fontSize: "0.8rem", color: "#8b9cbf", lineHeight: 1.6 }}
          >
            Sub-admins can: <strong>Add Members</strong>,{" "}
            <strong>Add Payments</strong>, <strong>View Attendance</strong>,{" "}
            <strong>Scan Fingerprints</strong>
            <br />
            Sub-admins cannot: View Reports, View Revenue Details, Manage
            Settings, Delete Members, Manage Admins
          </div>
        </div>
      </div>

      {/* Admin Table */}
      <div className="card animate-fade-up stagger-2" style={styles.card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Email", "Role", "Created", "Actions"].map((h) => (
                <th key={h} className="table-header">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <UserCog
                    size={36}
                    style={{
                      margin: "0 auto 0.75rem",
                      display: "block",
                      opacity: 0.3,
                    }}
                  />
                  No admins found
                </td>
              </tr>
            ) : (
              admins.map((a) => (
                <tr
                  key={a.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td className="table-cell" style={{ borderBottom: "none" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background:
                            a.role === "admin"
                              ? "linear-gradient(135deg, #f97316, #c2410c)"
                              : "rgba(59,130,246,0.15)",
                          border:
                            a.role === "admin"
                              ? "1px solid rgba(249,115,22,0.3)"
                              : "1px solid rgba(59,130,246,0.25)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: a.role === "admin" ? "white" : "#3b82f6",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          flexShrink: 0,
                        }}
                      >
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "#f0f4ff",
                          fontSize: "0.875rem",
                        }}
                      >
                        {a.name}
                      </span>
                    </div>
                  </td>
                  <td
                    className="table-cell"
                    style={{
                      borderBottom: "none",
                      fontFamily: "JetBrains Mono, monospace",
                      fontSize: "0.8rem",
                      color: "#8b9cbf",
                    }}
                  >
                    {a.email}
                  </td>
                  <td className="table-cell" style={{ borderBottom: "none" }}>
                    {a.role === "admin" ? (
                      <span
                        style={{
                          background: "rgba(249,115,22,0.12)",
                          color: "#f97316",
                          border: "1px solid rgba(249,115,22,0.25)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: 6,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <Shield size={10} /> Admin
                      </span>
                    ) : (
                      <span
                        style={{
                          background: "rgba(59,130,246,0.12)",
                          color: "#3b82f6",
                          border: "1px solid rgba(59,130,246,0.25)",
                          padding: "0.2rem 0.6rem",
                          borderRadius: 6,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <UserCog size={10} /> Sub-Admin
                      </span>
                    )}
                  </td>
                  <td
                    className="table-cell"
                    style={{
                      borderBottom: "none",
                      fontSize: "0.8rem",
                      color: "#8b9cbf",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    {a.created_at?.split(" ")[0] || "N/A"}
                  </td>
                  <td className="table-cell" style={{ borderBottom: "none" }}>
                    {a.email !== "admin@gym.com" && (
                      <button
                        onClick={() => handleDelete(a.id, a.name)}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          border: "1px solid rgba(255,255,255,0.06)",
                          background: "#0d1424",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#4a5a78",
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#ef4444";
                          e.currentTarget.style.background =
                            "rgba(239,68,68,0.1)";
                          e.currentTarget.style.borderColor =
                            "rgba(239,68,68,0.3)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#4a5a78";
                          e.currentTarget.style.background = "#0d1424";
                          e.currentTarget.style.borderColor =
                            "rgba(255,255,255,0.06)";
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Sub-Admin Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setError("");
        }}
        title="Add Sub-Admin"
      >
        <form
          onSubmit={handleAdd}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label className="label">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input"
              required
              autoComplete="off"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input"
              required
              autoComplete="off"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label className="label">Password *</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="input"
              required
              autoComplete="off"
              placeholder="Minimum 6 characters"
              minLength={6}
            />
          </div>

          <div
            style={{
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
              borderRadius: 10,
              padding: "0.875rem",
              fontSize: "0.8rem",
              color: "#8b9cbf",
            }}
          >
            <strong style={{ color: "#3b82f6" }}>Sub-Admin Permissions:</strong>
            <ul
              style={{
                marginTop: "0.5rem",
                marginLeft: "1.25rem",
                lineHeight: 1.7,
              }}
            >
              <li>✅ Add Members</li>
              <li>✅ Add Payments</li>
              <li>✅ View Attendance</li>
              <li>❌ View Reports</li>
              <li>❌ View Revenue Details</li>
              <li>❌ Manage Settings</li>
            </ul>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8,
                padding: "0.75rem",
                color: "#fca5a5",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}
          >
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={saved}
            >
              {saved ? (
                <>
                  <Check size={14} /> Added!
                </>
              ) : (
                <>
                  <Plus size={14} /> Add Sub-Admin
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setError("");
              }}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
