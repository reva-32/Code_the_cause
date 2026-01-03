import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

export default function GuardianSignup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orphanage, setOrphanage] = useState("");

  const handleSignup = () => {
    if (!fullName || !email || !password || !orphanage) {
      alert("All fields are required");
      return;
    }

    const guardians = JSON.parse(localStorage.getItem("guardians")) || [];

    // ✅ Prevent duplicate account
    const alreadyExists = guardians.find(
      (g) => g.email.toLowerCase() === email.toLowerCase()
    );

    if (alreadyExists) {
      alert("Guardian with this email already exists");
      return;
    }

    const newGuardian = {
      id: Date.now(),
      fullName,
      email: email.toLowerCase(),
      password,
      orphanage,
      createdAt: new Date().toISOString(),
    };

    guardians.push(newGuardian);
    localStorage.setItem("guardians", JSON.stringify(guardians));

    alert("Signup successful. Please login.");
    navigate("/guardian/login");
  };

  return (
    <div style={box}>
      <h2>Guardian Signup</h2>

      <input
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        placeholder="Orphanage Name"
        value={orphanage}
        onChange={(e) => setOrphanage(e.target.value)}
      />

      <button onClick={handleSignup}>Create Account</button>

      <p>
        Already have an account?{" "}
        <Link to="/guardian/login">Login</Link>
      </p>
    </div>
  );
}

const box = {
  maxWidth: "320px",
  margin: "100px auto",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};
