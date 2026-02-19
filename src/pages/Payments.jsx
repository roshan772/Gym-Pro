import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Plus, DollarSign, TrendingUp, CreditCard, Check } from "lucide-react";
import Modal from "../components/Modal";

const TYPE_OPTS = ["membership", "renewal", "supplement", "training", "other"];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [todayRev, setTodayRev] = useState(0);
  const [monthlyRev, setMonthlyRev] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    member_id: "",
    amount: "",
    payment_date: format(new Date(), "yyyy-MM-dd"),
    payment_type: "membership",
    notes: "",
  });

  const load = async () => {
    const [p, m, t, mo] = await Promise.all([
      window.gymAPI.getAllPayments(),
      window.gymAPI.getMembers(),
      window.gymAPI.getTodayRevenue(),
      window.gymAPI.getMonthlyRevenue(),
    ]);
    setPayments(p);
    setMembers(m);
    setTodayRev(t);
    setMonthlyRev(mo);
  };
  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await window.gymAPI.addPayment({
      ...form,
      amount: Number(form.amount),
      member_id: Number(form.member_id),
    });
    setSaved(true);
    setTimeout(() => {
      setModalOpen(false);
      setSaved(false);
      setForm({
        member_id: "",
        amount: "",
        payment_date: format(new Date(), "yyyy-MM-dd"),
        payment_type: "membership",
        notes: "",
      });
      load();
    }, 900);
  };

  const TYPE_COLOR = {
    membership: "#f97316",
    renewal: "#22c55e",
    supplement: "#3b82f6",
    training: "#a855f7",
    other: "#94a3b8",
  };

  return (
    <div style={{ padding: "2rem", height: "100%", overflowY: "auto" }}>
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
          <h1 className="section-header">Payments</h1>
          <p className="section-sub">Revenue tracking & financial records</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={15} /> Add Payment
        </button>
      </div>

      {/* Revenue Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          {
            label: "Today's Revenue",
            val: todayRev,
            color: "#eab308",
            icon: DollarSign,
            bg: "rgba(234,179,8,0.08)",
            border: "rgba(234,179,8,0.2)",
            glow: "rgba(234,179,8,0.15)",
          },
          {
            label: "Monthly Revenue",
            val: monthlyRev,
            color: "#f97316",
            icon: TrendingUp,
            bg: "rgba(249,115,22,0.08)",
            border: "rgba(249,115,22,0.2)",
            glow: "rgba(249,115,22,0.15)",
          },
        ].map(({ label, val, color, icon: Icon, bg, border, glow }) => (
          <div
            key={label}
            className="card animate-fade-up stagger-1"
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = border;
              e.currentTarget.style.boxShadow = `0 8px 32px ${glow}`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "none";
            }}
            style={{
              padding: "1.5rem",
              position: "relative",
              overflow: "hidden",
              transition: "all 0.25s",
              cursor: "default",
              background: "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 100,
                height: 100,
                background: `radial-gradient(circle at top right, ${bg} 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
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
                    marginBottom: "0.5rem",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "1.9rem",
                    fontWeight: 900,
                    color,
                    letterSpacing: "-0.03em",
                  }}
                >
                  LKR {val.toLocaleString()}
                </div>
              </div>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: bg,
                  border: `1px solid ${border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        className="card animate-fade-up stagger-2"
        style={{ overflow: "hidden" }}
      >
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              fontWeight: 700,
              fontSize: "0.9rem",
              color: "var(--text-primary)",
            }}
          >
            All Payments
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {payments.length} records
          </div>
        </div>
        <div style={{ maxHeight: 480, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ position: "sticky", top: 0, zIndex: 1 }}>
                {["Member", "Amount", "Type", "Date", "Notes"].map((h) => (
                  <th key={h} className="table-header">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: "4rem",
                      color: "var(--text-muted)",
                    }}
                  >
                    <CreditCard
                      size={36}
                      style={{
                        margin: "0 auto 0.75rem",
                        display: "block",
                        opacity: 0.3,
                      }}
                    />
                    No payments yet
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
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
                        fontSize: "0.85rem",
                      }}
                    >
                      LKR {p.amount.toLocaleString()}
                    </td>
                    <td className="table-cell" style={{ borderBottom: "none" }}>
                      <span
                        style={{
                          background: `${TYPE_COLOR[p.payment_type] || "#94a3b8"}15`,
                          color: TYPE_COLOR[p.payment_type] || "#94a3b8",
                          border: `1px solid ${TYPE_COLOR[p.payment_type] || "#94a3b8"}30`,
                          padding: "0.2rem 0.6rem",
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

      {/* Add Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Payment"
      >
        <form
          onSubmit={handleAdd}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div>
            <label className="label">Member *</label>
            <select
              value={form.member_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, member_id: e.target.value }))
              }
              className="input"
              required
            >
              <option value="">Select member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name}
                </option>
              ))}
            </select>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
            }}
          >
            <div>
              <label className="label">Amount (LKR) *</label>
              <div style={{ position: "relative" }}>
                <DollarSign
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
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, amount: e.target.value }))
                  }
                  className="input"
                  style={{ paddingLeft: "2.2rem" }}
                  min="0"
                  required
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={form.payment_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, payment_date: e.target.value }))
                }
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Payment Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
              {TYPE_OPTS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, payment_type: t }))}
                  style={{
                    padding: "0.35rem 0.75rem",
                    borderRadius: 8,
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textTransform: "capitalize",
                    background:
                      form.payment_type === t
                        ? `${TYPE_COLOR[t]}15`
                        : "var(--bg-surface)",
                    border:
                      form.payment_type === t
                        ? `1px solid ${TYPE_COLOR[t]}50`
                        : "1px solid var(--border)",
                    color:
                      form.payment_type === t
                        ? TYPE_COLOR[t]
                        : "var(--text-muted)",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              className="input"
              placeholder="Any notes..."
            />
          </div>
          <div
            style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}
          >
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              {saved ? (
                <>
                  <Check size={14} /> Saved!
                </>
              ) : (
                <>
                  <Plus size={14} /> Save Payment
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
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
