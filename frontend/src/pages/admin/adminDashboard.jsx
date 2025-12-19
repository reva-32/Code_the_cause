import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // ✅ PROTECT ROUTE
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="app-container">
      {/* TOP BAR */}
      <div className="topbar" style={{ background: "#74c69d" }}>
        <div className="logo">Admin Panel</div>
        <div
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          ☰
        </div>
      </div>

      <div className="main">
        {/* SIDEBAR */}
        <div className={`sidebar ${sidebarOpen ? "active" : ""}`}>
          <a className="side-link">Dashboard</a>
          <a className="side-link">Upload Content</a>
          <a className="side-link">Manage Content</a>
          <a className="side-link">Reports</a>
          <a className="side-link">Settings</a>

          <button
            onClick={handleLogout}
            style={{
              margin: "20px",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: "#95d5b2",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Logout
          </button>
        </div>

        {/* CONTENT */}
        <div className="content">
          <h2 style={{ color: "#1b4332" }}>Welcome, Admin 🌿</h2>
          <p style={{ color: "#555" }}>
            Manage learning content and monitor platform activity.
          </p>

          <div className="card">
            <h3>Platform Overview</h3>
            <p>Total Videos: 24</p>
            <p>Total Audio Lessons: 18</p>
            <p>Total Worksheets: 32</p>
          </div>
        </div>
      </div>
    </div>
  );
}
