import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Lessons from "./Lessons";
import StudentProgress from "./StudentProgress";
import PlacementTest from "./PlacementTest";

const translations = {
  en: {
    welcome: "Welcome back", logout: "Logout", doubtSolver: "AI DOUBT SOLVER",
    askDoubt: "Ask a doubt...", modeLearning: "Learning Path",
    modeAssessment: "Initial Assessment", maths: "Mathematics", science: "Science",
    badges: { starter: "Starter", achiever: "Achiever", master: "Master" }
  },
  hi: {
    welcome: "सुस्वागतम", logout: "लॉगआउट", doubtSolver: "एआई शंका समाधान",
    askDoubt: "अपनी शंका पूछें...", modeLearning: "सीखने का मार्ग",
    modeAssessment: "प्रारंभिक मूल्यांकन", maths: "गणित", science: "विज्ञान",
    badges: { starter: "शुरुआत", achiever: "सफल", master: "महारत" }
  }
};

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en"); 
  const [activeWatchProgress, setActiveWatchProgress] = useState(0); 
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const t = translations[lang];

  const colors = {
    primaryDeep: "#065f46",
    pastelBg: "#f0fdf4",
    darkSlate: "#0f172a"
  };

  const loadLatestData = () => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const loggedIn = students.find((s) => s.name === name);
    if (loggedIn) setStudent({ ...loggedIn });
    else navigate("/");
  };

  useEffect(() => {
    loadLatestData();
    window.addEventListener("focus", loadLatestData);
    return () => window.removeEventListener("focus", loadLatestData);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem("loggedInStudent");
    navigate("/");
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", { message: userText, source: "student_dashboard" });
      setMessages((prev) => [...prev, { role: "bot", content: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", content: lang === 'en' ? "⚠️ Chatbot unavailable." : "⚠️ चैटबॉट अनुपलब्ध है।" }]);
    }
  };

  const handleCompleteLesson = (lessonId, subject) => {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updatedStudents = students.map((s) => {
      if (s.name === student.name) {
        const completed = s.completedLessons || [];
        if (!completed.includes(lessonId)) completed.push(lessonId);
        return { ...s, completedLessons: completed };
      }
      return s;
    });
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setActiveWatchProgress(0);
    loadLatestData(); 
    navigate(`/student/test/${lessonId}`, { state: { subject } });
  };

  if (!student) return null;

  const formatBotMessage = (text) => {
    return text.replace(/📌 ANSWER/g, "<h3>📌 Answer</h3>")
      .replace(/📖 EXPLANATION/g, "<h3>📖 Explanation</h3>")
      .replace(/💡 EXAMPLE/g, "<h3>💡 Example</h3>")
      .replace(/-{3,}/g, "<hr />")
      .replace(/(\d+\.)/g, "<br/><strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  return (
    <div style={{ backgroundColor: colors.pastelBg, minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", fontFamily: "sans-serif" }}>
        
        {/* TOP NAV */}
        <nav style={styles.nav}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ fontSize: "24px", fontWeight: "900", color: colors.primaryDeep }}>EduLift</div>
            <div style={styles.badge}>{student.placementDone ? t.modeLearning : t.modeAssessment}</div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={styles.langBtn}>
              {lang === 'en' ? "हिन्दी" : "English"}
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>{t.logout} 🚪</button>
          </div>
        </nav>

        {!student.placementDone ? (
          <PlacementTest student={student} setStudent={setStudent} />
        ) : (
          <>
            {/* 1. PROGRESS BAR AT TOP */}
            <StudentProgress 
              student={student} lang={lang} t={t} 
              currentLessonProgress={activeWatchProgress} 
            />

            {/* 2. MAIN CONTENT GRID */}
            <div style={styles.dashboardGrid}>
              
              {/* LESSONS COLUMN */}
              <div style={styles.card}>
                <Lessons 
                  student={student} onComplete={handleCompleteLesson} 
                  lang={lang} t={t} setWatchProgress={setActiveWatchProgress} 
                  primaryColor={colors.primaryDeep} 
                />
              </div>

              {/* CHATBOT COLUMN */}
              <div style={styles.chatbotContainer}>
                <div style={styles.chatHeader}>🤖 {t.doubtSolver}</div>
                <div style={styles.chatBody}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ textAlign: msg.role === "user" ? "right" : "left", marginBottom: "15px" }}>
                      <div style={{...styles.bubble, background: msg.role === "user" ? colors.primaryDeep : "#f1f5f9", color: msg.role === "user" ? "#fff" : "#334155"}}>
                        <div dangerouslySetInnerHTML={{ __html: msg.role === "bot" ? formatBotMessage(msg.content) : msg.content }} />
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div style={styles.chatInputRow}>
                  <input style={styles.input} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={t.askDoubt} />
                  <button onClick={sendMessage} style={styles.sendBtn}>➤</button>
                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  nav: { display: "flex", justifyContent: "space-between", background: "#fff", padding: "15px 30px", borderRadius: "20px", marginBottom: "20px", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  badge: { background: "#f1f5f9", padding: "5px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", color: "#64748b" },
  langBtn: { border: "1px solid #ddd", background: "#fff", padding: "8px 15px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" },
  logoutBtn: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 15px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" },
  dashboardGrid: { display: "grid", gridTemplateColumns: "1fr 450px", gap: "25px", marginTop: "25px", height: "700px" },
  card: { background: "#fff", borderRadius: "24px", overflowY: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", padding: "20px" },
  chatbotContainer: { background: "#fff", borderRadius: "24px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" },
  chatHeader: { background: "#065f46", color: "#fff", padding: "20px", fontWeight: "bold" },
  chatBody: { flex: 1, overflowY: "auto", padding: "20px", background: "#fcfcfc" },
  chatInputRow: { padding: "15px", borderTop: "1px solid #eee", display: "flex", gap: "10px" },
  input: { flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #ddd", outline: "none" },
  sendBtn: { background: "#065f46", color: "#fff", border: "none", width: "50px", borderRadius: "12px", cursor: "pointer" },
  bubble: { display: "inline-block", padding: "12px 16px", borderRadius: "15px", maxWidth: "85%", fontSize: "14px", lineHeight: "1.5" }
};