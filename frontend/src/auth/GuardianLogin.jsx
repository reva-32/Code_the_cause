import { useNavigate, Link } from "react-router-dom";
import React, { useState } from "react";
import "./auth.css";

export default function GuardianLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // Fetch stored guardians from localStorage
    const guardians = JSON.parse(localStorage.getItem("guardians")) || [];

    // Check if credentials match any guardian
    const foundGuardian = guardians.find(
      (g) => g.email === email && g.password === password
    );

    if (foundGuardian) {
      // Set login flag in localStorage
      localStorage.setItem("guardianLoggedIn", JSON.stringify(foundGuardian));
      navigate("/guardian/dashboard");
    } else {
      alert("Invalid email or password");
    }
  };

  return (
    <div style={box}>
      <h2>Guardian Login</h2>

      <label htmlFor="guardianEmail">Email</label>
      <input
        type="email"
        id="guardianEmail"
        name="guardianEmail"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="guardianPassword">Password</label>
      <input
        type="password"
        id="guardianPassword"
        name="guardianPassword"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
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
