import React, { useEffect, useState } from "react";

export default function LiveCounter() {
  const [counts, setCounts] = useState({ orphanages: 0, students: 0 });

  useEffect(() => {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const orphanages = JSON.parse(localStorage.getItem("orphanages")) || [];
    setCounts({ students: students.length, orphanages: orphanages.length });
  }, []);

  const cardStyle = {
    background: "white",
    padding: "40px 20px",
    borderRadius: "24px",
    flex: 1,
    textAlign: "center",
    boxShadow: "0 10px 25px rgba(0,0,0,0.03)",
    border: "1px solid #e2e8f0",
    transition: "transform 0.3s"
  };

  const numberStyle = {
    fontSize: "56px",
    fontWeight: "900",
    color: "#1b4332",
    lineHeight: "1"
  };

  const labelStyle = {
    color: "#94a3b8",
    textTransform: "uppercase",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: "1.5px",
    marginTop: "10px"
  };

  return (
    <div style={{ display: "flex", gap: "30px" }}>
      <div style={cardStyle}>
        <div style={numberStyle}>{counts.orphanages}</div>
        <div style={labelStyle}>Active Orphanages</div>
      </div>
      <div style={cardStyle}>
        <div style={numberStyle}>{counts.students}</div>
        <div style={labelStyle}>Active Students</div>
      </div>
    </div>
  );
}