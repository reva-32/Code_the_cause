import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TOPIC_TEST, evaluateTopicTest, getSimplifiedQuestions } from "../../data/topicTests";
import { promoteIfEligible } from "../../logic/promotionEngine";

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

  /* ================= 1. THE SHARED FEMALE VOICE ENGINE ================= */
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Exact logic from StudentDashboard and Wellness Form
    const indianFemale = voices.find(v =>
      (v.lang.includes("en-IN") || v.lang.includes("hi-IN")) &&
      (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google") || v.name.toLowerCase().includes("heera"))
    );

    if (indianFemale) {
      utterance.voice = indianFemale;
    }

    utterance.rate = 0.85; // Comforting, clear pace for testing
    utterance.pitch = 1.0; 
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Ensure voices load for the engine
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const s = students.find((x) => x.name === name);
    
    if (!s) return navigate("/");

    const sub = location.state?.subject || (lessonId.includes("maths") ? "maths" : "science");
    const currentLevel = s.levels[sub].replace(/\s/g, "").toLowerCase();
    
    const test = TOPIC_TEST.find(t =>
      t.subject === sub &&
      t.level.replace(/\s/g, "").toLowerCase() === currentLevel
    );

    let finalQuestions = test?.questions || [];
    const fails = s.failAttempts?.[lessonId] || 0;
    const adminSimplified = s.activeIntervention === "SIMPLIFY_CONTENT" && 
                           (s.interventionSubject === sub || s.interventionSubject === "all");

    if (fails >= 1 || adminSimplified) {
      finalQuestions = getSimplifiedQuestions(finalQuestions, sub);
    }

    setStudent(s);
    setSubject(sub);
    setQuestions(finalQuestions);

    const isBlindUser = s.disability?.toLowerCase() === "blind" || s.disability?.toLowerCase() === "visually impaired";
    if (isBlindUser) {
      speak(`Hello ${s.name}. Let's start your ${sub} test. ${adminSimplified ? "I have made the questions easier for you." : ""} 
      You can press 1, 2, 3, or 4 to pick an answer. Press Enter to go to the next question. 
      If you want me to repeat the question, press R.`);
    }
  }, [lessonId, navigate, location.state]);

  const q = questions[currentQuestionIndex];
  const isBlind = student?.disability?.toLowerCase() === "blind" || student?.disability?.toLowerCase() === "visually impaired";
  const isADHD = student?.disability?.toLowerCase() === "adhd";

  useEffect(() => {
    if (isBlind && q && !submitted) {
      handleReadQuestion();
    }
  }, [currentQuestionIndex, questions, isBlind, submitted]);

  const handleReadQuestion = () => {
    if (!q) return;
    const optionsText = q.options.map((opt, i) => `Option ${i + 1}: ${opt}`).join(". ");
    speak(`Question ${currentQuestionIndex + 1}. ${q.question}. ${optionsText}`);
  };

  const handleOptionSelect = (opt, index) => {
    setAnswers({ ...answers, [currentQuestionIndex]: opt });
    if (isBlind) speak(`Option ${index + 1} chosen.`);
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
        // 1. Identify the correct subject array
        const subjectKey = subject.toLowerCase() === 'maths' ? 'completedMathsLessons' : 'completedScienceLessons';

        // 2. Update BOTH the general and subject-specific arrays
        const generalCompleted = s.completedLessons || [];
        const subjectCompleted = s[subjectKey] || [];

        if (result >= 35) {
          if (!generalCompleted.includes(lessonId)) generalCompleted.push(lessonId);
          if (!subjectCompleted.includes(lessonId)) subjectCompleted.push(lessonId);
        }

        // 3. Handle Fail Attempts
        let failMap = s.failAttempts || {};
        let currentFails = result < 35 ? (failMap[lessonId] || 0) + 1 : 0;

        // ... (keep your alert logic here) ...

        const updatedStudent = promoteIfEligible(s, subject, result, false);

        return {
          ...updatedStudent,
          completedLessons: generalCompleted,
          [subjectKey]: subjectCompleted, // Save to completedScienceLessons or completedMathsLessons
          failAttempts: { ...failMap, [lessonId]: currentFails }
        };
      }
      return s;
    });
    
    localStorage.setItem("students", JSON.stringify(updated));

    if (isBlind) {
      const feedback = result >= 35 ? "Great job! You passed." : "Keep practicing.";
      speak(`Test complete. Your score is ${result} percent. Press Enter to return to dashboard.`);
    }
  };

  /* ================= 2. KEYBOARD CONTROLS ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isBlind || submitted) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        if (q?.options[idx]) handleOptionSelect(q.options[idx], idx);
      }
      if (e.key === "Enter") {
        if (answers[currentQuestionIndex]) nextQuestion();
        else speak("Please pick an answer first.");
      }
      if (e.key.toLowerCase() === "r") handleReadQuestion();
    };

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

  const showBadge = student.activeIntervention === "SIMPLIFY_CONTENT" && 
                    (student.interventionSubject === subject || student.interventionSubject === "all");

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px", fontFamily: "'Inter', sans-serif" }}>
      {showBadge && !submitted && (
        <div style={{ background: "#ecfeff", color: "#0891b2", padding: "15px 20px", borderRadius: "12px", marginBottom: "15px", fontWeight: "bold", border: "1px solid #0891b2", textAlign: 'center' }}>
          ✨ Simplified Mode Active: Questions are tailored for you!
        </div>
      )}

      {!submitted ? (
        <div style={{
          background: "#fff",
          padding: isADHD ? "40px" : "30px",
          borderRadius: "24px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          border: isADHD ? "3px solid #065f46" : "1px solid #f1f5f9"
        }}>
          <div style={{ marginBottom: "30px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", fontWeight: "bold", color: "#64748b", marginBottom: "10px" }}>
              <span>{subject.toUpperCase()} QUIZ - {student.levels[subject]}</span>
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
                {isBlind && <button onClick={handleReadQuestion} style={styles.audioIconBtn} title="Repeat Question">🔊</button>}
                <h2 style={{ fontSize: isADHD ? "26px" : "22px", color: "#1e293b", margin: 0, lineHeight: "1.4" }}>{q.question}</h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {q.options.map((opt, index) => {
                  const isSelected = answers[currentQuestionIndex] === opt;
                  return (
                    <button 
                        key={opt} 
                        onClick={() => handleOptionSelect(opt, index)} 
                        style={{ ...styles.optionBtn(isSelected), fontSize: isADHD ? "18px" : "16px" }}
                        aria-label={`Option ${index + 1}: ${opt}`}
                    >
                      <div style={styles.radioCircle(isSelected)} />
                      <span style={{ fontWeight: "bold", marginRight: "10px" }}>{index + 1}.</span> {opt}
                    </button>
                  );
                })}
              </div>

              <div style={{ marginTop: "40px", display: "flex", justifyContent: "flex-end" }}>
                <button 
                  disabled={!answers[currentQuestionIndex]} 
                  onClick={nextQuestion} 
                  style={styles.submitBtn(!!answers[currentQuestionIndex])}
                >
                  {currentQuestionIndex < questions.length - 1 ? "Next Question ➔" : "Submit Test 🏁"}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "50px", background: "#fff", borderRadius: "24px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "60px", marginBottom: "20px" }}>{score >= 35 ? "🎉" : "📚"}</div>
          <h1 style={{ fontSize: "40px", color: "#1e293b", margin: "10px 0" }}>{score}%</h1>
          <p style={{ color: "#64748b", fontSize: "18px" }}>{score >= 35 ? "Great job, Rose!" : "Keep practicing, you can do it!"}</p>
          <button onClick={() => navigate("/student/dashboard")} style={styles.finalBtn}>Back to Dashboard</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  audioIconBtn: { background: "#f1f5f9", border: "none", borderRadius: "12px", padding: "10px 15px", fontSize: "20px", cursor: "pointer", display: 'flex', alignItems: 'center', justifyContent: 'center' },
  optionBtn: (isSelected) => ({
    padding: "18px", textAlign: "left", borderRadius: "15px", outline: "none",
    border: isSelected ? "2px solid #10b981" : "2px solid #f1f5f9",
    background: isSelected ? "#f0fdf4" : "#fff",
    cursor: "pointer", display: "flex", alignItems: "center", gap: "15px", transition: "all 0.2s"
  }),
  radioCircle: (isSelected) => ({ width: "20px", height: "20px", borderRadius: "50%", border: isSelected ? "6px solid #10b981" : "2px solid #cbd5e1", background: "#fff" }),
  submitBtn: (ready) => ({ padding: "16px 35px", background: ready ? "#065f46" : "#cbd5e1", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "800", cursor: ready ? "pointer" : "not-allowed" }),
  finalBtn: { padding: "15px 40px", borderRadius: "12px", background: "#065f46", color: "white", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: "20px", fontSize: '16px' }
};