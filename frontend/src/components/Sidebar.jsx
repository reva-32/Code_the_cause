import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // ✅ FIXED: Only remove admin session keys. 
    // This prevents deleting your entire local database (records, students, etc.)
    localStorage.removeItem("role");
    localStorage.removeItem("adminLoggedIn");
    
    // Optional: if you have other admin-specific session data, remove it here
    // localStorage.removeItem("adminUser"); 

    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Orphanages", path: "/admin/orphanages" },
    { name: "Students", path: "/admin/students" },
    { name: "Content Upload", path: "/admin/content" },
    { name: "Visitor Logs", path: "/admin/visitors" },
  ];

  const sidebarStyle = {
    width: "260px",
    background: "#1b4332", // Dark green theme
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 100,
    boxShadow: "4px 0px 10px rgba(0,0,0,0.1)",
  };

  const navLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      padding: "16px 25px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "600",
      color: isActive ? "#1b4332" : "#d8f3dc",
      background: isActive ? "#95d5b2" : "transparent",
      margin: "5px 15px",
      borderRadius: "12px",
      transition: "0.3s all ease",
      textDecoration: "none",
      display: "block",
    };
  };

  return (
    <div style={sidebarStyle}>
      <div 
        style={{ 
          padding: "40px 25px", 
          fontSize: "22px", 
          fontWeight: "800", 
          color: "#ffffff",
          letterSpacing: "1px" 
        }}
      >
        Admin Panel
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", marginTop: "10px" }}>
        {menuItems.map((item) => (
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            style={navLinkStyle(item.path)}
          >
            {item.name}
          </div>
        ))}
      </nav>

      <div style={{ padding: "20px" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            padding: "14px",
            background: "rgba(255, 255, 255, 0.1)",
            color: "#ff8787",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "12px",
            fontWeight: "700",
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#ef4444";
            e.target.style.color = "white";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "rgba(255, 255, 255, 0.1)";
            e.target.style.color = "#ff8787";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}