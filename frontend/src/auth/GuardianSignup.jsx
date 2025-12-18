import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import "./auth.css";

export default function GuardianSignup() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orphanage, setOrphanage] = useState("");

  const handleSignup = () => {
    // You can save this data to localStorage or send to backend
    const guardians = JSON.parse(localStorage.getItem("guardians")) || [];
    guardians.push({ fullName, email, password, orphanage });
    localStorage.setItem("guardians", JSON.stringify(guardians));

    navigate("/guardian/login"); // redirect after signup
  };

  return (
    <div style={box}>
      <h2>Guardian Signup</h2>

      <label htmlFor="fullName">Full Name</label>
      <input
        type="text"
        id="fullName"
        name="fullName"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <label htmlFor="email">Email</label>
      <input
        type="email"
        id="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="password">Password</label>
      <input
        type="password"
        id="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label htmlFor="orphanage">Orphanage</label>
      <input
        type="text"
        id="orphanage"
        name="orphanage"
        placeholder="Orphanage Name"
        value={orphanage}
        onChange={(e) => setOrphanage(e.target.value)}
      />

      <button onClick={handleSignup}>Sign Up</button>
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
