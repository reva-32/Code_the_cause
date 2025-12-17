import { useNavigate, Link } from "react-router-dom";
import React from "react";
import "./auth.css";
export default function GuardianLogin() {
  const navigate = useNavigate();

  return (
    <div style={box}>
      <h2>Guardian Login</h2>
      <input placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button onClick={() => navigate("/guardian/dashboard")}>Login</button>
      <Link to="/guardian/signup">Create Account</Link>
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
