import React, { useState, useEffect } from "react";
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
    disability: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Enter student name");
      return;
    }

    const newStudent = {
      name: formData.name.trim(),
      disability: formData.disability,
      levels: { maths: "Class 1", science: "Class 1" },
      scores: { maths: 0, science: 0 },
      completedLessons: [],
      testScores: {},
      placementDone: false, // track if baseline test is done
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setFormData({ name: "", disability: false });
    setShowForm(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("guardianLoggedIn");
    navigate("/");
  };

  return (
    <div className="app-container">
      <div className="topbar">
        <div className="logo">Guardian Dashboard</div>
        <button onClick={handleLogout} style={{ marginLeft: "auto" }}>
          Logout
        </button>
      </div>

      <div className="content">
        <h2 style={{ marginBottom: "20px" }}>Your Students 🌱</h2>

        {students.map((student, index) => (
          <div className="card" key={index}>
            <h3>{student.name}</h3>
            <p>Disability: {student.disability ? "Yes (Audio Mode)" : "No"}</p>
            <p>Maths Level: {student.levels.maths}</p>
            <p>Science Level: {student.levels.science}</p>
          </div>
        ))}

        <button onClick={() => setShowForm(!showForm)}>+ Add Student</button>

        {showForm && (
          <div className="card" style={{ marginTop: "20px" }}>
            <h3>Add New Student</h3>
            <form onSubmit={handleSubmit}>
              <input
                name="name"
                placeholder="Student Name"
                value={formData.name}
                onChange={handleChange}
              />

              <label style={{ display: "flex", gap: "10px" }}>
                <input
                  type="checkbox"
                  name="disability"
                  checked={formData.disability}
                  onChange={handleChange}
                />
                Has Disability (Audio Content)
              </label>

              <button type="submit">Save Student</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
