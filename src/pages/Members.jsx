import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Edit2,
  RefreshCw,
  Trash2,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { isAfter, parseISO } from "date-fns";

const TYPE_LABELS = { "1_month": "1 Mo", "3_months": "3 Mo", "1_year": "1 Yr" };

export default function Members() {
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | active | expired
  const navigate = useNavigate();

  const load = useCallback(async (q = "") => {
    setLoading(true);
    const data = q.trim()
      ? await window.gymAPI.searchMembers(q.trim())
      : await window.gymAPI.getMembers();
    setMembers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e) => {
    const q = e.target.value;
    setQuery(q);
    load(q);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}"? This is a soft delete.`)) {
      await window.gymAPI.deleteMember(id);
      load(query);
    }
  };

  const isActive = (m) => isAfter(parseISO(m.expiry_date), new Date());

  const filtered = members.filter((m) => {
    if (filter === "active") return isActive(m);
    if (filter === "expired") return !isActive(m);
    return true;
  });

  const activeCount = members.filter(isActive).length;
  const expiredCount = members.filter((m) => !isActive(m)).length;

  const ActionBtn = ({ onClick, title, icon: Icon, hoverColor }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 28,
        height: 28,
        borderRadius: 7,
        border: "1px solid var(--border)",
        background: "var(--bg-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        color: "var(--text-muted)",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = hoverColor;
        e.currentTarget.style.background = `${hoverColor}18`;
        e.currentTarget.style.borderColor = `${hoverColor}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--text-muted)";
        e.currentTarget.style.background = "var(--bg-surface)";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      <Icon size={13} />
    </button>
  );

  return (
    <div style={{ padding: "2rem", height: "100%", overflowY: "auto" }}>
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
          <h1 className="section-header">Members</h1>
          <p className="section-sub">
            {members.length} total · {activeCount} active · {expiredCount}{" "}
            expired
          </p>
        </div>
        <button
          onClick={() => navigate("/members/add")}
          className="btn-primary"
        >
          <Plus size={15} /> Add Member
        </button>
      </div>

      {/* Filters + Search */}
      <div
        className="animate-fade-up stagger-1"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search
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
            value={query}
            onChange={handleSearch}
            className="input"
            style={{ paddingLeft: "2.1rem" }}
            placeholder="Search name or phone..."
          />
        </div>
        {[
          ["all", "All", members.length],
          ["active", "Active", activeCount],
          ["expired", "Expired", expiredCount],
        ].map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              padding: "0.5rem 0.875rem",
              borderRadius: 8,
              fontSize: "0.82rem",
              fontWeight: 600,
              border:
                filter === val
                  ? "1px solid rgba(249,115,22,0.4)"
                  : "1px solid var(--border)",
              background:
                filter === val ? "rgba(249,115,22,0.12)" : "var(--bg-card)",
              color: filter === val ? "#f97316" : "var(--text-muted)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {label}{" "}
            <span style={{ marginLeft: "0.3rem", opacity: 0.7 }}>{count}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        className="card animate-fade-up stagger-2"
        style={{ overflow: "hidden" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                "Member",
                "Phone",
                "Type",
                "Status",
                "Expiry",
                "",
              ].map((h) => (
                <th key={h} className="table-header">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    padding: "4rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      border: "2px solid rgba(249,115,22,0.3)",
                      borderTopColor: "#f97316",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                      margin: "0 auto 0.75rem",
                    }}
                  />
                  Loading members...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "4rem" }}
                >
                  <Users
                    size={40}
                    style={{
                      color: "var(--text-muted)",
                      margin: "0 auto 0.875rem",
                      opacity: 0.4,
                      display: "block",
                    }}
                  />
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    {query ? "No members match your search" : "No members yet"}
                  </p>
                  {!query && (
                    <button
                      onClick={() => navigate("/members/add")}
                      className="btn-primary"
                      style={{ margin: "1rem auto 0", width: "fit-content" }}
                    >
                      Add First Member
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((m, i) => {
                const active = isActive(m);
                return (
                  <tr
                    key={m.id}
                    style={{
                      transition: "background 0.1s",
                      borderBottom: "1px solid var(--border)",
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
                            flexShrink: 0,
                            background: `linear-gradient(135deg, rgba(249,115,22,0.25), rgba(249,115,22,0.08))`,
                            border: "1px solid rgba(249,115,22,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#f97316",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          {m.full_name.charAt(0)}
                        </div>
                        <div>
                          <div
                            style={{
                              color: "var(--text-primary)",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                            }}
                          >
                            {m.full_name}
                          </div>
                          <div
                            style={{
                              color: "var(--text-muted)",
                              fontSize: "0.7rem",
                              marginTop: "0.1rem",
                            }}
                          >
                            ID #{m.id}
                          </div>
                        </div>
                      </div>
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
                    <td className="table-cell" style={{ borderBottom: "none" }}>
                      <span
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-light)",
                          borderRadius: 6,
                          padding: "0.2rem 0.5rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {TYPE_LABELS[m.membership_type] || m.membership_type}
                      </span>
                    </td>
                    <td className="table-cell" style={{ borderBottom: "none" }}>
                      <span
                        className={active ? "badge-active" : "badge-expired"}
                      >
                        {active ? "● Active" : "● Expired"}
                      </span>
                    </td>
                    <td
                      className="table-cell"
                      style={{
                        borderBottom: "none",
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "0.78rem",
                        color: active ? "var(--text-secondary)" : "#fca5a5",
                      }}
                    >
                      {m.expiry_date}
                    </td>
                    <td className="table-cell" style={{ borderBottom: "none" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <ActionBtn
                          onClick={() => navigate(`/members/${m.id}`)}
                          title="View"
                          icon={Eye}
                          hoverColor="#3b82f6"
                        />
                        <ActionBtn
                          onClick={() => navigate(`/members/edit/${m.id}`)}
                          title="Edit"
                          icon={Edit2}
                          hoverColor="#f97316"
                        />
                        <ActionBtn
                          onClick={() => navigate(`/members/${m.id}?renew=1`)}
                          title="Renew"
                          icon={RefreshCw}
                          hoverColor="#22c55e"
                        />
                        <ActionBtn
                          onClick={() => handleDelete(m.id, m.full_name)}
                          title="Delete"
                          icon={Trash2}
                          hoverColor="#ef4444"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
