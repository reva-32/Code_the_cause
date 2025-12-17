import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../App.css";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // removes role/token
    navigate("/"); // back to landing page
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
          <a className="side-link" href="#">Dashboard</a>
          <a className="side-link" href="#">Upload Content</a>
          <a className="side-link" href="#">Manage Content</a>
          <a className="side-link" href="#">Reports</a>
          <a className="side-link" href="#">Settings</a>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            style={{
              margin: "20px",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: "#95d5b2",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            Logout
          </button>
        </div>

        {/* CONTENT */}
        <div className="content">
          <h2 style={{ color: "#1b4332" }}>Welcome, Admin 🌿</h2>
          <p style={{ marginBottom: "20px", color: "#555" }}>
            Manage learning content and monitor platform activity.
          </p>

          {/* STATS */}
          <div className="card">
            <h3>Platform Overview</h3>
            <p>Total Videos: 24</p>
            <p>Total Audio Lessons: 18</p>
            <p>Total Worksheets: 32</p>
          </div>

          {/* UPLOAD */}
          <div className="card">
            <h3>Upload Content</h3>
            <input placeholder="Content Title" />
            <select>
              <option>Select Content Type</option>
              <option>Video</option>
              <option>Audio</option>
              <option>Worksheet</option>
            </select>
            <br /><br />
            <button>Upload</button>
          </div>

          {/* MANAGE */}
          <div className="card">
            <h3>Manage Content</h3>
            <p>📘 Alphabet Learning Video</p>
            <p>🎧 Pronunciation Audio</p>
            <p>📝 Writing Practice Worksheet</p>
            <button>Edit</button>{" "}
            <button>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
