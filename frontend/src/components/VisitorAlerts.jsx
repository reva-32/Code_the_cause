import React, { useEffect, useState } from "react";

export default function VisitorAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("visitor_alerts")) || [];
    setAlerts(stored.reverse());
  }, []);

  if (alerts.length === 0) {
    return (
      <p style={{ color: "#64748b", fontStyle: "italic" }}>
        No security alerts at this time.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {alerts.map((a) => (
        <div
          key={a.id}
          style={{
            padding: "12px 15px",
            background: "#fff1f2",
            borderLeft: "4px solid #e11d48",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <strong>⚠️ Overdue Exit</strong>
          <div style={{ marginTop: 4 }}>
            {a.visitor_name} has stayed more than 3 hours without exit.
          </div>
        </div>
      ))}
    </div>
  );
}
