import React, { useEffect, useState, useCallback } from "react";
import {
  AlertTriangle,
  Copy,
  Check,
  Phone,
  MessageCircle,
  X,
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

const styles = {
  page: { padding: "2rem", height: "100%", overflowY: "auto" },
  card: {
    background: "#131d2e",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.06)",
  },
  messageBox: {
    background: "#0d1424",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "1rem",
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "0.8rem",
    lineHeight: 1.7,
    color: "#8b9cbf",
    whiteSpace: "pre-wrap",
    position: "relative",
  },
  copyBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 6,
    background: "rgba(249,115,22,0.1)",
    border: "1px solid rgba(249,115,22,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#f97316",
    transition: "all 0.15s",
  },
};

export default function ExpiredAlerts() {
  const [expired, setExpired] = useState([]);
  const [copied, setCopied] = useState(null);
  const [sent, setSent] = useState(new Set());

  const load = useCallback(async () => {
    const data = await window.gymAPI.getExpiredMembers();
    setExpired(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const generateMessage = useCallback((member) => {
    return `Hi ${member.full_name}! 👋

Your GymPro membership expired on ${member.expiry_date}. 😔

🔒 Your gym access has been temporarily blocked.

💪 Renew now to continue your fitness journey!

Visit us at the gym or call to reactivate your membership.

Thank you!
GymPro Fitness Center`;
  }, []);

  const copyMessage = useCallback(
    (member) => {
      const msg = generateMessage(member);
      navigator.clipboard.writeText(msg);
      setCopied(member.id);
      setTimeout(() => setCopied(null), 2000);
    },
    [generateMessage],
  );

  const copyPhone = useCallback((phone, id) => {
    navigator.clipboard.writeText(phone);
    setCopied(`phone-${id}`);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const markAsSent = useCallback((memberId) => {
    window.gymAPI.markNotificationSent(memberId);
    setSent((prev) => new Set([...prev, memberId]));
  }, []);

  const openWhatsApp = useCallback(
    (phone, member) => {
      const msg = encodeURIComponent(generateMessage(member));
      const url = `https://wa.me/${phone.replace(/\D/g, "")}?text=${msg}`;
      window.open(url, "_blank");
      markAsSent(member.id);
    },
    [generateMessage, markAsSent],
  );

  const expiredNotSent = expired.filter(
    (m) => !m.notification_sent && !sent.has(m.id),
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: "1.75rem" }}>
        <h1 className="section-header">Expired Member Alerts</h1>
        <p className="section-sub">Send WhatsApp renewal reminders manually</p>
      </div>

      {/* Alert Banner */}
      {expiredNotSent.length > 0 && (
        <div
          className="animate-fade-up stagger-1"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 12,
            padding: "1rem 1.25rem",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <AlertTriangle
            size={22}
            style={{ color: "#ef4444", flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fca5a5" }}
            >
              {expiredNotSent.length} members need renewal reminder
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#8b9cbf",
                marginTop: "0.2rem",
              }}
            >
              Click "Send WhatsApp" to notify them about membership renewal
            </div>
          </div>
        </div>
      )}

      {/* Member Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
          gap: "1.25rem",
        }}
      >
        {expired.map((m, i) => {
          const daysExpired = differenceInDays(
            new Date(),
            parseISO(m.expiry_date),
          );
          const isSent = m.notification_sent || sent.has(m.id);

          return (
            <div
              key={m.id}
              className={`card animate-fade-up stagger-${Math.min(i + 2, 6)}`}
              style={{
                ...styles.card,
                padding: "1.25rem",
                opacity: isSent ? 0.6 : 1,
                position: "relative",
              }}
            >
              {/* Sent badge */}
              {isSent && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    borderRadius: 20,
                    padding: "0.25rem 0.65rem",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#4ade80",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <Check size={10} /> Sent
                </div>
              )}

              {/* Member info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    flexShrink: 0,
                    background:
                      "linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))",
                    border: "2px solid rgba(239,68,68,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    fontWeight: 800,
                    color: "#ef4444",
                  }}
                >
                  {m.full_name.charAt(0)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#f0f4ff",
                    }}
                  >
                    {m.full_name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#8b9cbf",
                      marginTop: "0.15rem",
                    }}
                  >
                    Expired {daysExpired} days ago
                  </div>
                </div>
              </div>

              {/* Phone */}
              {m.phone ? (
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#4a5a78",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Phone Number
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        background: "#0d1424",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        padding: "0.625rem 0.75rem",
                        fontFamily: "JetBrains Mono, monospace",
                        fontSize: "0.85rem",
                        color: "#f0f4ff",
                        fontWeight: 600,
                      }}
                    >
                      <Phone
                        size={12}
                        style={{
                          display: "inline",
                          marginRight: 6,
                          color: "#22c55e",
                        }}
                      />
                      {m.phone}
                    </div>
                    <button
                      onClick={() => copyPhone(m.phone, m.id)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "rgba(249,115,22,0.1)",
                        border: "1px solid rgba(249,115,22,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#f97316",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(249,115,22,0.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(249,115,22,0.1)")
                      }
                    >
                      {copied === `phone-${m.id}` ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.15)",
                    borderRadius: 8,
                    fontSize: "0.8rem",
                    color: "#fca5a5",
                    textAlign: "center",
                  }}
                >
                  ⚠️ No phone number on file
                </div>
              )}

              {/* Message preview */}
              <div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: "#4a5a78",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.5rem",
                  }}
                >
                  WhatsApp Message
                </div>
                <div style={styles.messageBox}>
                  <button
                    onClick={() => copyMessage(m)}
                    style={styles.copyBtn}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(249,115,22,0.2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(249,115,22,0.1)")
                    }
                  >
                    {copied === m.id ? <Check size={13} /> : <Copy size={13} />}
                  </button>
                  {generateMessage(m)}
                </div>
              </div>

              {/* Actions */}
              {m.phone && (
                <div
                  style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}
                >
                  <button
                    onClick={() => openWhatsApp(m.phone, m)}
                    disabled={isSent}
                    className="btn-primary"
                    style={{
                      flex: 1,
                      fontSize: "0.85rem",
                      opacity: isSent ? 0.5 : 1,
                    }}
                  >
                    <MessageCircle size={14} /> Send WhatsApp
                  </button>
                  {!isSent && (
                    <button
                      onClick={() => markAsSent(m.id)}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "rgba(34,197,94,0.1)",
                        border: "1px solid rgba(34,197,94,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#22c55e",
                        transition: "all 0.15s",
                      }}
                      title="Mark as sent"
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(34,197,94,0.2)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(34,197,94,0.1)")
                      }
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {expired.length === 0 && (
        <div
          className="card animate-fade-up stagger-2"
          style={{ ...styles.card, padding: "4rem 2rem", textAlign: "center" }}
        >
          <Check
            size={48}
            style={{ color: "#22c55e", margin: "0 auto 1rem", opacity: 0.5 }}
          />
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#f0f4ff",
              marginBottom: "0.5rem",
            }}
          >
            No Expired Members!
          </div>
          <div style={{ fontSize: "0.85rem", color: "#8b9cbf" }}>
            All members have active memberships 
          </div>
        </div>
      )}
    </div>
  );
}
