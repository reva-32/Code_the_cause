import { useNavigate } from "react-router-dom";
import React from "react";
import "./auth.css";  
export default function StudentLogin() {
  const navigate = useNavigate();

  return (
    <div style={box}>
      <h2>Student Login</h2>
      <input placeholder="Student Name" />
      <input value="student" disabled />
      <button onClick={() => navigate("/student/dashboard")}>Login</button>
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
