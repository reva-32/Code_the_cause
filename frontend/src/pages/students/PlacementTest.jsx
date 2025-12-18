import React, { useState } from "react";
import { BASELINE_TEST } from "../../data/baselineTests";

export default function PlacementTest({ student, setStudent }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleSubmit = () => {
    const updatedStudent = { ...student, placementDone: true, levels: {} };

    const correctCounts = {};
    BASELINE_TEST.forEach((q) => {
      if (!correctCounts[q.subject]) correctCounts[q.subject] = 0;
      if (answers[q.id] === q.answer) correctCounts[q.subject]++;
    });

    Object.keys(correctCounts).forEach((subject) => {
      const total = BASELINE_TEST.filter((q) => q.subject === subject).length;
      updatedStudent.levels[subject] =
        correctCounts[subject] / total >= 0.5 ? "Class 2" : "Class 1";
    });

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updatedStudents = students.map((s) =>
      s.name === student.name ? updatedStudent : s
    );
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setStudent(updatedStudent);
    setSubmitted(true);
  };

  if (submitted) return <p>Placement test completed! Lessons unlocked ✅</p>;

  return (
    <div className="card">
      <h3>Placement Test 📝</h3>
      {BASELINE_TEST.map((q) => (
        <div key={q.id}>
          <p>{q.question}</p>
          {q.options.map((opt) => (
            <label key={opt}>
              <input
                type="radio"
                name={q.id}
                value={opt}
                checked={answers[q.id] === opt}
                onChange={(e) => handleChange(q.id, e.target.value)}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
