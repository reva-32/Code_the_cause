import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="landing">

      {/* ================= HERO ================= */}
      <section className="hero">
        <h1 className="brand">EduLift</h1>
        <p className="hero-text">
          Inclusive, adaptive learning designed for every child’s growth.
        </p>

        <div className="hero-actions">
          <Link to="/admin/login">
            <button className="btn primary">Admin Login</button>
          </Link>
          <Link to="/guardian/login">
            <button className="btn outline">Guardian Login</button>
          </Link>
          <Link to="/student/login">
            <button className="btn outline">Student Login</button>
          </Link>
        </div>
      </section>

      {/* ================= SPECIALITIES ================= */}
      <section className="section">
        <h2 className="section-title">Why EduLift?</h2>

        <div className="card-grid">
          <div className="info-card">
            <h3>🎧 Accessibility First</h3>
            <p>
              Audio lessons and assessments ensure students with disabilities
              never fall behind.
            </p>
          </div>

          <div className="info-card">
            <h3>📊 Smart Progression</h3>
            <p>
              Students advance by performance, not age. Learning adapts to
              ability.
            </p>
          </div>

          <div className="info-card">
            <h3>🧠 AI-Based Evaluation</h3>
            <p>
              Automated test evaluation and personalized promotion logic.
            </p>
          </div>

          <div className="info-card">
            <h3>📚 Structured Learning Path</h3>
            <p>
              Lessons unlock step-by-step only after mastery of each topic.
            </p>
          </div>
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <section className="section soft-bg">
        <h2 className="section-title">Trusted by Guardians</h2>

        <div className="card-grid">
          <div className="review-card">
            <p>
              “EduLift helped my orphanage children learn without pressure. The audio lessons
              are a blessing.”
            </p>
            <span>— Guardian, Class 2</span>
          </div>

          <div className="review-card">
            <p>
              “Finally, a platform that understands learning differences.”
            </p>
            <span>— XYZ NGO founder</span>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} EduLift</p>
        <p>Learn • Grow • Rise</p>
      </footer>

    </div>
  );
}
