import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar"; // Importing your new component
import LiveCounter from "../../components/LiveCounter";
import VisitorAlerts from "../../components/VisitorAlerts";

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") navigate("/");
  }, [navigate]);

  // Main container styles to ensure full screen and correct layout
  const containerStyle = { 
    display: "flex", 
    minHeight: "100vh", 
    width: "100vw", 
    background: "#f0fdf4", 
    margin: 0, 
    padding: 0 
  };

  const contentStyle = { 
    flex: 1, 
    marginLeft: "260px", // Matches Sidebar width to prevent overlap
    padding: "40px", 
    overflowY: "auto" 
  };

  return (
    <div style={containerStyle}>
      {/* Global CSS Reset for this page */}
      <style>{`body { margin: 0; padding: 0; overflow-x: hidden; }`}</style>
      
      {/* 1. Shared Sidebar Component */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <div style={contentStyle}>
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ color: "#1b4332", fontSize: "32px", margin: 0 }}>
            Welcome, Admin 🌿
          </h2>
          <p style={{ color: "#64748b", marginTop: "5px" }}>
            Real-time overview of your network and orphanages.
          </p>
        </div>
        
        {/* Live Statistics Section */}
        <div style={{ marginBottom: "40px" }}>
          <LiveCounter />
        </div>
        
        {/* Alerts Section */}
        <div 
          style={{ 
            background: "white", 
            padding: "30px", 
            borderRadius: "20px", 
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0"
          }}
        >
          <h3 style={{ color: "#1b4332", marginBottom: "20px", fontSize: "20px" }}>
            Recent Visitor Alerts
          </h3>
          <VisitorAlerts />
        </div>
      </div>
    </div>
  );
}