import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("gymAdmin");
    if (stored) {
      try {
        setAdmin(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse admin data:", err);
        sessionStorage.removeItem("gymAdmin");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await window.gymAPI.login({ email, password });
    if (result.success) {
      setAdmin(result.admin);
      sessionStorage.setItem("gymAdmin", JSON.stringify(result.admin));
    }
    return result;
  };

  const logout = () => {
    setLoading(true); // Set loading to true during logout
    setAdmin(null);
    sessionStorage.removeItem("gymAdmin");
    setTimeout(() => setLoading(false), 500); // Reset loading after a short delay
  };

  // ✅ Helper to check permissions
  const can = (permission) => {
    if (!admin) return false;
    if (admin.role === "admin") return true; // Admin can do everything

    // Sub-admin permissions
    const subAdminPermissions = [
      "add_member",
      "add_payment",
      "view_attendance",
      "scan_fingerprint",
    ];

    return subAdminPermissions.includes(permission);
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#080c14",
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
          <p style={{ color: "#8b9cbf", fontSize: "0.875rem" }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading, can }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
