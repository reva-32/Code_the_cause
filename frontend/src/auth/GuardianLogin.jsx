import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./auth.css";

export default function GuardianLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    const guardians = JSON.parse(localStorage.getItem("guardians")) || [];

    const foundGuardian = guardians.find(
      (g) =>
        g.email.toLowerCase() === email.toLowerCase() &&
        g.password === password
    );

    if (!foundGuardian) {
      alert("Invalid email or password");
      return;
    }

    // ✅ Store logged-in guardian session
    localStorage.setItem(
      "guardianLoggedIn",
      JSON.stringify({
        id: foundGuardian.id,
        fullName: foundGuardian.fullName,
        email: foundGuardian.email,
        orphanage: foundGuardian.orphanage,
      })
    );

    navigate("/guardian/dashboard");
  };

  return (
    <div style={box}>
      <h2>Guardian Login</h2>

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

      <button onClick={handleLogin}>Login</button>

      <p>
        Don’t have an account?{" "}
        <Link to="/guardian/signup">Sign up</Link>
      </p>
    </div>
  );
}

const box = {
  maxWidth: "320px",
  margin: "120px auto",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};
