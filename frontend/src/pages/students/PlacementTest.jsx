import React, { useState } from "react";
import { BASELINE_TEST } from "../../data/baselineTests";

export default function PlacementTest({ student, setStudent }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const colors = {
    primaryDeep: "#065f46",
    accentGreen: "#10b981",
    softBg: "#f8fafc",
    slate: "#1e293b"
  };

  const handleChange = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleSubmit = () => {
    const updatedStudent = { ...student, placementDone: true, levels: {} };

    const correctCounts = {};
    
    // Count correct answers per subject
    BASELINE_TEST.forEach((q) => {
      if (!correctCounts[q.subject]) correctCounts[q.subject] = 0;
      if (answers[q.id] === q.answer) correctCounts[q.subject]++;
    });

    // Determine level: Must be 100% correct to get Class 2
    Object.keys(correctCounts).forEach((subject) => {
      const totalQuestionsForSubject = BASELINE_TEST.filter((q) => q.subject === subject).length;
      const score = correctCounts[subject];

      // STRICT LOGIC: If score is exactly equal to total, Class 2. Otherwise, Class 1.
      if (score === totalQuestionsForSubject) {
        updatedStudent.levels[subject] = "Class 2";
      } else {
        updatedStudent.levels[subject] = "Class 1";
      }
    });

    // Save to LocalStorage
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updatedStudents = students.map((s) =>
      s.name === student.name ? updatedStudent : s
    );
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    
    // Update state and finish
    setStudent(updatedStudent);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: "28px", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ fontSize: "60px", marginBottom: "20px" }}>🎓</div>
        <h2 style={{ color: colors.primaryDeep, fontSize: "28px" }}>Assessment Complete!</h2>
        <p style={{ color: colors.slate, fontSize: "18px" }}>
          We have analyzed your results. Your personalized learning path is ready!
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "30px" }}>
           <div style={{ padding: "15px 25px", background: colors.softBg, borderRadius: "15px", border: `1px solid #eef2f3` }}>
              <small style={{ color: "#64748b", fontWeight: "bold" }}>MATHS</small>
              <div style={{ fontWeight: "800", color: colors.primaryDeep }}>{student.levels.maths}</div>
           </div>
           <div style={{ padding: "15px 25px", background: colors.softBg, borderRadius: "15px", border: `1px solid #eef2f3` }}>
              <small style={{ color: "#64748b", fontWeight: "bold" }}>SCIENCE</small>
              <div style={{ fontWeight: "800", color: colors.primaryDeep }}>{student.levels.science}</div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: "800px", 
      margin: "0 auto", 
      background: "#fff", 
      padding: "40px", 
      borderRadius: "28px", 
      boxShadow: "0 15px 35px rgba(0,0,0,0.05)",
      border: "1px solid #eef2f3"
    }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ color: colors.primaryDeep, margin: 0, fontSize: "28px" }}>Placement Test 📝</h2>
        <p style={{ color: "#64748b", marginTop: "10px" }}>You must answer all questions correctly to unlock advanced levels!</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "35px" }}>
        {BASELINE_TEST.map((q, index) => (
          <div key={q.id} style={{ 
            paddingBottom: "30px", 
            borderBottom: index !== BASELINE_TEST.length - 1 ? "1px solid #f1f5f9" : "none" 
          }}>
            <p style={{ fontSize: "18px", fontWeight: "700", color: colors.slate, marginBottom: "18px" }}>
              <span style={{ color: colors.accentGreen, marginRight: "10px" }}>Q{index + 1}.</span> {q.question}
            </p>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {q.options.map((opt) => (
                <label 
                  key={opt} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    padding: "16px 20px", 
                    borderRadius: "16px", 
                    border: answers[q.id] === opt ? `2px solid ${colors.accentGreen}` : "2px solid #f1f5f9",
                    background: answers[q.id] === opt ? "#f0fdf4" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontWeight: "600",
                    color: answers[q.id] === opt ? colors.primaryDeep : colors.slate
                  }}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    style={{ accentColor: colors.primaryDeep, width: "18px", height: "18px" }}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={Object.keys(answers).length < BASELINE_TEST.length}
        style={{ 
          marginTop: "40px", 
          width: "100%", 
          padding: "18px", 
          background: Object.keys(answers).length < BASELINE_TEST.length ? "#cbd5e1" : colors.primaryDeep, 
          color: "white", 
          border: "none", 
          borderRadius: "16px", 
          fontSize: "18px", 
          fontWeight: "800", 
          cursor: Object.keys(answers).length < BASELINE_TEST.length ? "not-allowed" : "pointer",
          boxShadow: Object.keys(answers).length < BASELINE_TEST.length ? "none" : `0 8px 20px rgba(6, 95, 70, 0.2)`,
        }}
      >
        Submit Assessment 🚀
      </button>
    </div>
  );
}