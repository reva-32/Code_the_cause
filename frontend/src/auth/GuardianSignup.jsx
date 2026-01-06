import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

export default function GuardianSignup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orphanage, setOrphanage] = useState("");
  const [stateName, setStateName] = useState(""); // New state for location

  const handleSignup = () => {
    // Check if State is filled along with other fields
    if (!fullName || !email || !password || !orphanage || !stateName) {
      alert("All fields including State are required");
      return;
    }

    // 1. Handle Guardians Data
    const guardians = JSON.parse(localStorage.getItem("guardians")) || [];
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
      state: stateName, // Saving state to guardian profile
      createdAt: new Date().toISOString(),
    };

    guardians.push(newGuardian);
    localStorage.setItem("guardians", JSON.stringify(guardians));

    // 2. Automatically add Orphanage to the 'orphanages' list
    const orphanages = JSON.parse(localStorage.getItem("orphanages")) || [];
    
    const orphanageExists = orphanages.find(
      (o) => o.name.toLowerCase() === orphanage.toLowerCase()
    );

    if (!orphanageExists) {
      const newOrphanageEntry = {
        id: "orph-" + Date.now(),
        name: orphanage,
        state: stateName, // Saving the actual state name provided
        status: "Active",
        createdAt: new Date().toISOString()
      };
      orphanages.push(newOrphanageEntry);
      localStorage.setItem("orphanages", JSON.stringify(orphanages));
    }

    alert("Signup successful! Orphanage registered in " + stateName);
    navigate("/guardian/login");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Increased font size for header */}
        <h2 style={{ fontSize: "28px", marginBottom: "20px" }}>Guardian Signup</h2>

        <input
          style={styles.largeInput}
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          style={styles.largeInput}
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.largeInput}
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          style={styles.largeInput}
          placeholder="Orphanage Name"
          value={orphanage}
          onChange={(e) => setOrphanage(e.target.value)}
        />

        {/* NEW STATE INPUT */}
        <input
          style={styles.largeInput}
          placeholder="State (e.g. Maharashtra)"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
        />

        <button 
          style={styles.largeBtn} 
          onClick={handleSignup}
        >
          Create Account
        </button>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "16px" }}>
          Already have an account? <Link to="/guardian/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

// Inline styles to match your "increased font" request
const styles = {
  largeInput: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "17px",
    boxSizing: "border-box"
  },
  largeBtn: {
    width: "100%",
    padding: "16px",
    background: "#065f46",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px"
  }
};