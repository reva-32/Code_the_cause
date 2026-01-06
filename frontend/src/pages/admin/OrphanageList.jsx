import React, { useEffect, useState } from "react";
import FiltersBar from "../../components/FiltersBar";
import LiveCounter from "../../components/LiveCounter";
import RealtimeFeed from "../../components/RealtimeFeed";
import Sidebar from "../../components/Sidebar";

export default function OrphanageList() {
  const [filters, setFilters] = useState({});
  const [orphanages, setOrphanages] = useState([]);

  useEffect(() => {
    const all = JSON.parse(localStorage.getItem("orphanages")) || [];
    const filtered = all.filter(o => (!filters.state || o.state === filters.state));
    setOrphanages(filtered);
  }, [filters]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0fdf4" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        <h2 style={{ color: "#1b4332", marginBottom: "20px" }}>Orphanages</h2>
        <LiveCounter />
        <FiltersBar filters={filters} onChange={setFilters} />

        <div style={{ background: "white", padding: "20px", borderRadius: "15px", marginTop: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #f0fdf4" }}>
                <th style={{ padding: "12px" }}>Name</th>
                <th style={{ padding: "12px" }}>State</th>
                <th style={{ padding: "12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orphanages.map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px" }}>{o.name}</td>
                  <td style={{ padding: "12px" }}>{o.state}</td>
                  <td style={{ padding: "12px" }}>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <RealtimeFeed />
      </div>
    </div>
  );
}