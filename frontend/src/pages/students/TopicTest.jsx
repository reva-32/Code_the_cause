import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TOPIC_TEST, evaluateTopicTest } from "../../data/topicTests";

export default function TopicTest() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lessonId } = useParams();

  const [student, setStudent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [subject, setSubject] = useState("");

  const isBlind = student?.disability === "blind";
  const isADHD = student?.disability === "adhd";

  const speak = (text) => {
    if (!window.speechSynthesis || !isBlind) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.lang = "en-IN";
    window.speechSynthesis.speak(u);
  };

  // 1. INITIAL SETUP
  useEffect(() => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const s = students.find((x) => x.name === name);
    if (!s) return navigate("/");

    const sub = location.state?.subject || (lessonId.includes("maths") ? "maths" : "science");
    const test = TOPIC_TEST.find(t =>
      t.subject === sub &&
      t.level.replace(/\s/g, "").toLowerCase() === s.levels[sub].replace(/\s/g, "").toLowerCase()
    );

    setStudent(s);
    setSubject(sub);
    setQuestions(test?.questions || []);

    if (s.disability === "blind") {
      speak(`Test started. Press 1, 2, 3 or 4 to select options. Press Enter to go to next question. Press R to hear question again.`);
    }
  }, [lessonId]);

  const q = questions[currentQuestionIndex];

  // 2. AUTO-READ ON NEW QUESTION
  useEffect(() => {
    if (isBlind && q && !submitted) {
      handleReadQuestion();
    }
  }, [currentQuestionIndex, questions, isBlind]);

  const handleReadQuestion = () => {
    if (!q) return;
    const optionsText = q.options.map((opt, i) => `Option ${i + 1}: ${opt}`).join(". ");
    speak(`Question ${currentQuestionIndex + 1}: ${q.question}. ${optionsText}`);
  };

  const handleOptionSelect = (opt, index) => {
    setAnswers({ ...answers, [currentQuestionIndex]: opt });
    speak(`Option ${index + 1} selected.`);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const result = evaluateTopicTest(questions, answers);
    setScore(result);
    setSubmitted(true);

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updated = students.map(s => {
      if (s.name === student.name) {
        const completed = s.completedLessons || [];
        if (!completed.includes(lessonId)) completed.push(lessonId);
        return { ...s, completedLessons: completed };
      }
      return s;
    });
    localStorage.setItem("students", JSON.stringify(updated));
    speak(`Test submitted. Your score is ${result} percent. Press Enter to go back to dashboard.`);
  };

  /* ================= 3. KEYBOARD SHORTCUTS LOGIC ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isBlind || submitted) return;

      // Select Option (1, 2, 3, 4)
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (q?.options[idx]) {
          handleOptionSelect(q.options[idx], idx);
        }
      }

      // Next Question / Submit (Enter)
      if (e.key === "Enter") {
        if (answers[currentQuestionIndex]) {
          nextQuestion();
        } else {
          speak("Please select an option first.");
        }
      }

      // Replay Question (R)
      if (e.key.toLowerCase() === "r") {
        handleReadQuestion();
      }
    };

    // Global listener for results screen shortcut
    const handleResultEnter = (e) => {
      if (submitted && e.key === "Enter") navigate("/student/dashboard");
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleResultEnter);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keydown", handleResultEnter);
    };
  }, [isBlind, q, answers, currentQuestionIndex, submitted]);

  if (!student) return null;

  /* ================= 4. RENDER ================= */
  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px", fontFamily: "'Inter', sans-serif" }}>
      {!submitted ? (
        <div style={{
          background: "#fff",
          padding: isADHD ? "40px" : "30px",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: isADHD ? "3px solid #065f46" : "1px solid #f1f5f9"
        }}>

          {/* Progress Bar */}
          <div style={{ marginBottom: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold", color: "#64748b", marginBottom: "10px" }}>
              <span>{subject.toUpperCase()} QUIZ</span>
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
            <div style={{ height: "8px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" }}>
              <div style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                height: "100%", background: "#10b981", transition: "width 0.4s ease"
              }} />
            </div>
          </div>

          {q && (
            <div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "15px", marginBottom: "25px" }}>
                {isBlind && (
                  <button onClick={handleReadQuestion} title="Read Question Aloud (R)" style={styles.audioIconBtn}>🔊</button>
                )}
                <h2 style={{ fontSize: isADHD ? "26px" : "22px", color: "#1e293b", margin: 0, lineHeight: "1.4" }}>
                  {q.question}
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {q.options.map((opt, index) => {
                  const isSelected = answers[currentQuestionIndex] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(opt, index)}
                      style={{
                        ...styles.optionBtn(isSelected),
                        fontSize: isADHD ? "18px" : "16px"
                      }}
                    >
                      <div style={styles.radioCircle(isSelected)} />
                      <span style={{ fontWeight: "bold", marginRight: "10px" }}>{index + 1}.</span> {opt}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: "40px", display: "flex", justifyContent: "flex-end" }}>
                {currentQuestionIndex < questions.length - 1 ? (
                  <button
                    disabled={!answers[currentQuestionIndex]}
                    onClick={nextQuestion}
                    style={styles.navBtn(!!answers[currentQuestionIndex])}
                  >
                    Next Question (Enter) ➔
                  </button>
                ) : (
                  <button
                    disabled={Object.keys(answers).length < questions.length}
                    onClick={handleSubmit}
                    style={styles.submitBtn(Object.keys(answers).length === questions.length)}
                  >
                    Submit Test (Enter) 🏁
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "50px", background: "#fff", borderRadius: "24px" }}>
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>{score >= 50 ? "🎉" : "📚"}</div>
          <h1 style={{ fontSize: "40px", color: "#1e293b" }}>{score}%</h1>
          <p>Test Completed Successfully!</p>
          <button
            onClick={() => navigate("/student/dashboard")}
            style={{ padding: "15px 40px", borderRadius: "12px", background: "#065f46", color: "white", border: "none", fontWeight: "bold", cursor: "pointer" }}
          >
            Back to Dashboard (Enter)
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  audioIconBtn: { background: "#f1f5f9", border: "none", borderRadius: "12px", padding: "10px 15px", fontSize: "20px", cursor: "pointer" },
  optionBtn: (isSelected) => ({
    padding: "18px", textAlign: "left", borderRadius: "15px", outline: "none",
    border: isSelected ? "2px solid #10b981" : "2px solid #f1f5f9",
    background: isSelected ? "#f0fdf4" : "#fff",
    cursor: "pointer", display: "flex", alignItems: "center", gap: "15px", transition: "all 0.2s"
  }),
  radioCircle: (isSelected) => ({
    width: "20px", height: "20px", borderRadius: "50%",
    border: isSelected ? "6px solid #10b981" : "2px solid #cbd5e1"
  }),
  navBtn: (ready) => ({
    padding: "16px 35px", background: ready ? "#065f46" : "#cbd5e1", color: "#fff",
    border: "none", borderRadius: "12px", fontWeight: "800", cursor: ready ? "pointer" : "not-allowed"
  }),
  submitBtn: (ready) => ({
    padding: "16px 35px", background: ready ? "#10b981" : "#cbd5e1", color: "#fff",
    border: "none", borderRadius: "12px", fontWeight: "800", cursor: ready ? "pointer" : "not-allowed"
  })
};