import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function ContentAnalytics() {
  const [content, setContent] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("contents")) || [];
    setContent(stored);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0fdf4" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        <h2 style={{ color: "#1b4332", marginBottom: "20px" }}>Content Analytics</h2>
        <div style={{ background: "white", borderRadius: "15px", padding: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f0fdf4", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Title</th>
                <th style={{ padding: "12px" }}>Processed</th>
                <th style={{ padding: "12px" }}>Targets</th>
                <th style={{ padding: "12px" }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {content.map((c) => (
                <tr key={c.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{c.title}</td>
                  <td style={{ padding: "12px" }}>{c.processed ? "Yes" : "No"}</td>
                  <td style={{ padding: "12px" }}>{(c.target_disabilities || []).join(", ") || "None"}</td>
                  <td style={{ padding: "12px" }}>{new Date(c.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}