import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit2,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
  Calendar,
  LogIn,
  LogOut,
  Timer,
  CreditCard,
  Check,
  DollarSign,
} from "lucide-react";
import { isAfter, parseISO, format, differenceInDays } from "date-fns";
import Modal from "../components/Modal";

const TYPE_LABELS = {
  "1_month": "1 Month",
  "3_months": "3 Months",
  "1_year": "1 Year",
};
const FEES = { "1_month": 3000, "3_months": 8000, "1_year": 25000 };

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [renewOpen, setRenewOpen] = useState(false);
  const [renewForm, setRenewForm] = useState({
    membershipType: "1_month",
    fee: FEES["1_month"],
    startDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [renewed, setRenewed] = useState(false);

  const reload = () => {
    const mid = Number(id);
    window.gymAPI.getMemberById(mid).then(setMember);
    window.gymAPI.getMemberAttendance(mid).then(setAttendance);
    window.gymAPI.getMemberPayments(mid).then(setPayments);
  };

  useEffect(() => {
    reload();
    if (searchParams.get("renew")) setRenewOpen(true);
  }, [id]);

  const handleRenew = async () => {
    const res = await window.gymAPI.renewMember({
      memberId: Number(id),
      ...renewForm,
    });
    if (res.success) {
      setRenewed(true);
      reload();
      setTimeout(() => {
        setRenewOpen(false);
        setRenewed(false);
      }, 1200);
    }
  };

  if (!member)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
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
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );

  const active = isAfter(parseISO(member.expiry_date), new Date());
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const daysLeft = differenceInDays(parseISO(member.expiry_date), new Date());
  const avgVisits = attendance.length;

  const InfoRow = ({ icon: Icon, value, color = "var(--text-secondary)" }) =>
    value ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.82rem",
          color,
        }}
      >
        <Icon size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
        <span>{value}</span>
      </div>
    ) : null;

  return (
    <div style={{ padding: "2rem", height: "100%", overflowY: "auto" }}>
      {/* Header */}
      <div
        className="animate-fade-up"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.875rem",
          marginBottom: "1.75rem",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            border: "1px solid var(--border-light)",
            background: "var(--bg-card)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
            transition: "all 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "white";
            e.currentTarget.style.background = "var(--bg-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.background = "var(--bg-card)";
          }}
        >
          <ArrowLeft size={17} />
        </button>
        <h1 className="section-header" style={{ flex: 1 }}>
          Member Profile
        </h1>
        <button
          onClick={() => navigate(`/members/edit/${id}`)}
          className="btn-secondary"
        >
          <Edit2 size={14} /> Edit
        </button>
        <button onClick={() => setRenewOpen(true)} className="btn-primary">
          <RefreshCw size={14} /> Renew Membership
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: "1.25rem",
        }}
      >
        {/* Profile Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div
            className="card animate-fade-up stagger-1"
            style={{ padding: "1.5rem", textAlign: "center" }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                margin: "0 auto 0.875rem",
                background: active
                  ? "linear-gradient(135deg, rgba(249,115,22,0.3), rgba(249,115,22,0.08))"
                  : "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))",
                border: active
                  ? "2px solid rgba(249,115,22,0.35)"
                  : "2px solid rgba(239,68,68,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.75rem",
                fontWeight: 900,
                color: active ? "#f97316" : "#ef4444",
                boxShadow: active
                  ? "0 4px 20px rgba(249,115,22,0.2)"
                  : "0 4px 20px rgba(239,68,68,0.15)",
              }}
            >
              {member.full_name.charAt(0)}
            </div>
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 800,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              {member.full_name}
            </h2>
            <span
              className={active ? "badge-active" : "badge-expired"}
              style={{ marginTop: "0.5rem", display: "inline-block" }}
            >
              {active ? "● Active" : "● Expired"}
            </span>

            {/* Expiry countdown */}
            <div
              style={{
                marginTop: "1rem",
                padding: "0.75rem",
                borderRadius: 10,
                background:
                  active && daysLeft <= 7
                    ? "rgba(234,179,8,0.1)"
                    : active
                      ? "rgba(34,197,94,0.08)"
                      : "rgba(239,68,68,0.08)",
                border:
                  active && daysLeft <= 7
                    ? "1px solid rgba(234,179,8,0.2)"
                    : active
                      ? "1px solid rgba(34,197,94,0.15)"
                      : "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <div
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.25rem",
                }}
              >
                {active
                  ? daysLeft <= 7
                    ? "⚠ Expiring Soon"
                    : "Days Remaining"
                  : "Expired"}
              </div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  color:
                    active && daysLeft <= 7
                      ? "#eab308"
                      : active
                        ? "#22c55e"
                        : "#ef4444",
                  letterSpacing: "-0.03em",
                }}
              >
                {active ? daysLeft : Math.abs(daysLeft)}{" "}
                <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>
                  days
                </span>
              </div>
            </div>

            {/* Info rows */}
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                textAlign: "left",
              }}
            >
              <InfoRow icon={Phone} value={member.phone} />
              <InfoRow icon={MapPin} value={member.address} />
              <InfoRow
                icon={Calendar}
                value={TYPE_LABELS[member.membership_type]}
              />
            </div>
          </div>

          {/* Stats */}
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
              }}
            >
              Member Stats
            </div>
            {[
              ["Start Date", member.start_date, "var(--text-secondary)"],
              [
                "Expiry Date",
                member.expiry_date,
                active ? "#22c55e" : "#ef4444",
              ],
              ["Total Visits", `${avgVisits} visits`, "#3b82f6"],
              ["Total Paid", `LKR ${totalPaid.toLocaleString()}`, "#f97316"],
            ].map(([label, val, color]) => (
              <div
                key={label}
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
                  {label}
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color,
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          {/* Attendance */}
          <div
            className="card animate-fade-up stagger-2"
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
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <Clock size={15} style={{ color: "#a855f7" }} />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                  }}
                >
                  Attendance History
                </span>
              </div>
              <span
                style={{
                  background: "rgba(168,85,247,0.12)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  borderRadius: 20,
                  padding: "0.15rem 0.6rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#a855f7",
                }}
              >
                {attendance.length} visits
              </span>
            </div>
            <div style={{ maxHeight: 240, overflowY: "auto" }}>
              {attendance.length === 0 ? (
                <div
                  style={{
                    padding: "2.5rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  No attendance records yet
                </div>
              ) : (
                attendance.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1.25rem",
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
                    <span
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {a.date}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.75rem",
                          color: "#22c55e",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        <LogIn size={11} /> {a.entry_time || "—"}
                      </span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.75rem",
                          color: "#ef4444",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        <LogOut size={11} /> {a.exit_time || "—"}
                      </span>
                      {a.duration_minutes != null && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontSize: "0.75rem",
                            color: "#f97316",
                            background: "rgba(249,115,22,0.1)",
                            padding: "0.15rem 0.5rem",
                            borderRadius: 6,
                            fontWeight: 600,
                          }}
                        >
                          <Timer size={11} /> {a.duration_minutes}m
                        </span>
                      )}
                      {!a.exit_time && a.entry_time && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "#eab308",
                            background: "rgba(234,179,8,0.1)",
                            padding: "0.15rem 0.5rem",
                            borderRadius: 6,
                            fontWeight: 600,
                          }}
                        >
                          Inside
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payments */}
          <div
            className="card animate-fade-up stagger-3"
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
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <CreditCard size={15} style={{ color: "#22c55e" }} />
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    color: "var(--text-primary)",
                  }}
                >
                  Payment History
                </span>
              </div>
              <span
                style={{
                  background: "rgba(34,197,94,0.12)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: 20,
                  padding: "0.15rem 0.6rem",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#22c55e",
                }}
              >
                LKR {totalPaid.toLocaleString()}
              </span>
            </div>
            <div style={{ maxHeight: 200, overflowY: "auto" }}>
              {payments.length === 0 ? (
                <div
                  style={{
                    padding: "2.5rem",
                    textAlign: "center",
                    color: "var(--text-muted)",
                    fontSize: "0.875rem",
                  }}
                >
                  No payments recorded
                </div>
              ) : (
                payments.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0.75rem 1.25rem",
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
                    <div>
                      <div
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          color: "#22c55e",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        LKR {p.amount.toLocaleString()}
                      </div>
                      {p.notes && (
                        <div
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--text-muted)",
                            marginTop: "0.1rem",
                          }}
                        >
                          {p.notes}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          color: "var(--text-secondary)",
                          fontFamily: "JetBrains Mono, monospace",
                        }}
                      >
                        {p.payment_date}
                      </div>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          textTransform: "capitalize",
                          marginTop: "0.1rem",
                        }}
                      >
                        {p.payment_type}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Renew Modal */}
      <Modal
        open={renewOpen}
        onClose={() => setRenewOpen(false)}
        title="Renew Membership"
      >
        <div
          style={{
            marginBottom: "1rem",
            padding: "0.75rem",
            background: "var(--bg-surface)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(249,115,22,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#f97316",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            {member.full_name.charAt(0)}
          </div>
          <div>
            <div
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              {member.full_name}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Current expiry: {member.expiry_date}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label className="label">Membership Type</label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "0.5rem",
              }}
            >
              {[
                ["1_month", "1 Mo", "#3b82f6"],
                ["3_months", "3 Mo", "#f97316"],
                ["1_year", "1 Yr", "#22c55e"],
              ].map(([v, l, c]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() =>
                    setRenewForm((f) => ({
                      ...f,
                      membershipType: v,
                      fee: FEES[v],
                    }))
                  }
                  style={{
                    padding: "0.625rem",
                    borderRadius: 8,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "center",
                    background:
                      renewForm.membershipType === v
                        ? `${c}15`
                        : "var(--bg-surface)",
                    border:
                      renewForm.membershipType === v
                        ? `2px solid ${c}`
                        : "2px solid var(--border)",
                    color:
                      renewForm.membershipType === v ? c : "var(--text-muted)",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Fee (LKR)</label>
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
                value={renewForm.fee}
                onChange={(e) =>
                  setRenewForm((f) => ({ ...f, fee: Number(e.target.value) }))
                }
                className="input"
                style={{ paddingLeft: "2.2rem" }}
                min="0"
              />
            </div>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              value={renewForm.startDate}
              onChange={(e) =>
                setRenewForm((f) => ({ ...f, startDate: e.target.value }))
              }
              className="input"
            />
          </div>
          <div
            style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}
          >
            <button
              onClick={handleRenew}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              {renewed ? (
                <>
                  <Check size={14} /> Renewed!
                </>
              ) : (
                <>
                  <RefreshCw size={14} /> Confirm Renewal
                </>
              )}
            </button>
            <button
              onClick={() => setRenewOpen(false)}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
