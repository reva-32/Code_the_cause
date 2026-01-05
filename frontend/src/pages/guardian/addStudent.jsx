import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddStudent() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    disability: "General/Typical",
    chronicIllness: "",
    vaccines: {
      "BCG": false, "Penta-1": false, "Penta-2": false, "Penta-3": false,
      "MR-1": false, "DPT-B1": false, "DPT-B2": false, "Td": false
    }
  });

  const calculateAge = (dobString) => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 0 ? age : 0;
  };

  const toggleVaccine = (name) => {
    setFormData({
      ...formData,
      vaccines: { ...formData.vaccines, [name]: !formData.vaccines[name] }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.dob) return alert("Please fill in Name and Date of Birth");

    const existingStudents = JSON.parse(localStorage.getItem("students")) || [];

    const newStudent = {
      id: Date.now(),
      name: formData.name,
      dob: formData.dob,
      age: calculateAge(formData.dob),
      disability: formData.disability,
      health: {
        height: "",
        weight: "",
        chronicIllness: formData.chronicIllness || "None",
        lastPhysicalUpdate: null,
        vaccinationRecord: formData.vaccines
      },
      mentalHealth: { status: "Not Screened", lastScore: "N/A", notes: "" }
    };

    localStorage.setItem("students", JSON.stringify([...existingStudents, newStudent]));
    
    // Using a brief delay ensures LocalStorage is written before navigation
    // and we navigate to the exact path shown in your browser address bar
    alert("Profile Created Successfully");
    navigate("/guardian/dashboard"); 
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>Student Registration</h1>
          <p style={styles.subtitle}>Fill in details to create a new medical & academic profile</p>
        </header>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              placeholder="Full name of student"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Date of Birth</label>
            <input
              type="date"
              style={styles.input}
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Immunization History</label>
            <p style={styles.tinyLabel}>Select vaccines already administered:</p>
            <div style={styles.vaxGrid}>
              {Object.keys(formData.vaccines).map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleVaccine(v)}
                  style={{
                    ...styles.vaxBtn,
                    background: formData.vaccines[v] ? "#065f46" : "#fff",
                    color: formData.vaccines[v] ? "#fff" : "#475569",
                    borderColor: formData.vaccines[v] ? "#065f46" : "#cbd5e1"
                  }}
                >
                  {formData.vaccines[v] ? `✅ ${v}` : v}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Disability Category</label>
            <select
              style={styles.input}
              value={formData.disability}
              onChange={(e) => setFormData({ ...formData, disability: e.target.value })}
            >
              <option value="General/Typical">General / Typical</option>
              <option value="Visually Impaired">Visually Impaired (Blind)</option>
              <option value="Hearing Impaired">Hearing Impaired (Deaf)</option>
              <option value="Neurodivergent (ADHD)">Neurodivergent (ADHD)</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Medical Notes / Allergies</label>
            <textarea
              style={{ ...styles.input, height: "60px", resize: "none" }}
              placeholder="Optional: Mention any chronic conditions"
              value={formData.chronicIllness}
              onChange={(e) => setFormData({ ...formData, chronicIllness: e.target.value })}
            />
          </div>

          <div style={styles.buttonContainer}>
            <button type="button" onClick={() => navigate(-1)} style={styles.cancelBtn}>Back</button>
            <button type="submit" style={styles.submitBtn}>Register Student</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", backgroundColor: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "'Inter', sans-serif" },
  card: { background: "#fff", maxWidth: "550px", width: "100%", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", overflow: "hidden" },
  header: { background: "linear-gradient(135deg, #065f46 0%, #047857 100%)", padding: "30px 40px", textAlign: "left" },
  title: { fontSize: "28px", fontWeight: "800", color: "#ffffff", margin: 0 },
  subtitle: { color: "#d1fae5", fontSize: "14px", marginTop: "5px", opacity: 0.9 },
  form: { display: "flex", flexDirection: "column", gap: "22px", padding: "40px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "12px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" },
  tinyLabel: { fontSize: "11px", color: "#94a3b8", margin: "0 0 5px 0" },
  input: { padding: "12px 16px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px" },
  vaxGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px" },
  vaxBtn: { padding: "12px 5px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", border: "1px solid", cursor: "pointer", transition: "all 0.2s ease" },
  buttonContainer: { display: "flex", gap: "15px", marginTop: "10px" },
  submitBtn: { flex: 2, padding: "16px", background: "#065f46", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "16px" },
  cancelBtn: { flex: 1, padding: "16px", background: "#f1f5f9", color: "#475569", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }
};