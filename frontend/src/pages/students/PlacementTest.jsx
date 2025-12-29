import React, { useState, useEffect } from "react";
import { BASELINE_TEST } from "../../data/baselineTests";

export default function PlacementTest({ student, setStudent }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const colors = {
    primaryDeep: "#065f46",
    accentGreen: "#10b981",
    softBg: "#f8fafc",
    slate: "#1e293b",
  };

  // 🔊 Text-to-Speech helper
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
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

    // Decide level
    Object.keys(correctCounts).forEach((subject) => {
      const total = BASELINE_TEST.filter((q) => q.subject === subject).length;
      updatedStudent.levels[subject] =
        correctCounts[subject] === total ? "Class 2" : "Class 1";
    });

    // Save to localStorage
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updatedStudents = students.map((s) =>
      s.name === student.name ? updatedStudent : s
    );
    localStorage.setItem("students", JSON.stringify(updatedStudents));

    setStudent(updatedStudent);
    setSubmitted(true);
  };

  // 🔊 Speak results automatically
  useEffect(() => {
    if (submitted && student?.levels) {
      speak(
        `Assessment complete. Maths level is ${student.levels.maths}. 
         Science level is ${student.levels.science}.`
      );
    }
  }, [submitted]);

  /* ---------------- RESULT SCREEN ---------------- */

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          textAlign: "center",
          padding: "60px 20px",
          background: "#fff",
          borderRadius: "28px",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <div style={{ fontSize: "60px", marginBottom: "20px" }}>🎓</div>
        <h2 style={{ color: colors.primaryDeep }}>Assessment Complete!</h2>
        <p>Your personalized learning path is ready.</p>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <div style={{ padding: "15px 25px", background: colors.softBg, borderRadius: "15px" }}>
            <small>MATHS</small>
            <div>{student.levels.maths}</div>
          </div>
          <div style={{ padding: "15px 25px", background: colors.softBg, borderRadius: "15px" }}>
            <small>SCIENCE</small>
            <div>{student.levels.science}</div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- TEST SCREEN ---------------- */

  return (
    <div
      role="form"
      aria-labelledby="placement-title"
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        background: "#fff",
        padding: "40px",
        borderRadius: "28px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 id="placement-title" style={{ color: colors.primaryDeep }}>
          Placement Test 📝
        </h2>
        <p>Use keyboard or audio to answer.</p>
      </div>

      {BASELINE_TEST.map((q, index) => (
        <div
          key={q.id}
          style={{ marginBottom: "35px" }}
          role="group"
          aria-labelledby={`question-${q.id}`}
        >
          <p
            id={`question-${q.id}`}
            style={{ fontWeight: "700", fontSize: "18px" }}
          >
            Question {index + 1}. {q.question}
          </p>

          {/* 🔊 Read Question Button */}
          <button
            type="button"
            onClick={() =>
              speak(
                `Question ${index + 1}. ${q.question}. Options are ${q.options.join(", ")}`
              )
            }
            style={{
              marginBottom: "10px",
              background: "#e5f7ef",
              border: "none",
              padding: "8px 14px",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            🔊 Read Question
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {q.options.map((opt) => (
              <label
                key={opt}
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  border:
                    answers[q.id] === opt
                      ? `2px solid ${colors.accentGreen}`
                      : "2px solid #eee",
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name={q.id}
                  value={opt}
                  aria-describedby={`question-${q.id}`}
                  checked={answers[q.id] === opt}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  style={{ marginRight: "10px" }}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={Object.keys(answers).length < BASELINE_TEST.length}
        style={{
          marginTop: "30px",
          width: "100%",
          padding: "18px",
          background:
            Object.keys(answers).length < BASELINE_TEST.length
              ? "#cbd5e1"
              : colors.primaryDeep,
          color: "white",
          border: "none",
          borderRadius: "16px",
          fontSize: "18px",
          fontWeight: "800",
          cursor:
            Object.keys(answers).length < BASELINE_TEST.length
              ? "not-allowed"
              : "pointer",
        }}
      >
        Submit Assessment 🚀
      </button>
    </div>
  );
}
