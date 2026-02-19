import React from "react";

const THEMES = {
  orange: {
    color: "#f97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.2)",
    glow: "rgba(249,115,22,0.15)",
  },
  green: {
    color: "#22c55e",
    bg: "rgba(34,197,94,0.1)",
    border: "rgba(34,197,94,0.2)",
    glow: "rgba(34,197,94,0.1)",
  },
  red: {
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.2)",
    glow: "rgba(239,68,68,0.1)",
  },
  blue: {
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
    border: "rgba(59,130,246,0.2)",
    glow: "rgba(59,130,246,0.1)",
  },
  purple: {
    color: "#a855f7",
    bg: "rgba(168,85,247,0.1)",
    border: "rgba(168,85,247,0.2)",
    glow: "rgba(168,85,247,0.1)",
  },
  yellow: {
    color: "#eab308",
    bg: "rgba(234,179,8,0.1)",
    border: "rgba(234,179,8,0.2)",
    glow: "rgba(234,179,8,0.1)",
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "orange",
  index = 0,
}) {
  const t = THEMES[color] || THEMES.orange;
  return (
    <div
      className={`animate-fade-up stagger-${index + 1}`}
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        border: `1px solid var(--border)`,
        padding: "1.25rem",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.25s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = t.border;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 32px ${t.glow}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Corner glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: `radial-gradient(circle at top right, ${t.bg} 0%, transparent 70%)`,
          borderRadius: "0 var(--radius-lg) 0 0",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div style={{ flex: 1 }}>
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
              fontSize: "1.75rem",
              fontWeight: 800,
              color: t.color,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            {value}
          </div>
          {sub && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                marginTop: "0.35rem",
              }}
            >
              {sub}
            </div>
          )}
        </div>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            flexShrink: 0,
            background: t.bg,
            border: `1px solid ${t.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} color={t.color} />
        </div>
      </div>
    </div>
  );
}
