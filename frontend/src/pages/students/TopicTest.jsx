import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applyPromotion } from "../../data/promotionRules";

const TESTS = {
  "maths-1-1": {
    subject: "maths",
    questions: [
      { q: "2 + 3 = ?", options: ["4", "5", "6"], answer: "5" },
      { q: "5 + 5 = ?", options: ["8", "9", "10"], answer: "10" },
    ],
  },
};

export default function TopicTest() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const test = TESTS[lessonId];

  const student = JSON.parse(localStorage.getItem("student"));
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(null);

  useEffect(() => {
    if (!student) navigate("/student/login");
  }, []);

  const submitTest = () => {
    let correct = 0;
    test.questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });

    const percent = Math.round(
      (correct / test.questions.length) * 100
    );

    let updated = { ...student };

    updated.testScores[lessonId] = percent;

    updated = applyPromotion({
      student: updated,
      subject: test.subject,
      score: percent,
    });

    if (percent >= 90) {
      updated.completedLessons.push(lessonId);
    }

    localStorage.setItem("student", JSON.stringify(updated));
    setScore(percent);
  };

  if (!test) return <p>Test not found</p>;

  return (
    <div className="content">
      <div className="card">
        <h2>📝 Topic Test</h2>

        {test.questions.map((q, i) => (
          <div key={i}>
            <p>{q.q}</p>
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  const copy = [...answers];
                  copy[i] = opt;
                  setAnswers(copy);
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        ))}

        <button onClick={submitTest}>Submit</button>

        {score !== null && (
          <h3>
            Score: {score}% {score >= 90 ? "✅ Passed" : "❌ Retry"}
          </h3>
        )}
      </div>
    </div>
  );
}
