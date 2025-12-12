import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="topbar">
          <h2 className="logo">NGO Learning Platform</h2>
        </header>

        <div className="main">
          <aside className="sidebar">
            <a href="/dashboard" className="side-link">Dashboard</a>
          </aside>

          <div className="content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}
