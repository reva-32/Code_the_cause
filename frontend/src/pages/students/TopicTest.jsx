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

  // Helper to speak text
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.lang = "en-IN";
    window.speechSynthesis.speak(u);
  };

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
    
    // INITIAL GUIDANCE AUDIO
    const welcomeMsg = `Topic Test for ${sub} started. To hear the question and options, click the audio button located on the left side of each question.`;
    speak(welcomeMsg);
  }, [lessonId]);

  const q = questions[currentQuestionIndex];

  // Function for the specific Audio Button next to questions
  const handleReadQuestion = () => {
    const optionsText = q.options.join(", ");
    speak(`Question: ${q.question}. The options are: ${optionsText}`);
  };

  const handleOptionSelect = (opt) => {
    setAnswers({ ...answers, [currentQuestionIndex]: opt });
    speak(`Selected ${opt}`);
  };

  const nextQuestion = () => {
    const nextIdx = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIdx);
    // Brief notification for next question
    speak(`Moving to Question ${nextIdx + 1}`);
  };

  const handleSubmit = () => {
    const result = evaluateTopicTest(questions, answers);
    setScore(result);
    setSubmitted(true);
    
    // Update progress in local storage
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updated = students.map(s => {
      if(s.name === student.name) {
        const completed = s.completedLessons || [];
        if(!completed.includes(lessonId)) completed.push(lessonId);
        return {...s, completedLessons: completed};
      }
      return s;
    });
    localStorage.setItem("students", JSON.stringify(updated));
    speak(`Test submitted. Your score is ${result} percent.`);
  };

  if (!student) return null;

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
          
          {/* PROGRESS HEADER */}
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
                {/* THE LEFT AUDIO BUTTON */}
                <button 
                  onClick={handleReadQuestion}
                  title="Read Question Aloud"
                  style={styles.audioIconBtn}
                >
                  🔊
                </button>
                <h2 style={{ fontSize: isADHD ? "26px" : "22px", color: "#1e293b", margin: 0, lineHeight: "1.4" }}>
                  {q.question}
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {q.options.map((opt) => {
                  const isSelected = answers[currentQuestionIndex] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(opt)}
                      style={{
                        padding: "18px",
                        textAlign: "left",
                        borderRadius: "15px",
                        border: isSelected ? "2px solid #10b981" : "2px solid #f1f5f9",
                        background: isSelected ? "#f0fdf4" : "#fff",
                        fontSize: "16px",
                        fontWeight: isSelected ? "700" : "500",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "15px"
                      }}
                    >
                      <div style={{ 
                        width: "20px", height: "20px", borderRadius: "50%", 
                        border: isSelected ? "6px solid #10b981" : "2px solid #cbd5e1" 
                      }} />
                      {opt}
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
                    Next Question ➔
                  </button>
                ) : (
                  <button
                    disabled={Object.keys(answers).length < questions.length}
                    onClick={handleSubmit}
                    style={styles.submitBtn(Object.keys(answers).length === questions.length)}
                  >
                    Submit Test 🏁
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
          <button 
            onClick={() => navigate("/student/dashboard")}
            style={{ padding: "15px 40px", borderRadius: "12px", background: "#065f46", color: "white", border: "none", fontWeight: "bold", cursor: "pointer" }}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  audioIconBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: "12px",
    padding: "10px 15px",
    fontSize: "20px",
    cursor: "pointer",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
  },
  navBtn: (ready) => ({
    padding: "16px 35px",
    background: ready ? "#065f46" : "#cbd5e1",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: ready ? "pointer" : "not-allowed"
  }),
  submitBtn: (ready) => ({
    padding: "16px 35px",
    background: ready ? "#10b981" : "#cbd5e1",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontWeight: "800",
    cursor: ready ? "pointer" : "not-allowed"
  })
};