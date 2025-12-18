import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

export default function StudentLogin() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const login = () => {
    const students =
      JSON.parse(localStorage.getItem("students")) || [];

    const student = students.find((s) => s.name === name.trim());
    if (!student) {
      alert("Student not found");
      return;
    }

    localStorage.setItem("loggedInStudent", name.trim());
    navigate("/student/dashboard");
  };

  return (
    <div style={box}>
      <h2>Student Login</h2>
      <input
        placeholder="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={login}>Login</button>
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
