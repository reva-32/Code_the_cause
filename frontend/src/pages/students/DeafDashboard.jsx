import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* COMPONENTS */
import Lessons from "./Lessons";
import StudentProgress from "./StudentProgress";
import { shouldShowMentalHealthCheck } from "../../utils/healthStorage";

/* ⚠️ IMPORT GENERAL LESSONS */
import * as LessonData from "../../data/lessons";

/* ================= DEAF LESSONS (FIXED DATA KEYS) ================= */
// Changed 'class' to 'classLevel' to match the filter logic in Lessons.jsx
export const deafLessons = [
  { id: "deaf-good-habits", subject: "science", classLevel: "Class 1", chapter: "Life Skills", topic: "Health", title: "Good Habits (Sign Language)", videoId: "ivVZ1kcL28o", mute: true },
  { id: "deaf-animal-kingdom", subject: "science", classLevel: "Class 2", chapter: "Biology", topic: "Animals", title: "Animal Kingdom (Sign Language)", videoId: "jcQNB82wDo", mute: true },
  { id: "deaf-numbers", subject: "maths", classLevel: "Class 1", chapter: "Arithmetic Basics", topic: "Numbers", title: "Numbers 1-100 (Sign Language)", videoId: "ilpGSy6JdNA", mute: true },
  { id: "deaf-multiplication", subject: "maths", classLevel: "Class 2", chapter: "Arithmetic Basics", topic: "Multiplication", title: "Multiplication (Sign Language)", videoId: "IIpy29sAoxA", mute: true }
];

const translations = {
  en: { 
    welcome: "Good Day", 
    doubtSolver: "AI Study Buddy", 
    wellnessBtn: "🌿 Wellness Check", 
    hobbyBtn: "🎨 Hobby Hub", 
    learningPath: "My Learning Path", 
    askDoubt: "Ask Buddy anything...", 
    timeRemaining: "Time Left", 
    videoHint: "Note: Videos are muted to help you focus on the Sign Language.", 
    logout: "Logout",
    confirmLogout: "Do you want to leave?",
    yes: "Yes, Logout",
    no: "No, Stay"
  },
  hi: { 
    welcome: "नमस्ते", 
    doubtSolver: "एआई सहायक", 
    wellnessBtn: "🌿 स्वास्थ्य जांच", 
    hobbyBtn: "🎨 हॉबी हब", 
    learningPath: "सीखने का मार्ग", 
    askDoubt: "मुझसे कुछ भी पूछें...", 
    timeRemaining: "समय शेष", 
    videoHint: "नोट: संकेतों पर ध्यान केंद्रित करने के लिए वीडियो म्यूट हैं।", 
    logout: "लॉग आउट",
    confirmLogout: "क्या आप जाना चाहते हैं?",
    yes: "हाँ, लॉग आउट",
    no: "नहीं, रुको"
  }
};

export default function DeafDashboard() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  /* --- STATE MANAGEMENT --- */
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en");
  const [showWellnessBtn, setShowWellnessBtn] = useState(false);
  const [assignmentStep, setAssignmentStep] = useState("watch");
  const [mode, setMode] = useState("study");
  const [timeLeft, setTimeLeft] = useState(5 * 60 * 60);
  const [showGuide, setShowGuide] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [greeting, setGreeting] = useState("Welcome");

  const t = translations[lang];

  /* --- INITIALIZE DATA & SWAP LESSONS --- */
  useEffect(() => {
    if (!LessonData.lessons) return;
    const originalLessons = [...LessonData.lessons];
    LessonData.lessons.length = 0;
    LessonData.lessons.push(...deafLessons);
    return () => {
      LessonData.lessons.length = 0;
      LessonData.lessons.push(...originalLessons);
    };
  }, []);

  /* --- AUTH & GREETING LOGIC --- */
  useEffect(() => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const found = students.find((s) => s.name === name);
    
    if (!found) {
      navigate("/");
    } else { 
      setStudent(found); 
      setShowWellnessBtn(shouldShowMentalHealthCheck(name));

      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");

      const hasRegisteredBefore = localStorage.getItem("permanent_guide_seen_" + name);
      if (!hasRegisteredBefore) {
        setShowGuide(true);
        localStorage.setItem("permanent_guide_seen_" + name, "true");
      }
      setMessages([{ role: "bot", content: "Hello! I am your AI Study Buddy. How can I help you today? ✨" }]);
    }
  }, [navigate]);

  /* --- TIMER SYSTEM --- */
  useEffect(() => {
    if (!student) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [student]);

  /* --- ACTION HANDLERS --- */
  const handleLogout = () => {
    localStorage.removeItem("loggedInStudent");
    navigate("/");
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((p) => [...p, userMsg]);
    const currentInput = input;
    setInput("");
    
    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", { 
        message: currentInput, 
        source: "student_dashboard" 
      });
      setMessages((p) => [...p, { role: "bot", content: res.data.reply }]);
    } catch (err) {
      setMessages((p) => [...p, { role: "bot", content: "AI Buddy is currently offline." }]);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!student) return null;

  return (
    <div style={styles.container}>
      {/* 📘 POP-UP GUIDE */}
      {showGuide && (
        <div style={styles.modalOverlay}>
          <div style={styles.guideBox}>
            <h2 style={{ color: '#6366f1' }}>Your Dashboard Guide!</h2>
            <div style={styles.guideGrid}>
              <div style={styles.guideItem}>📺 Videos are Muted for focus.</div>
              <div style={styles.guideItem}>🎨 Hobby Hub is for fun.</div>
              <div style={styles.guideItem}>⏳ Timer tracks study time.</div>
              <div style={styles.guideItem}>✍️ Finish summaries to pass.</div>
            </div>
            <button onClick={() => setShowGuide(false)} style={styles.modalBtn}>Got it! 🚀</button>
          </div>
        </div>
      )}

      {/* 🚪 LOGOUT MODAL */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.logoutBox}>
            <h3>{t.confirmLogout}</h3>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button onClick={handleLogout} style={styles.dangerBtn}>{t.yes}</button>
              <button onClick={() => setShowLogoutConfirm(false)} style={styles.cancelBtn}>{t.no}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <div style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>🤟 {greeting}, {student.name}</h1>
          <span style={{ fontSize: '0.85rem' }}>Maths: {student.levels?.maths} | Science: {student.levels?.science}</span>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => setShowGuide(true)} style={styles.guideBtn}>📖 Guide</button>
          <button onClick={() => setShowLogoutConfirm(true)} style={styles.logoutBtn}>{t.logout}</button>
          <div style={styles.timerBadge}>
            ⏳ {Math.floor(timeLeft / 3600)}h {Math.floor((timeLeft % 3600) / 60)}m
          </div>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div style={styles.grid}>
        <div style={styles.leftCol}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={{ margin: 0 }}>📚 {t.learningPath}</h2>
              <button onClick={() => setLang(lang === "en" ? "hi" : "en")} style={styles.langBtn}>
                {lang === "en" ? "हिन्दी" : "English"}
              </button>
            </div>
            <p style={styles.hint}>{t.videoHint}</p>
            <Lessons 
              key={`${student.name}-${lang}`}
              student={student} 
              t={t} 
              lang={lang} 
              primaryColor="#6366f1" 
              assignmentStep={assignmentStep} 
              setAssignmentStep={setAssignmentStep}
              onUpload={(file, id) => alert(`Uploaded file for lesson ${id}`)}
              onDownloadNotes={(url) => window.open(url)}
            />
          </div>
        </div>

        <div style={styles.rightCol}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate("/student/hobby-hub")} style={styles.hobbyBtn}>{t.hobbyBtn}</button>
            {showWellnessBtn && <button onClick={() => navigate("/student/wellness-check")} style={styles.wellnessBtn}>{t.wellnessBtn}</button>}
          </div>
          <div style={styles.card}>
            <h3>📊 Progress</h3>
            <StudentProgress student={student} t={t} lang={lang} />
          </div>
          <div style={styles.chatCard}>
            <h3>💬 {t.doubtSolver}</h3>
            <div style={styles.chatWindow}>
              {messages.map((m, i) => (
                <div key={i} style={{ textAlign: m.role === "user" ? "right" : "left" }}>
                  <div style={{ ...styles.bubble, backgroundColor: m.role === 'user' ? '#6366f1' : 'white', color: m.role === 'user' ? 'white' : '#1e293b' }}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={styles.inputRow}>
              <input style={styles.input} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={t.askDoubt} />
              <button onClick={sendMessage} style={styles.sendBtn}>➤</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- STYLES OBJECT --- */
const styles = {
  container: { padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Lexend, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', padding: '15px 25px', borderRadius: '20px', color: 'white', marginBottom: '20px', boxShadow: '0 8px 12px -3px rgba(99, 102, 241, 0.2)' },
  headerActions: { display: 'flex', alignItems: 'center', gap: '12px' },
  grid: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: { background: 'white', padding: '20px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  chatCard: { background: 'white', padding: '20px', borderRadius: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' },
  chatWindow: { flexGrow: 1, overflowY: 'auto', borderRadius: '15px', padding: '15px', marginBottom: '15px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' },
  bubble: { display: 'inline-block', padding: '12px 18px', borderRadius: '18px', fontSize: '14px', maxWidth: '85%', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  inputRow: { display: 'flex', gap: '8px' },
  input: { flexGrow: 1, padding: '14px', borderRadius: '15px', border: '1px solid #e2e8f0', outline: 'none' },
  sendBtn: { width: '50px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer' },
  timerBadge: { background: 'rgba(255,255,255,0.2)', padding: '8px 15px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold' },
  guideBtn: { background: '#FFD700', color: '#422006', padding: '10px 18px', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '800' },
  logoutBtn: { background: '#ff4b4b', color: 'white', padding: '10px 18px', border: 'none', borderRadius: '15px', cursor: 'pointer', fontWeight: '800' },
  langBtn: { padding: '6px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', cursor: 'pointer', background: 'white', fontWeight: 'bold' },
  hobbyBtn: { flex: 1, height: '55px', borderRadius: '18px', border: 'none', backgroundColor: '#dcfce7', color: '#166534', fontWeight: '800', cursor: 'pointer' },
  wellnessBtn: { flex: 1, height: '55px', borderRadius: '18px', border: 'none', backgroundColor: '#fef3c7', color: '#92400e', fontWeight: '800', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  guideBox: { backgroundColor: 'white', padding: '40px', borderRadius: '35px', maxWidth: '600px', textAlign: 'center' },
  guideGrid: { textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' },
  guideItem: { background: '#f0f9ff', padding: '15px', borderRadius: '15px', border: '1px solid #bae6fd', fontSize: '0.9rem' },
  modalBtn: { marginTop: '30px', padding: '15px 40px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '25px', fontWeight: '900', cursor: 'pointer' },
  logoutBox: { backgroundColor: 'white', padding: '30px', borderRadius: '24px', textAlign: 'center', maxWidth: '400px' },
  dangerBtn: { padding: '12px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' },
  cancelBtn: { padding: '12px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '12px', cursor: 'pointer' },
  hint: { color: '#64748b', fontSize: '13px', marginBottom: '20px' }
};