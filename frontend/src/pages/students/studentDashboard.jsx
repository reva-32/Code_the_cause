import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Lessons from "./Lessons";
import StudentProgress from "./StudentProgress";
import PlacementTest from "./PlacementTest";

// Translation Dictionary for NGO kids (English & Hindi)
const translations = {
  en: {
    welcome: "Welcome back",
    logout: "Logout",
    doubtSolver: "AI DOUBT SOLVER",
    askDoubt: "Ask a doubt...",
    modeLearning: "Learning Path",
    modeAssessment: "Initial Assessment",
    maths: "Mathematics",
    science: "Science",
    badges: { starter: "Starter", achiever: "Achiever", master: "Master" }
  },
  hi: {
    welcome: "सुस्वागतम",
    logout: "लॉगआउट",
    doubtSolver: "एआई शंका समाधान",
    askDoubt: "अपनी शंका पूछें...",
    modeLearning: "सीखने का मार्ग",
    modeAssessment: "प्रारंभिक मूल्यांकन",
    maths: "गणित",
    science: "विज्ञान",
    badges: { starter: "शुरुआत", achiever: "सफल", master: "महारत" }
  }
};

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en"); 
  const [activeWatchProgress, setActiveWatchProgress] = useState(0); // Tracks real-time video %
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const t = translations[lang];

  // Branding Colors
  const colors = {
    primaryDeep: "#065f46", // Dark Emerald Green
    accentGreen: "#10b981", // Brand Green
    pastelBg: "#f0fdf4",    // Pastel Green Background
    darkSlate: "#0f172a"    // Chatbot Header
  };

  const loadLatestData = () => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const loggedIn = students.find((s) => s.name === name);
    if (loggedIn) {
      setStudent({ ...loggedIn });
    } else {
      navigate("/");
    }
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

  const getBadges = () => {
    if (!student) return [];
    const count = student.completedLessons?.length || 0;
    const badges = [];
    if (count >= 1) badges.push({ tag: "🌱", label: t.badges.starter, color: "#d1fae5" });
    if (count >= 3) badges.push({ tag: "🔥", label: t.badges.achiever, color: "#fef3c7" });
    if (count >= 5) badges.push({ tag: "🏆", label: t.badges.master, color: "#e0e7ff" });
    return badges;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", {
        message: userText,
        source: "student_dashboard",
      });
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
    setActiveWatchProgress(0); // Reset live progress after completion
    loadLatestData(); 
    navigate(`/student/test/${lessonId}`, { state: { subject } });
  };

  if (!student) return null;

  return (
    <div style={{ backgroundColor: colors.pastelBg, minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1350px", margin: "0 auto", fontFamily: "'Segoe UI', Roboto, sans-serif" }}>
        
        {/* NAVIGATION BAR */}
        <nav style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          background: "#fff", 
          padding: "12px 25px", 
          borderRadius: "24px", 
          marginBottom: "25px",
          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.04)",
          border: "1px solid #eef2f3"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ fontSize: "26px", fontWeight: "900", color: colors.primaryDeep, letterSpacing: "-1px" }}>EduLift</div>
            <div style={{ width: "1px", height: "25px", background: "#e2e8f0" }}></div>
            <div style={{ fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", fontSize: "11px", letterSpacing: "1px" }}>
                {student.placementDone ? t.modeLearning : t.modeAssessment}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {/* Language Switcher */}
            <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "12px" }}>
              <button onClick={() => setLang("en")} style={{ padding: "8px 16px", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: "800", background: lang === "en" ? colors.primaryDeep : "transparent", color: lang === "en" ? "#fff" : "#64748b", transition: "0.3s" }}>EN</button>
              <button onClick={() => setLang("hi")} style={{ padding: "8px 16px", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "12px", fontWeight: "800", background: lang === "hi" ? colors.primaryDeep : "transparent", color: lang === "hi" ? "#fff" : "#64748b", transition: "0.3s" }}>हिन्दी</button>
            </div>
            
            <button 
              onClick={handleLogout}
              style={{ padding: "10px 20px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
            >
              {t.logout} 🚪
            </button>
          </div>
        </nav>

        {/* HEADER SECTION */}
        <header style={{ marginBottom: "30px", paddingLeft: "10px" }}>
            <h2 style={{ margin: 0, color: colors.darkSlate, fontSize: "30px", fontWeight: "800" }}>{t.welcome}, {student.name} 👋</h2>
            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              {getBadges().map((badge, i) => (
                <span key={i} style={{ background: badge.color, padding: "6px 16px", borderRadius: "30px", fontSize: "12px", fontWeight: "800", border: "1px solid rgba(0,0,0,0.03)", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
                  {badge.tag} {badge.label}
                </span>
              ))}
            </div>
        </header>

        {!student.placementDone ? (
          <PlacementTest student={student} setStudent={setStudent} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "30px", alignItems: "start" }}>
            
            {/* Left Column: Video Lessons */}
            <div style={{ animation: "fadeIn 0.5s ease" }}>
              <Lessons 
                student={student} 
                onComplete={handleCompleteLesson} 
                lang={lang} 
                t={t} 
                setWatchProgress={setActiveWatchProgress} // Pass setter to update progress bar live
                primaryColor={colors.primaryDeep} 
              />
            </div>

            {/* Right Column: Progress Dashboard & AI Chat */}
            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
              
              <StudentProgress 
                student={student} 
                lang={lang} 
                t={t} 
                currentLessonProgress={activeWatchProgress} 
              />
              
              {/* CHATBOT BOX */}
              <div style={{ borderRadius: "28px", background: "#fff", height: "580px", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.05)", overflow: "hidden", border: "1px solid #eef2f3" }}>
                <div style={{ 
                  padding: "20px 24px", 
                  background: `linear-gradient(135deg, ${colors.primaryDeep} 0%, #064e3b 100%)`, 
                  color: "white", 
                  fontWeight: "bold", 
                  fontSize: "14px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px" 
                }}>
                  <span style={{ fontSize: "18px" }}>🤖</span> {t.doubtSolver}
                </div>
                
                <div style={{ flex: 1, overflowY: "auto", padding: "20px", background: "#fafafa" }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ marginBottom: "16px", textAlign: msg.role === "user" ? "right" : "left" }}>
                      <div style={{ 
                        display: "inline-block", 
                        padding: "12px 18px", 
                        borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px", 
                        background: msg.role === "user" ? colors.primaryDeep : "#fff", 
                        color: msg.role === "user" ? "#fff" : "#1e293b", 
                        maxWidth: "85%", fontSize: "14px", fontWeight: "500", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", border: msg.role === "bot" ? "1px solid #e2e8f0" : "none"
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div style={{ padding: "18px", background: "#fff", display: "flex", gap: "10px", borderTop: "1px solid #f1f5f9" }}>
                  <input 
                    style={{ flex: 1, padding: "14px", borderRadius: "14px", border: "2px solid #f1f5f9", outline: "none", fontSize: "14px" }} 
                    onFocus={(e) => e.target.style.borderColor = colors.primaryDeep}
                    onBlur={(e) => e.target.style.borderColor = "#f1f5f9"}
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()} 
                    placeholder={t.askDoubt} 
                  />
                  <button onClick={sendMessage} style={{ background: colors.primaryDeep, color: "white", border: "none", borderRadius: "14px", width: "50px", cursor: "pointer", transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"} onMouseOut={(e) => e.currentTarget.style.opacity = "1"}>
                    ➤
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}