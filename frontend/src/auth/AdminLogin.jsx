import React from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // ✅ STORE ADMIN AUTH
    localStorage.setItem("role", "admin");
    localStorage.setItem("adminLoggedIn", "true");

    navigate("/admin/dashboard");
  };

  return (
    <div style={box}>
      <h2>Admin Login</h2>
      <input placeholder="Email" />
      <input placeholder="Password" type="password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

const box = {
  maxWidth: "300px",
  margin: "100px auto",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};
