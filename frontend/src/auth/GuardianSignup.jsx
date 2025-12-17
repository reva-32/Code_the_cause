import { useNavigate } from "react-router-dom";
import React from "react";
import "./auth.css";  
export default function GuardianSignup() {
  const navigate = useNavigate();

  return (
    <div style={box}>
      <h2>Guardian Signup</h2>
      <input placeholder="Full Name" />
      <input placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button onClick={() => navigate("/guardian/login")}>Sign Up</button>
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
