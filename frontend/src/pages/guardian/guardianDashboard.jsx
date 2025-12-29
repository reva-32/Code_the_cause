import React, { useState } from "react";
import "../../App.css";
import { useNavigate } from "react-router-dom";

export default function GuardianDashboard() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const [students, setStudents] = useState(() => {
    return JSON.parse(localStorage.getItem("students")) || [];
  });

  const [formData, setFormData] = useState({
    name: "",
    disability: "none",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert("Enter student name");

    const newStudent = {
      name: formData.name.trim(),
      disability: formData.disability,
      levels: { maths: "Class 1", science: "Class 1" },
      scores: { maths: 0, science: 0 },
      completedLessons: [],
      testScores: {},
      placementDone: false,
    };

    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem("students", JSON.stringify(updated));

    setFormData({ name: "", disability: "none" });
    setShowForm(false);
  };

  const badgeColor = (d) => {
    if (d === "blind") return "#fde68a";
    if (d === "deaf") return "#bfdbfe";
    if (d === "adhd") return "#fecaca";
    return "#e5e7eb";
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Your Students 🌱</h2>

      {students.map((s, i) => (
        <div key={i} style={styles.card}>
          <div>
            <h3 style={{ margin: 0 }}>{s.name}</h3>
            <span
              style={{
                ...styles.badge,
                background: badgeColor(s.disability),
              }}
            >
              {typeof s.disability === "string"
  ? s.disability.toUpperCase()
  : s.disability
  ? "BLIND"
  : "NONE"}

            </span>
          </div>

          <button
            style={styles.viewBtn}
            onClick={() => navigate(`/guardian/student/${i}`)}
          >
            View Progress
          </button>
        </div>
      ))}

      <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>
        + Add Student
      </button>

      {showForm && (
        <div style={styles.formCard}>
          <h3>Add New Student</h3>

          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              name="name"
              placeholder="Student Name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
            />

            <select
              name="disability"
              value={formData.disability}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="none">No Disability</option>
              <option value="blind">Blind (Audio Support)</option>
              <option value="deaf">Deaf</option>
              <option value="adhd">ADHD</option>
            </select>

            <button type="submit" style={styles.saveBtn}>
              Save Student
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  page: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "28px",
    fontWeight: "800",
  },
  card: {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.06)",
  },
  badge: {
    marginTop: "6px",
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
  },
  viewBtn: {
    background: "#10b981",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
  },
  addBtn: {
    marginTop: "20px",
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    background: "#065f46",
    color: "white",
    fontWeight: "700",
    cursor: "pointer",
  },
  formCard: {
    marginTop: "30px",
    background: "#ffffff",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 6px 12px rgba(0,0,0,0.06)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginTop: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    fontSize: "14px",
  },
  saveBtn: {
    background: "#4f46e5",
    color: "white",
    border: "none",
    padding: "12px",
    borderRadius: "12px",
    fontWeight: "700",
    cursor: "pointer",
  },
};
