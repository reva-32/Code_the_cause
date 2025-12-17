import React, { useState } from "react";
import "../../App.css";

export default function GuardianDashboard() {
  const [showForm, setShowForm] = useState(false);

  const [students, setStudents] = useState([
    {
      name: "Rahul",
      age: 7,
      disability: false,
      progress: 60,
    },
    {
      name: "Anaya",
      age: 6,
      disability: true,
      progress: 35,
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    grade: "",
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

    if (!formData.name || !formData.age || !formData.grade) return;

    setStudents([
      ...students,
      {
        ...formData,
        progress: 0, // new student starts at 0%
      },
    ]);

    setFormData({ name: "", age: "", grade: "", disability: false });
    setShowForm(false);
  };

  return (
    <div className="app-container">
      {/* TOPBAR */}
      <div className="topbar">
        <div className="logo">Guardian Dashboard</div>
      </div>

      <div className="content">
        <h2 style={{ marginBottom: "20px" }}>
          Your Students 🌱
        </h2>

        {/* STUDENT CARDS */}
        {students.map((student, index) => (
          <div className="card" key={index}>
            <h3>{student.name}</h3>
            <p>Age: {student.age}</p>
            <p>{student.grade}</p>
            <p>
              Disability:{" "}
              {student.disability ? "Yes (Audio Mode)" : "No"}
            </p>

            {/* PROGRESS BAR */}
            <div
              style={{
                marginTop: "10px",
                background: "#e6f4ea",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${student.progress}%`,
                  background: "#74c69d",
                  padding: "6px",
                  color: "#1b4332",
                  fontSize: "13px",
                  textAlign: "center",
                }}
              >
                {student.progress}% Completed
              </div>
            </div>
          </div>
        ))}

        {/* ADD STUDENT BUTTON */}
        <button
          style={{ marginTop: "10px" }}
          onClick={() => setShowForm(!showForm)}
        >
          + Add Student
        </button>

        {/* ADD STUDENT FORM */}
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

              <input
                name="age"
                type="number"
                placeholder="Age"
                value={formData.age}
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

              <br />
              <button type="submit">Save Student</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
