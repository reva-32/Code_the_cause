import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* COMPONENTS */
import Lessons from "./Lessons";
import StudentProgress from "./StudentProgress";
import { shouldShowMentalHealthCheck } from "../../utils/healthStorage";
import PlacementTest from "./PlacementTest";

// Videos specifically for Deaf students
export const deafLessons = [
  {
    id: "deaf-good-habits",
    subject: "science",
    class: "Class 1",
    chapter: "Life Skills",
    topic: "Health",
    title: "Good Habits (Sign Language)",
    videoId: "ivVZ1kcL28o", 
    mute: true
  },
  {
    id: "deaf-animal-kingdom",
    subject: "science",
    class: "Class 2",
    chapter: "Biology",
    topic: "Animals",
    title: "Animal Kingdom (Sign Language)",
    videoId: "jcQNB82wDo",
    mute: true
  },
  {
    id: "deaf-numbers",
    subject: "maths",
    class: "Class 1",
    chapter: "Arithmetic Basics",
    topic: "Numbers",
    title: "Numbers 1-100 (Sign Language)",
    videoId: "ilpGSy6JdNA",
    mute: true
  },
  {
    id: "deaf-multiplication",
    subject: "maths",
    class: "Class 2",
    chapter: "Arithmetic Basics",
    topic: "Multiplication",
    title: "Multiplication (Sign Language)",
    videoId: "IIpy29sAoxA",
    mute: true
  },
];

const translations = {
  en: {
    welcome: "Welcome",
    learningPath: "Visual Learning Path",
    doubtSolver: "Visual Assistant",
    askDoubt: "Type your question...",
    focusMode: "Visual Focus",
    videoHint: "Videos are muted. Focus on Sign Language & Captions.",
    guideBtn: "📖 Help Guide",
    timeRemaining: "Study Time Left",
    timeUp: "Eyes Need Rest! 🤟"
  },
  hi: {
    welcome: "स्वागत है",
    learningPath: "दृश्य सीखने का मार्ग",
    doubtSolver: "दृश्य सहायक",
    askDoubt: "अपना प्रश्न लिखें...",
    focusMode: "फोकस मोड",
    videoHint: "वीडियो म्यूट हैं। सांकेतिक भाषा और कैप्शन पर ध्यान दें।",
    guideBtn: "📖 सहायता गाइड",
    timeRemaining: "पढ़ाई का समय",
    timeUp: "आँखों को आराम चाहिए! 🤟"
  }
};

export default function DeafDashboard() {
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en");
  const [focusMode, setFocusMode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [assignmentStep, setAssignmentStep] = useState("watch");
  const [showGuide, setShowGuide] = useState(false);
  const [timeLeft, setTimeLeft] = useState(18000); // 5 Hours default

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const t = translations[lang];

  const colors = {
    primary: "#0ea5e9", 
    bg: "#f0f9ff",
    card: "#ffffff",
    text: "#0f172a",
    accent: "#f59e0b",
    success: "#22c55e",
    logoutBg: "#fee2e2",
    logoutText: "#dc2626"
  };

  /* ================= 1. HELPER FUNCTIONS ================= */
  const formatTime = (seconds) => {
    if (seconds <= 0) return "0h 00m 00s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s < 10 ? '0' + s : s}s`;
  };

  const getRemainingLockTime = () => {
    const lockoutStart = localStorage.getItem(`lockout_${student?.name}`);
    if (!lockoutStart) return 0;
    const remainingMs = (2 * 60 * 60 * 1000) - (Date.now() - parseInt(lockoutStart));
    return Math.max(0, Math.ceil(remainingMs / (1000 * 60)));
  };

  /* ================= 2. TIMER & COOL-DOWN LOGIC ================= */
  useEffect(() => {
    if (!student) return;

    const fiveHoursInSec = 5 * 60 * 60;
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    const lockoutStart = localStorage.getItem(`lockout_${student.name}`);

    if (lockoutStart) {
      const now = Date.now();
      if (now - parseInt(lockoutStart) >= twoHoursInMs) {
        localStorage.removeItem(`lockout_${student.name}`);
        localStorage.setItem(`timer_${student.name}`, fiveHoursInSec.toString());
        setTimeLeft(fiveHoursInSec);
      } else {
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
      if (!localStorage.getItem(`guide_seen_deaf_${name}`)) setShowGuide(true);
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
    } catch (err) { console.error("Verification error", err); }
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
      const res = await axios.post("http://127.0.0.1:5000/chat", { message: input, source: "deaf_dashboard" });
      setMessages([...newMsgs, { role: "bot", content: res.data.reply }]);
    } catch (err) { console.error("Chat error", err); }
  };

  if (!student) return null;

  /* ================= 5. STYLES ================= */
  const styles = {
    container: { backgroundColor: colors.bg, minHeight: "100vh", padding: "20px", fontFamily: "'Inter', sans-serif" },
    header: {
      background: `linear-gradient(135deg, ${colors.primary} 0%, #0284c7 100%)`,
      color: "white", padding: "30px", borderRadius: "24px", marginBottom: "20px", textAlign: "center",
      boxShadow: "0 10px 25px rgba(14, 165, 233, 0.2)", borderBottom: `6px solid ${colors.accent}`, position: 'relative'
    },
    timerBadge: { position: 'absolute', top: '15px', right: '20px', background: 'rgba(255,255,255,0.2)', padding: '8px 15px', borderRadius: '12px', fontSize: '14px', fontWeight: 'bold' },
    topActions: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '10px' },
    mainGrid: { display: focusMode ? "block" : "grid", gridTemplateColumns: "1.6fr 1fr", gap: "25px" },
    card: { background: "#fff", borderRadius: "24px", padding: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" },
    btn: { padding: "12px 20px", borderRadius: "14px", border: "none", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" },
    chatBox: { height: "450px", display: "flex", flexDirection: "column", background: "#f8fafc", borderRadius: "18px", marginTop: "20px", overflow: "hidden", border: "2px solid #e2e8f0" },
    muteBanner: { background: "#fee2e2", color: "#b91c1c", padding: "10px", borderRadius: "12px", marginBottom: "15px", textAlign: "center", fontSize: "0.9rem", fontWeight: "bold" },
    overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '20px' },
    guideContent: { background: '#fff', padding: '35px', borderRadius: '40px', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' },
    guideSection: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px', borderBottom: '2px solid #f1f5f9', paddingBottom: '20px' },
    langTitle: { fontSize: '22px', color: colors.primary, marginBottom: '8px', fontWeight: '800' }
  };

  return (
    <div style={styles.container}>
      {/* 5-HOUR LOCKOUT OVERLAY */}
      {timeLeft <= 0 && (
        <div style={styles.overlay}>
          <div style={{...styles.guideContent, textAlign: 'center'}}>
            <h1 style={{fontSize: '80px'}}>🤟😴</h1>
            <h2 style={{fontSize: '32px', color: colors.text}}>{t.timeUp}</h2>
            <p style={{fontSize: '20px'}}>Visual rest is important. Please rest your eyes for 2 hours.</p>
            <div style={{background: '#f1f5f9', padding: '20px', borderRadius: '15px', margin: '20px 0'}}>
               <h3 style={{color: colors.primary, margin: 0}}>Wait Time: {getRemainingLockTime()} minutes</h3>
            </div>
            <button onClick={() => navigate("/")} style={{...styles.btn, background: colors.primary, color: '#fff', margin: '0 auto', fontSize: '18px'}}>Logout</button>
          </div>
        </div>
      )}

      {/* BILINGUAL DEAF GUIDE POPUP */}
      {showGuide && (
        <div style={styles.overlay}>
          <div style={styles.guideContent}>
            <h1 style={{textAlign: 'center', color: colors.primary, marginBottom: '30px'}}>🤟 Visual Guide / दृश्य मार्गदर्शिका</h1>
            
            <div style={styles.guideSection}>
              <div>
                <div style={styles.langTitle}>🤟 Sign Language Videos</div>
                <p>All videos are <b>muted</b>. Focus on the instructor's sign language and captions.</p>
              </div>
              <div style={{borderLeft: '4px solid #0ea5e9', paddingLeft: '15px'}}>
                <div style={styles.langTitle}>🤟 सांकेतिक भाषा वीडियो</div>
                <p>सभी वीडियो <b>म्यूट</b> हैं। सांकेतिक भाषा और उपशीर्षक पर ध्यान दें।</p>
              </div>
            </div>

            <div style={styles.guideSection}>
              <div>
                <div style={styles.langTitle}>📝 Visual Summary</div>
                <p>After watching, write notes on paper and upload a photo for verification.</p>
              </div>
              <div style={{borderLeft: '4px solid #0ea5e9', paddingLeft: '15px'}}>
                <div style={styles.langTitle}>📝 दृश्य सारांश</div>
                <p>देखने के बाद, कागज पर नोट्स लिखें और फोटो अपलोड करें।</p>
              </div>
            </div>

            <div style={styles.guideSection}>
              <div>
                <div style={styles.langTitle}>⏳ Study Timer</div>
                <p>You can study for 5 hours. After that, the app locks for 2 hours to rest your eyes.</p>
              </div>
              <div style={{borderLeft: '4px solid #0ea5e9', paddingLeft: '15px'}}>
                <div style={styles.langTitle}>⏳ अध्ययन टाइमर</div>
                <p>आप 5 घंटे पढ़ सकते हैं। उसके बाद, आँखों के आराम के लिए ऐप 2 घंटे के लिए लॉक हो जाता है।</p>
              </div>
            </div>

            <button onClick={() => { setShowGuide(false); localStorage.setItem(`guide_seen_deaf_${student.name}`, "true"); }} 
                    style={{...styles.btn, background: colors.success, color: '#fff', width: '100%', padding: '20px', fontSize: '20px', justifyContent: 'center'}}>
              Start Learning! / सीखना शुरू करें! 🚀
            </button>
          </div>
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.timerBadge}>⏳ {t.timeRemaining}: {formatTime(timeLeft)}</div>
        <h1 style={{ margin: 0 }}>🤟 {t.welcome}, {student.name}!</h1>
        <p style={{ opacity: 0.9, fontSize: "1.1rem", marginTop: "10px" }}>Visual Learning Center</p>
      </div>

      <div style={styles.topActions}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setFocusMode(!focusMode)} style={{ ...styles.btn, background: focusMode ? "#ef4444" : colors.primary, color: "#fff" }}>
            {focusMode ? "✕ Exit" : "🎯 Visual focus"}
          </button>
          <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={{ ...styles.btn, background: "#fff", border: "2px solid #0ea5e9" }}>
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
          <div style={styles.muteBanner}>🔇 {t.videoHint}</div>
          <h2 style={{ marginTop: 0 }}>📚 {t.learningPath}</h2>
          <Lessons
            lessons={deafLessons}
            student={student}
            onComplete={handleCompleteLesson}
            lang={lang} t={t}
            primaryColor={colors.primary}
            assignmentStep={assignmentStep}
            setAssignmentStep={setAssignmentStep}
            onUpload={handleAssignmentUpload}
            isVerifying={isVerifying}
            muteVideos={true}
          />
        </div>

        {!focusMode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>📈 Progress</h3>
              <StudentProgress student={student} t={t} lang={lang} />
            </div>

            <div style={styles.card}>
              <h3 style={{ marginTop: 0 }}>💬 {t.doubtSolver}</h3>
              <div style={styles.chatBox}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
                  {messages.map((msg, i) => (
                    <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', marginBottom: '10px' }}>
                      <div style={{ 
                        display: 'inline-block', padding: '10px', borderRadius: '12px', 
                        background: msg.role === 'user' ? colors.primary : '#e2e8f0', 
                        color: msg.role === 'user' ? '#fff' : '#000', fontSize: '13px',
                        maxWidth: '85%', whiteSpace: 'pre-wrap', lineHeight: '1.5'       
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div style={{ display: 'flex', padding: '15px', borderTop: '2px solid #f1f5f9' }}>
                  <input style={{ flex: 1, border: 'none', outline: 'none' }} placeholder={t.askDoubt} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} />
                  <button onClick={sendMessage} style={{ background: colors.primary, color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 15px' }}>➤</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}