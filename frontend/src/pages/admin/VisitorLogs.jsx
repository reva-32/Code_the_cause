import React, { useEffect, useState } from "react";
import FiltersBar from "../../components/FiltersBar";
import Sidebar from "../../components/Sidebar";

export default function VisitorLogs() {
  const [filters, setFilters] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 1. Get both visitors and orphanages from local storage
    const rawVisitors = JSON.parse(localStorage.getItem("visitors")) || [];
    const rawOrphanages = JSON.parse(localStorage.getItem("orphanages")) || [];

    // 2. Normalize data and perform the ID lookup
    const normalized = rawVisitors.map((v) => {
      // Find the orphanage object that matches the ID stored in the visitor record
      const foundOrphanage = rawOrphanages.find(o => o.id === v.orphanage);
      
      return {
        ...v,
        // Use the found orphanage name, or fallback to the stored value, or "Unknown"
        displayOrphanage: foundOrphanage ? foundOrphanage.name : (v.orphanage || "Unknown"),
        displayEntry: v.entryTime || v.time || "-",
        displayExit: v.exitTime || "Inside"
      };
    });

    // 3. Apply Filters based on the display name or ID
    const filtered = normalized.filter((log) => {
      if (filters.orphanage && log.orphanage !== filters.orphanage) {
        return false;
      }
      return true;
    });

    setLogs([...filtered].reverse());
  }, [filters]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0fdf4" }}>
      <Sidebar />

      <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        <h2 style={{ color: "#1b4332", marginBottom: "20px" }}>
          Visitor Logs
        </h2>

        <FiltersBar filters={filters} onChange={setFilters} />

        <div style={card}>
          {logs.length === 0 ? (
            <div style={empty}>No visitor records found.</div>
          ) : (
            <table style={table}>
              <thead>
                <tr style={headRow}>
                  <th style={th}>Visitor</th>
                  <th style={th}>Phone</th>
                  <th style={th}>Purpose</th>
                  <th style={th}>Orphanage</th>
                  <th style={th}>Entry Time</th>
                  <th style={th}>Exit Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} style={row}>
                    <td style={td}>{l.name}</td>
                    <td style={td}>{l.phone}</td>
                    <td style={td}>{l.purpose}</td>
                    <td style={td}>{l.Orphanages}</td>
                    <td style={td}>{l.displayEntry}</td>
                    <td style={td}>
                      <span style={{
                        color: l.displayExit === "Inside" ? "#059669" : "inherit",
                        fontWeight: l.displayExit === "Inside" ? "bold" : "normal"
                      }}>
                        {l.displayExit}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Styles (Same as previous) ---
const card = {
  background: "white",
  padding: "20px",
  borderRadius: "15px",
  marginTop: "20px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
};
const table = { width: "100%", borderCollapse: "collapse" };
const headRow = { borderBottom: "2px solid #e5e7eb" };
const row = { borderBottom: "1px solid #f1f5f9" };
const th = { padding: "12px", textAlign: "left" };
const td = { padding: "12px" };
const empty = { padding: "40px", textAlign: "center", color: "#64748b" };