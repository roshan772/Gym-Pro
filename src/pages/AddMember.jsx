import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Check,
} from "lucide-react";
import { format, addMonths, addYears } from "date-fns";

const TYPES = [
  { v: "1_month", l: "1 Month", desc: "Short-term" },
  { v: "3_months", l: "3 Months", desc: "Popular" },
  { v: "1_year", l: "1 Year", desc: "Best value" },
];
const DEF_FEES = { "1_month": 3000, "3_months": 8000, "1_year": 25000 };
const TYPE_COLORS = {
  "1_month": "#3b82f6",
  "3_months": "#f97316",
  "1_year": "#22c55e",
};

// ✅ Move ALL static styles OUTSIDE the component
const styles = {
  page: { padding: "2rem", height: "100%", overflowY: "auto" },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#131d2e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#8b9cbf",
    flexShrink: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "1.25rem",
    maxWidth: 900,
  },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  card: {
    background: "#131d2e",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "1.5rem",
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
  fieldWrap: { display: "flex", flexDirection: "column", gap: "1rem" },
  iconWrap: { position: "relative" },
  icon: {
    position: "absolute",
    left: 11,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#4a5a78",
    pointerEvents: "none",
  },
  iconTop: {
    position: "absolute",
    left: 11,
    top: 12,
    color: "#4a5a78",
    pointerEvents: "none",
  },
  inputPadL: { paddingLeft: "2.2rem" },
  inputGreen: {
    background: "#0d1424",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "0.625rem 0.875rem",
    fontSize: "0.875rem",
    color: "#22c55e",
    fontFamily: "JetBrains Mono, monospace",
    fontWeight: 600,
  },
  typeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "0.625rem",
  },
  dateGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
  },
  btnRow: { display: "flex", gap: "0.75rem" },
  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 10,
    padding: "0.875rem 1rem",
    color: "#fca5a5",
    fontSize: "0.875rem",
  },
  warnBox: {
    background: "rgba(234,179,8,0.08)",
    border: "1px solid rgba(234,179,8,0.3)",
    borderRadius: 10,
    padding: "0.875rem 1rem",
    color: "#fde68a",
    fontSize: "0.875rem",
  },
  tipCard: {
    background: "#131d2e",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "1.25rem",
  },
  tipLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    color: "#4a5a78",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "1rem",
  },
  tipRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.5rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
};

function calcExpiry(start, type) {
  try {
    const d = new Date(start);
    if (type === "1_month") return format(addMonths(d, 1), "MMM d, yyyy");
    if (type === "3_months") return format(addMonths(d, 3), "MMM d, yyyy");
    if (type === "1_year") return format(addYears(d, 1), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export default function AddMember() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address: "",
    membership_type: "1_month",
    start_date: format(new Date(), "yyyy-MM-dd"),
    membership_fee: DEF_FEES["1_month"],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [deviceWarn, setDeviceWarn] = useState("");

  useEffect(() => {
    if (isEdit)
      window.gymAPI.getMemberById(Number(id)).then((m) => {
        if (m) setForm((p) => ({ ...p, ...m }));
      });
  }, [id, isEdit]);

  // ✅ useCallback so these functions don't recreate on every render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
      ...(name === "membership_type"
        ? { membership_fee: DEF_FEES[value] }
        : {}),
    }));
  }, []);

  const handleFeeChange = useCallback((e) => {
    setForm((f) => ({ ...f, membership_fee: Number(e.target.value) }));
  }, []);

  const setType = useCallback((v) => {
    setForm((f) => ({ ...f, membership_type: v, membership_fee: DEF_FEES[v] }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      setDeviceWarn("");
      try {
        const res = isEdit
          ? await window.gymAPI.updateMember({ ...form, id: Number(id) })
          : await window.gymAPI.addMember(form);
        if (res.success) {
          // Check if the device sync worked
          if (!isEdit && res.deviceSync && !res.deviceSync.synced && !res.deviceSync.skipped) {
            setDeviceWarn(
              `Member saved, but device sync failed: ${res.deviceSync.error || "unknown error"}. ` +
              `The member was NOT added to the Hikvision terminal.`
            );
          } else {
            setSuccess(true);
            setTimeout(() => navigate("/members"), 900);
          }
        } else setError(res.message || "Failed to save");
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    },
    [form, id, isEdit, navigate],
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ArrowLeft size={17} />
        </button>
        <div>
          <h1 className="section-header">
            {isEdit ? "Edit Member" : "Add New Member"}
          </h1>
          <p className="section-sub">
            {isEdit ? "Update member details" : "Register a new gym member"}
          </p>
        </div>
      </div>

      <div style={styles.grid}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Personal Info */}
          <div style={styles.card}>
            <div style={styles.sectionLbl}>
              <User size={12} /> Personal Information
            </div>
            <div style={styles.fieldWrap}>
              <div>
                <label className="label">Full Name *</label>
                <div style={styles.iconWrap}>
                  <User size={14} style={styles.icon} />
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    className="input"
                    style={styles.inputPadL}
                    placeholder="Enter full name"
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="label">Phone Number</label>
                <div style={styles.iconWrap}>
                  <Phone size={14} style={styles.icon} />
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="input"
                    style={styles.inputPadL}
                    placeholder="07X XXX XXXX"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label className="label">Address</label>
                <div style={styles.iconWrap}>
                  <MapPin size={14} style={styles.iconTop} />
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="input"
                    style={{
                      paddingLeft: "2.2rem",
                      resize: "none",
                      height: 72,
                    }}
                    placeholder="Member address"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Membership — only on Add */}
          {!isEdit && (
            <div style={styles.card}>
              <div style={styles.sectionLbl}>
                <Calendar size={12} /> Membership Details
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label className="label">Membership Type *</label>
                <div style={styles.typeGrid}>
                  {TYPES.map((t) => {
                    const col = TYPE_COLORS[t.v];
                    const sel = form.membership_type === t.v;
                    return (
                      <button
                        key={t.v}
                        type="button"
                        onClick={() => setType(t.v)}
                        style={{
                          padding: "0.875rem 0.5rem",
                          borderRadius: 10,
                          cursor: "pointer",
                          textAlign: "center",
                          background: sel ? `${col}15` : "#0d1424",
                          border: sel
                            ? `2px solid ${col}`
                            : "2px solid rgba(255,255,255,0.06)",
                          transition: "all 0.15s",
                        }}
                      >
                        {sel && (
                          <Check
                            size={12}
                            style={{
                              color: col,
                              margin: "0 auto 0.3rem",
                              display: "block",
                            }}
                          />
                        )}
                        <div
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            color: sel ? col : "#8b9cbf",
                          }}
                        >
                          {t.l}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "#4a5a78",
                            marginTop: "0.15rem",
                          }}
                        >
                          {t.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={styles.dateGrid}>
                <div>
                  <label className="label">Start Date *</label>
                  <div style={styles.iconWrap}>
                    <Calendar size={14} style={styles.icon} />
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date}
                      onChange={handleChange}
                      className="input"
                      style={styles.inputPadL}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Expiry Date (Auto)</label>
                  <div style={styles.inputGreen}>
                    {calcExpiry(form.start_date, form.membership_type)}
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Membership Fee (LKR) *</label>
                <div style={styles.iconWrap}>
                  <DollarSign size={14} style={styles.icon} />
                  <input
                    type="number"
                    name="membership_fee"
                    value={form.membership_fee}
                    onChange={handleFeeChange}
                    className="input"
                    style={styles.inputPadL}
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {error && <div style={styles.errorBox}>{error}</div>}

          {deviceWarn && (
            <div style={styles.warnBox}>
              <div style={{ fontWeight: 700, marginBottom: "0.4rem" }}>
                ⚠️ Device Sync Failed
              </div>
              <div style={{ marginBottom: "0.75rem", lineHeight: 1.5 }}>
                {deviceWarn}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: "0.8rem", padding: "0.35rem 0.75rem" }}
                  onClick={() => navigate("/members")}
                >
                  Continue anyway
                </button>
              </div>
            </div>
          )}

          <div style={styles.btnRow}>
            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary"
              style={{ minWidth: 140 }}
            >
              {success ? (
                <>
                  <Check size={15} /> Saved!
                </>
              ) : loading ? (
                "Saving..."
              ) : (
                <>
                  <Save size={15} /> {isEdit ? "Update Member" : "Add Member"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Tips */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={styles.tipCard}>
            <div style={styles.tipLabel}>Pricing Guide</div>
            {TYPES.map((t) => (
              <div key={t.v} style={styles.tipRow}>
                <span style={{ fontSize: "0.82rem", color: "#8b9cbf" }}>
                  {t.l}
                </span>
                <span
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: TYPE_COLORS[t.v],
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                >
                  LKR {DEF_FEES[t.v].toLocaleString()}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
