import { useNavigate } from "react-router-dom";
import React from "react";
import "./auth.css";
export default function AdminLogin() {
  const navigate = useNavigate();

  return (
    <div style={box}>
      <h2>Admin Login</h2>
      <input placeholder="Email" />
      <input placeholder="Password" type="password" />
      <button onClick={() => navigate("/admin/dashboard")}>Login</button>
    </div>
  );
}

const box = {
  maxWidth: "300px",
  margin: "100px auto",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};
