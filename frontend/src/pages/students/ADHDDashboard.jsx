import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* COMPONENTS */
import Lessons from "./Lessons";
import StudentProgress from "./StudentProgress";
import { shouldShowMentalHealthCheck } from "../../utils/healthStorage";
import PlacementTest from "./PlacementTest";

/* ================= TRANSLATIONS ================= */
const translations = {
  en: { 
    welcome: "Good Day", 
    doubtSolver: "AI Study Buddy", 
    wellnessBtn: "🌿 Wellness Check", 
    hobbyBtn: "🎨 Hobby Hub", 
    learningPath: "My Learning Path", 
    askDoubt: "Ask Buddy anything...", 
    timeRemaining: "Time Left", 
    logout: "Logout",
    timeUp: "Time for a Break!",
    guideBtn: "📖 Open Guide"
  },
  hi: { 
    welcome: "नमस्ते", 
    doubtSolver: "एआई सहायक", 
    wellnessBtn: "🌿 स्वास्थ्य जांच", 
    hobbyBtn: "🎨 हॉबी हब", 
    learningPath: "सीखने का मार्ग", 
    askDoubt: "मुझसे कुछ भी पूछें...", 
    timeRemaining: "समय शेष", 
    logout: "लॉग आउट",
    timeUp: "आराम का समय!",
    guideBtn: "📖 गाइड खोलें"
  }
};

export default function ADHDDashboard() {
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en");
  const [focusMode, setFocusMode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [assignmentStep, setAssignmentStep] = useState("watch");
  const [showWellnessBtn, setShowWellnessBtn] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  // State for the timer (seconds)
  const [timeLeft, setTimeLeft] = useState(18000); // Default 5 hours

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const t = translations[lang];

  const colors = {
    primary: "#6366f1",
    bg: "#f8fafc",
    card: "#ffffff",
    text: "#1e293b",
    accent: "#a855f7",
    success: "#22c55e",
    logoutBg: "#fee2e2",
    logoutText: "#dc2626"
  };

  /* ================= 1. HELPER FUNCTIONS ================= */
  const formatTime = (seconds) => {
    if (seconds <= 0) return "0m 00s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${s < 10 ? '0' + s : s}s`;
  };

  const getRemainingLockTime = () => {
    const lockoutStart = localStorage.getItem(`lockout_${student?.name}`);
    if (!lockoutStart) return null;

    const threeeHoursInMs = 3 * 60 * 60 * 1000;
    const now = Date.now();
    const elapsed = now - parseInt(lockoutStart);
    const remainingMs = threeHoursInMs - elapsed;

    const mins = Math.ceil(remainingMs / (1000 * 60));
    return mins > 0 ? mins : 0;
  };

  /* ================= 2. TIMER & COOL-DOWN LOGIC ================= */
  useEffect(() => {
    if (!student) return;

    const fiveHoursInSec = 5 * 60 * 60;
    const threeHoursInMs = 3 * 60 * 60 * 1000;
    const lockoutStart = localStorage.getItem(`lockout_${student.name}`);

    if (lockoutStart) {
      const now = Date.now();
      const timePassed = now - parseInt(lockoutStart);

      if (timePassed >= twoHoursInMs) {
        // COOL-DOWN EXPIRED: Reset everything
        localStorage.removeItem(`lockout_${student.name}`);
        localStorage.setItem(`timer_${student.name}`, fiveHoursInSec.toString());
        setTimeLeft(fiveHoursInSec);
      } else {
        // STILL IN COOL-DOWN
        setTimeLeft(0);
      }
    } else {
      const savedTime = localStorage.getItem(`timer_${student.name}`);
      setTimeLeft(savedTime ? parseInt(savedTime) : fiveHoursInSec);
    }
  }, [student]);

  useEffect(() => {
    if (timeLeft <= 0 || !student) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          localStorage.setItem(`lockout_${student.name}`, Date.now().toString());
          clearInterval(timer);
          return 0;
        }
        const newTime = prev - 1;
        localStorage.setItem(`timer_${student.name}`, newTime.toString());
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, student]);

  /* ================= 3. DATA LOADING ================= */
  const loadLatestData = () => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const loggedIn = students.find((s) => s.name === name);

    if (loggedIn) {
      setStudent({
        ...loggedIn,
        completedLessons: loggedIn.completedLessons || [],
        verifiedSummaries: loggedIn.verifiedSummaries || [],
        levels: loggedIn.levels || { maths: "Class 1", science: "Class 1" }
      });
      setShowWellnessBtn(shouldShowMentalHealthCheck(name));
      if (!localStorage.getItem(`guide_seen_${name}`)) setShowGuide(true);
    } else {
      navigate("/");
    }
  };

  useEffect(() => { loadLatestData(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /* ================= 4. CORE LOGIC ================= */
  const handleAssignmentUpload = async (file, lessonId) => {
    if (!file) return;
    setIsVerifying(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("lessonId", lessonId);

    try {
      const res = await axios.post("http://127.0.0.1:5001/verify-assignment", formData);
      if (res.data.verified) {
        const students = JSON.parse(localStorage.getItem("students")) || [];
        const updated = students.map(s => {
          if (s.name === student.name) {
            const summaries = s.verifiedSummaries || [];
            if (!summaries.includes(lessonId)) summaries.push(lessonId);
            return { ...s, verifiedSummaries: summaries };
          }
          return s;
        });
        localStorage.setItem("students", JSON.stringify(updated));
        setAssignmentStep("test");
        loadLatestData();
      }
    } catch (err) { console.error(err); } 
    finally { setIsVerifying(false); }
  };

  const handleCompleteLesson = (lessonId) => {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updated = students.map((s) => {
      if (s.name === student.name) {
        const completed = s.completedLessons || [];
        if (!completed.includes(lessonId)) completed.push(lessonId);
        return { ...s, completedLessons: completed };
      }
      return s;
    });
    localStorage.setItem("students", JSON.stringify(updated));
    setAssignmentStep("watch");
    loadLatestData();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");
    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", { message: input, source: "student_dashboard" });
      setMessages([...newMsgs, { role: "bot", content: res.data.reply }]);
    } catch (err) { console.error(err); }
  };

  if (!student) return null;
  if (!student.placementDone) return <PlacementTest student={student} setStudent={setStudent} />;

  /* ================= 5. STYLES ================= */
  const styles = {
    container: { backgroundColor: colors.bg, minHeight: "100vh", padding: "20px", fontFamily: "'Lexend', sans-serif" },
    header: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
      color: "white", padding: "30px", borderRadius: "24px", marginBottom: "20px", textAlign: "center", position: 'relative'
    },
    timerBadge: { position: 'absolute', top: '15px', right: '20px', background: 'rgba(255,255,255,0.2)', padding: '8px 15px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' },
    topActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    actionGroup: { display: 'flex', gap: '10px' },
    mainGrid: { display: focusMode ? "block" : "grid", gridTemplateColumns: "1.6fr 1fr", gap: "25px" },
    card: { background: "#fff", borderRadius: "24px", padding: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" },
    btn: { padding: "12px 20px", borderRadius: "14px", border: "none", cursor: "pointer", fontWeight: "bold", fontSize: '14px' },
    chatBox: { height: "400px", display: "flex", flexDirection: "column", background: "#f8fafc", borderRadius: "18px", marginTop: "20px", overflow: "hidden", border: "1px solid #e2e8f0" },
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' },
    guideContent: { background: '#fff', padding: '35px', borderRadius: '40px', maxWidth: '950px', maxHeight: '90vh', overflowY: 'auto' },
    guideSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' },
    langTitle: { fontSize: '26px', color: colors.primary, marginBottom: '10px', fontWeight: '800' },
    langText: { fontSize: '19px', lineHeight: '1.6', color: '#475569' }
  };

  return (
    <div style={styles.container}>
      {/* 5-HOUR TIME UP / 2-HOUR COOL-DOWN OVERLAY */}
      {timeLeft <= 0 && (
        <div style={styles.overlay}>
          <div style={{...styles.guideContent, textAlign: 'center'}}>
            <h1 style={{fontSize: '80px'}}>😴</h1>
            <h2 style={{fontSize: '32px', color: colors.text}}>{t.timeUp}</h2>
            <p style={{fontSize: '20px'}}>You studied hard for 5 hours. Please rest your eyes for 2 hours.</p>
            <div style={{background: '#f1f5f9', padding: '20px', borderRadius: '15px', margin: '20px 0'}}>
               <h3 style={{color: colors.primary, margin: 0}}>
                 Rest Remaining: {getRemainingLockTime()} minutes
               </h3>
            </div>
            <button onClick={() => navigate("/")} style={{...styles.btn, background: colors.primary, color: '#fff', fontSize: '20px', width: '200px'}}>Logout</button>
          </div>
        </div>
      )}

      {/* BILINGUAL GUIDE POPUP */}
      {showGuide && (
        <div style={styles.overlay}>
          <div style={styles.guideContent}>
            <div style={{textAlign: 'center', marginBottom: '40px'}}>
              <h1 style={{fontSize: '40px', color: colors.accent, margin: 0}}>🌟 Student Guide / मार्गदर्शिका 🌟</h1>
            </div>
            <div style={styles.guideSection}>
              <div>
                <div style={styles.langTitle}>📝 Lessons & Summary</div>
                <div style={styles.langText}>Watch a video, then write what you learned on paper! Upload a photo for AI check.</div>
              </div>
              <div style={{borderLeft: '4px solid #6366f1', paddingLeft: '20px'}}>
                <div style={styles.langTitle}>📝 पाठ और सारांश</div>
                <div style={styles.langText}>वीडियो देखें, फिर जो सीखा उसे कागज पर लिखें! फोटो अपलोड करें।</div>
              </div>
            </div>
            <button onClick={() => { setShowGuide(false); localStorage.setItem(`guide_seen_${student.name}`, "true"); }} 
                    style={{...styles.btn, background: colors.success, color: '#fff', width: '100%', padding: '25px', fontSize: '24px', borderRadius: '25px'}}>
              I am Ready! / मैं तैयार हूँ! 🚀
            </button>
          </div>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <div style={styles.header}>
        <div style={styles.timerBadge}>⏳ {t.timeRemaining}: {formatTime(timeLeft)}</div>
        <h1 style={{ margin: 0 }}>{t.welcome}, {student.name}! ✨</h1>
        <p style={{fontSize: '1.3rem'}}><b>Maths:</b> {student.levels.maths} | <b>Science:</b> {student.levels.science}</p>
      </div>

      {/* ACTION BAR */}
      <div style={styles.topActions}>
        <div style={styles.actionGroup}>
          <button onClick={() => setFocusMode(!focusMode)} style={{ ...styles.btn, background: focusMode ? "#ef4444" : "#22c55e", color: "#fff" }}>
            {focusMode ? "✕ Exit Focus" : "🎯 Focus Mode"}
          </button>
          <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={{ ...styles.btn, background: "#fff", border: "1px solid #ddd" }}>
            {lang === 'en' ? 'हिन्दी' : 'English'}
          </button>
          <button onClick={() => setShowGuide(true)} style={{...styles.btn, background: colors.accent, color: '#fff'}}>
            {t.guideBtn}
          </button>
        </div>
        <button onClick={() => navigate("/")} style={{ ...styles.btn, background: colors.logoutBg, color: colors.logoutText }}>Logout</button>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.card}>
          <h2 style={{ marginTop: 0 }}>🚀 {t.learningPath}</h2>
          <Lessons student={student} onComplete={handleCompleteLesson} lang={lang} t={t} primaryColor={colors.primary} 
                   assignmentStep={assignmentStep} setAssignmentStep={setAssignmentStep} onUpload={handleAssignmentUpload} isVerifying={isVerifying} />
        </div>

        {!focusMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {showWellnessBtn && (
              <button onClick={() => navigate("/student/wellness-check")} style={{ ...styles.btn, background: "#fef3c7", color: "#92400e", width: "100%", fontSize: '18px' }}>
                 {t.wellnessBtn} (Weekly!)
              </button>
            )}
            <button onClick={() => navigate("/student/hobby-hub")} style={{ ...styles.btn, background: "#dcfce7", color: "#166534", width: "100%", fontSize: '18px' }}>
               {t.hobbyBtn}
            </button>
            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>📊 Progress</h3>
              <StudentProgress student={student} t={t} lang={lang} />
            </div>
            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>🤖 {t.doubtSolver}</h3>
              <div style={styles.chatBox}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '10px' }}>
                      <div style={{ display: 'inline-block', padding: '12px', borderRadius: '15px', background: msg.role === 'user' ? colors.primary : '#e2e8f0', color: msg.role === 'user' ? '#fff' : '#1e293b', fontSize: '15px', whiteSpace: 'pre-wrap', maxWidth: '85%', textAlign: 'left' }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #eee' }}>
                  <input style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px' }} placeholder={t.askDoubt} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                  <button onClick={sendMessage} style={{ background: 'none', border: 'none', fontSize: '20px' }}>➤</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}