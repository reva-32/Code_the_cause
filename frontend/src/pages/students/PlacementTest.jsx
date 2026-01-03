import React, { useState, useEffect } from "react";
import { BASELINE_TEST } from "../../data/baselineTests";

export default function PlacementTest({ student, setStudent }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const speak = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // AUTOMATIC WELCOME AUDIO
  useEffect(() => {
    speak(
      "Welcome to your first test. There are questions below. " +
      "Above each question's options, there is a button on the left that says Read Question. " +
      "Click it to hear the question out loud."
    );
  }, []);

  const handleSubmit = () => {
    const updatedStudent = { ...student, placementDone: true, levels: {} };
    const correctCounts = {};
    BASELINE_TEST.forEach((q) => {
      if (!correctCounts[q.subject]) correctCounts[q.subject] = 0;
      if (answers[q.id] === q.answer) correctCounts[q.subject]++;
    });
    Object.keys(correctCounts).forEach((subject) => {
      const total = BASELINE_TEST.filter((q) => q.subject === subject).length;
      updatedStudent.levels[subject] = correctCounts[subject] === total ? "Class 2" : "Class 1";
    });
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updatedStudents = students.map((s) => s.name === student.name ? updatedStudent : s);
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setStudent(updatedStudent);
    setSubmitted(true);
  };

  if (submitted) return <div style={{textAlign: 'center', padding: '50px'}}><h2>Test Done! Check your Dashboard.</h2></div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", background: "#fff", padding: "40px", borderRadius: "24px" }}>
      <h2 style={{ textAlign: "center", color: "#065f46" }}>Placement Test 📝</h2>
      {BASELINE_TEST.map((q, index) => (
        <div key={q.id} style={{ marginBottom: "40px", borderBottom: "1px solid #eee", paddingBottom: "20px" }}>
          <p style={{ fontWeight: "bold", fontSize: "18px" }}>{index + 1}. {q.question}</p>
          
          <button onClick={() => speak(`${q.question}. Options are: ${q.options.join(", ")}`)} style={testStyles.audioBtn}>
            🔊 Read Question (Left)
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {q.options.map((opt) => (
              <label key={opt} style={{...testStyles.option, borderColor: answers[q.id] === opt ? "#10b981" : "#eee"}}>
                <input type="radio" name={q.id} value={opt} onChange={() => setAnswers({...answers, [q.id]: opt})} style={{marginRight: '10px'}} />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSubmit} disabled={Object.keys(answers).length < BASELINE_TEST.length} style={testStyles.submitBtn}>
        Finish Test 🚀
      </button>
    </div>
  );
}

const testStyles = {
  audioBtn: { background: "#ecfdf5", border: "none", padding: "10px", borderRadius: "8px", marginBottom: "15px", cursor: "pointer", fontWeight: "bold", color: "#065f46" },
  option: { padding: "15px", border: "2px solid", borderRadius: "12px", cursor: "pointer" },
  submitBtn: { width: "100%", padding: "20px", background: "#065f46", color: "#fff", border: "none", borderRadius: "15px", fontWeight: "bold", fontSize: "18px", cursor: "pointer" }
};