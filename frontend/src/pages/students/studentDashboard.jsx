import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

import Lessons from "./Lessons";
import StudentProgress from "./StudentProgress";
import PlacementTest from "./PlacementTest";
import { shouldShowMentalHealthCheck } from "../../utils/healthStorage";

const translations = {
  en: {
    welcome: "Welcome back", 
    logout: "Logout", 
    doubtSolver: "Study Buddy AI",
    askDoubt: "Ask your doubt here...", 
    modeLearning: "Learning Path",
    modeAssessment: "Initial Assessment", 
    maths: "Mathematics", 
    science: "Science",
    wellnessBtn: "🌿 Weekly Wellness Check",
    hobbyBtn: "My Hobby Hub",
    timeRemaining: "Time Left",
    sessionExpired: "Study Session Ended",
    lockoutMsg: "To protect your eyes, please take a break. You can return in:",
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
    wellnessBtn: "🌿 साप्ताहिक स्वास्थ्य जांच",
    hobbyBtn: "मेरा शौक केंद्र",
    timeRemaining: "समय शेष",
    sessionExpired: "अध्ययन सत्र समाप्त",
    lockoutMsg: "अपनी आंखों की सुरक्षा के लिए, कृपया ब्रेक लें। आप वापस आ सकते हैं:",
    badges: { starter: "शुरुआत", achiever: "सफल", master: "महारत" }
  }
};

export default function StudentDashboard() {
  /* ================= STATE MANAGEMENT ================= */
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en");
  const [activeWatchProgress, setActiveWatchProgress] = useState(0);
  const [showWellnessBtn, setShowWellnessBtn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [assignmentStep, setAssignmentStep] = useState("watch"); 
  const [isVerifying, setIsVerifying] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  /* --- TIMER STATES --- */
  const [studyTimeLeft, setStudyTimeLeft] = useState(5 * 60 * 60); // 5 Hours
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0); // 3 Hours Block
  const [isLocked, setIsLocked] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const t = translations[lang];

  const isBlind = student?.disability?.toLowerCase() === "blind" || student?.disability?.toLowerCase() === "visually impaired";

  const colors = {
    primaryDeep: "#065f46",
    pastelBg: "#f0fdf4",
    darkSlate: "#0f172a",
    wellnessGold: "#f59e0b",
    timerRed: "#ef4444",
    botBubble: "#f1f5f9",
    userBubble: "#065f46"
  };

  /* ================= 1. THE SCREEN TIME LOGIC ================= */
  useEffect(() => {
    const studentName = localStorage.getItem("loggedInStudent");
    if (!studentName) return;

    const savedStudy = localStorage.getItem(`study_timer_${studentName}`);
    const lockExpiry = localStorage.getItem(`lock_expiry_${studentName}`);

    if (lockExpiry && Date.now() < parseInt(lockExpiry)) {
      setIsLocked(true);
      setLockoutTimeLeft(Math.floor((parseInt(lockExpiry) - Date.now()) / 1000));
    } else if (savedStudy) {
      setStudyTimeLeft(parseInt(savedStudy));
    }

    const timerInterval = setInterval(() => {
      if (isLocked) {
        setLockoutTimeLeft((prev) => {
          if (prev <= 1) {
            setIsLocked(false);
            localStorage.removeItem(`lock_expiry_${studentName}`);
            setStudyTimeLeft(5 * 60 * 60);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setStudyTimeLeft((prev) => {
          const newTime = prev - 1;
          localStorage.setItem(`study_timer_${studentName}`, newTime.toString());
          if (newTime <= 0) {
            const expiry = Date.now() + (3 * 60 * 60 * 1000); 
            localStorage.setItem(`lock_expiry_${studentName}`, expiry.toString());
            setIsLocked(true);
            setLockoutTimeLeft(3 * 60 * 60);
            return 0;
          }
          return newTime;
        });
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isLocked]);

  /* ================= 2. VOICE SYNTHESIS ================= */
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { if (window.speechSynthesis) window.speechSynthesis.cancel(); };
  }, []);

  const speak = (text) => {
    if (!isBlind || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/📌|📖|💡/g, "").replace(/\n/g, ". ");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  /* ================= 3. DATA LOADING ================= */
  const loadLatestData = () => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const loggedIn = students.find((s) => s.name === name);

    if (loggedIn) {
      setStudent({
        ...loggedIn,
        completedMathsLessons: loggedIn.completedMathsLessons || [],
        completedScienceLessons: loggedIn.completedScienceLessons || [],
        verifiedSummaries: loggedIn.verifiedSummaries || [],
        levels: loggedIn.levels || { maths: "Class 1", science: "Class 1" }
      });
      setShowWellnessBtn(shouldShowMentalHealthCheck(name));
      
      const hasSeenGuide = localStorage.getItem(`guide_seen_${name}`);
      if (!hasSeenGuide) {
        setShowGuide(true);
        localStorage.setItem(`guide_seen_${name}`, "true");
      }
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    loadLatestData();
    window.addEventListener('storage', loadLatestData);
    return () => window.removeEventListener('storage', loadLatestData);
  }, []);

  /* ================= 4. PROGRESS & ASSIGNMENTS ================= */
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
        speak("Verified. You may start the test.");
      }
    } catch (err) { speak("Verification offline."); } 
    finally { setIsVerifying(false); }
  };

  const handleCompleteLesson = (lessonId, subject, testScore = 100) => {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updatedStudents = students.map((s) => {
      if (s.name === student.name) {
        const subKey = subject.toLowerCase();
        if (subKey === "maths") {
          const completed = s.completedMathsLessons || [];
          if (!completed.includes(lessonId)) completed.push(lessonId);
          s.completedMathsLessons = completed;
        } else {
          const completed = s.completedScienceLessons || [];
          if (!completed.includes(lessonId)) completed.push(lessonId);
          s.completedScienceLessons = completed;
        }
        s.scores = { ...s.scores, [lessonId]: testScore };
      }
      return s;
    });
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setAssignmentStep("watch");
    loadLatestData();
  };

  /* ================= 5. CHAT LOGIC ================= */
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || isListening) return;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onresult = (e) => sendMessage(e.results[0][0].transcript);
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
  };

  const sendMessage = async (overriddenInput) => {
    const userText = overriddenInput || input;
    if (!userText.trim()) return;
    const newMsgs = [...messages, { role: "user", content: userText }];
    setMessages(newMsgs);
    setInput("");
    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", {
        message: userText, source: "student_dashboard", is_blind: isBlind
      });
      setMessages([...newMsgs, { role: "bot", content: res.data.reply }]);
      if (isBlind) speak(res.data.reply);
    } catch (err) { console.error(err); }
  };

  /* ================= 6. UTILS ================= */
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const downloadNotes = (fileName) => {
    if (!fileName) return speak("Notes not available.");
    window.open(`http://localhost:5000/uploads/notes/${fileName}`, "_blank");
  };

  const handleLogout = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    navigate("/");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'q') handleLogout();
      if (e.altKey && e.key.toLowerCase() === 'w' && showWellnessBtn) navigate("/student/wellness-check");
      if (e.altKey && e.key.toLowerCase() === 'h') navigate("/student/hobby-hub");
      if (isBlind && e.code === "Space" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        startListening();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBlind, lang, student, showWellnessBtn]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!student) return null;

  /* ================= 7. LOCKOUT SCREEN ================= */
  if (isLocked) {
    return (
      <div style={styles.lockoutOverlay}>
        <div style={styles.lockoutBox}>
          <div style={{ fontSize: "60px" }}>😴</div>
          <h2 style={{ fontSize: "28px", margin: "10px 0" }}>{t.sessionExpired}</h2>
          <p style={{ color: "#64748b", lineHeight: "1.6" }}>{t.lockoutMsg}</p>
          <div style={styles.timerDisplayLarge}>{formatTime(lockoutTimeLeft)}</div>
          <button onClick={handleLogout} style={styles.lockoutLogout}>{t.logout}</button>
        </div>
      </div>
    );
  }

  const MATHS_REQUIRED = (student.disability === "ADHD" && student.levels?.maths === "Class 1") ? 2 : 5;
  const SCIENCE_REQUIRED = 5;

  return (
    <div style={{ backgroundColor: colors.pastelBg, minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1450px", margin: "0 auto", fontFamily: "Lexend, sans-serif" }}>

        {/* 📘 POP-UP GUIDE */}
        {showGuide && (
          <div style={styles.modalOverlay}>
            <div style={styles.guideBox}>
              <h2 style={{ color: colors.primaryDeep, fontSize: '28px' }}>Hello {student.name}! 🚀</h2>
              <p>Ready for a great learning session? Here's how to use your dashboard:</p>
              <div style={styles.guideGrid}>
                <div style={styles.guideItem}><b>📺 Lessons:</b> Watch and complete subtopics.</div>
                <div style={styles.guideItem}><b>✍️ Uploads:</b> Share your notes to unlock tests.</div>
                <div style={styles.guideItem}><b>⏳ Time:</b> 5h study limit followed by a break.</div>
                <div style={styles.guideItem}><b>🤖 Buddy:</b> Ask the AI for help anytime.</div>
              </div>
              <button onClick={() => setShowGuide(false)} style={styles.modalBtn}>Let's Start!</button>
            </div>
          </div>
        )}

        {/* NAVIGATION BAR WITH CATEGORIES */}
        <nav style={styles.nav}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ fontSize: "28px", fontWeight: "900", color: colors.primaryDeep, marginRight: '10px' }}>EduLift</div>
            <div style={{ ...styles.badge, background: '#e0f2fe', color: '#0369a1' }}>👤 {student.name}</div>
            
            {/* ADDED: CATEGORY LEVEL SPECIFIERS */}
            <div style={{ ...styles.badge, background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
              📐 {t.maths}: <b>{student.levels?.maths}</b>
            </div>
            <div style={{ ...styles.badge, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
              🧪 {t.science}: <b>{student.levels?.science}</b>
            </div>

            <div style={{ ...styles.badge, background: studyTimeLeft < 1800 ? '#fee2e2' : '#f8fafc', color: studyTimeLeft < 1800 ? '#ef4444' : '#64748b' }}>
              ⏳ {formatTime(studyTimeLeft)}
            </div>
          </div>
          <div style={{ display: "flex", gap: "15px" }}>
            <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={styles.langBtn}>
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>{t.logout}</button>
          </div>
        </nav>

        {!student.placementDone ? (
          <PlacementTest student={student} setStudent={setStudent} />
        ) : (
          <div style={styles.dashboardGrid}>
              <main style={styles.card}>
                <header style={styles.sectionHeader}>
                  <h2 style={{ margin: 0 }}>📚 {t.modeLearning}</h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={styles.statusPill}>M: {student.completedMathsLessons?.length || 0}/{MATHS_REQUIRED}</div>
                    <div style={styles.statusPill}>S: {student.completedScienceLessons?.length || 0}/{SCIENCE_REQUIRED}</div>
                  </div>
                </header>

                <Lessons
                  student={student}
                  onComplete={handleCompleteLesson}
                  lang={lang}
                  t={t}
                  setWatchProgress={setActiveWatchProgress}
                  primaryColor={colors.primaryDeep}
                  assignmentStep={assignmentStep}
                  setAssignmentStep={setAssignmentStep}
                  onUpload={handleAssignmentUpload}
                  isVerifying={isVerifying}
                  speak={speak}
                  onDownloadNotes={downloadNotes}
                />
              </main>

            <div style={styles.rightSidebar}>
              <div style={{ display: 'flex', gap: '10px' }}>
                 <button onClick={() => navigate("/student/hobby-hub")} style={styles.hobbyHubBtn}>🎨 Hobby Hub</button>
                 {showWellnessBtn && <button onClick={() => navigate("/student/wellness-check")} style={styles.wellnessBanner}>🌿 Wellness</button>}
              </div>

              <div style={styles.progressCard}>
                <StudentProgress student={student} t={t} lang={lang} />
              </div>

              {/* IMPROVED CHATBOT UI */}
              <aside style={styles.chatbotContainer}>
                <div style={styles.chatHeader}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>🤖</span>
                    <span>{t.doubtSolver}</span>
                  </div>
                  {isListening && <div style={styles.pulseContainer}><span style={styles.pulseDot}></span> Listening</div>}
                </div>
                
                <div style={styles.chatBody}>
                  {messages.length === 0 && (
                    <div style={styles.emptyChat}>
                      <p>Hello! I'm your AI Study Buddy. Ask me anything about your lessons!</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                      marginBottom: "15px" 
                    }}>
                      <div style={{ 
                        ...styles.bubble, 
                        background: msg.role === "user" ? colors.userBubble : colors.botBubble,
                        color: msg.role === "user" ? "white" : "#1e293b",
                        borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px"
                      }}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                        {msg.role === "user" ? "You" : "Buddy"}
                      </span>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div style={styles.chatInputRow}>
                  <input
                    style={styles.input}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder={isBlind ? "Hold Space to talk..." : t.askDoubt}
                  />
                  <button onClick={() => sendMessage()} style={styles.sendBtn}>➤</button>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  nav: { display: "flex", justifyContent: "space-between", background: "#fff", padding: "15px 30px", borderRadius: "25px", marginBottom: "25px", alignItems: "center", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" },
  badge: { padding: "8px 15px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", marginLeft: "8px", display: 'flex', alignItems: 'center', gap: '5px' },
  langBtn: { background: "#f8fafc", border: "1px solid #e2e8f0", padding: "10px 18px", borderRadius: "12px", cursor: "pointer", fontWeight: "600" },
  logoutBtn: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "800", cursor: "pointer" },
  dashboardGrid: { display: "grid", gridTemplateColumns: "1fr 480px", gap: "25px", height: "calc(100vh - 160px)" },
  card: { background: "#fff", borderRadius: "30px", padding: "30px", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" },
  rightSidebar: { display: "flex", flexDirection: "column", gap: "20px" },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '25px', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' },
  statusPill: { background: '#f1f5f9', color: '#475569', padding: '6px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' },
  progressCard: { background: "#fff", borderRadius: "24px", padding: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.02)" },
  
  // BUTTONS
  hobbyHubBtn: { flex: 1, padding: '18px', background: '#ecfdf5', color: '#065f46', border: 'none', borderRadius: '20px', fontWeight: '900', cursor: 'pointer' },
  wellnessBanner: { flex: 1, padding: '18px', background: '#fffbeb', color: '#92400e', border: 'none', borderRadius: '20px', fontWeight: '900', cursor: 'pointer' },

  // CHATBOT
  chatbotContainer: { flex: 1, background: "#fff", borderRadius: "30px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.04)" },
  chatHeader: { background: "#065f46", color: "#fff", padding: "18px 25px", fontWeight: "bold", display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  chatBody: { flex: 1, overflowY: "auto", padding: "20px", background: '#f8fafc' },
  emptyChat: { textAlign: 'center', color: '#94a3b8', padding: '40px 20px', fontSize: '14px' },
  bubble: { padding: "12px 16px", maxWidth: "88%", fontSize: "14px", lineHeight: "1.5", boxShadow: "0 2px 5px rgba(0,0,0,0.02)" },
  chatInputRow: { padding: "15px 20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "10px", background: '#fff' },
  input: { flex: 1, padding: "12px 18px", borderRadius: "12px", border: "1px solid #e2e8f0", outline: 'none', fontSize: '14px' },
  sendBtn: { background: "#065f46", color: "#fff", border: "none", width: "50px", borderRadius: "12px", cursor: "pointer", fontSize: '18px' },
  
  // MODALS
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' },
  guideBox: { backgroundColor: 'white', padding: '40px', borderRadius: '40px', maxWidth: '650px', width: '90%' },
  guideGrid: { textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '25px 0' },
  guideItem: { background: '#f8fafc', padding: '15px', borderRadius: '15px', fontSize: '14px', border: '1px solid #f1f5f9' },
  modalBtn: { width: '100%', padding: '16px', background: '#065f46', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' },

  // LOCKOUT
  lockoutOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 },
  lockoutBox: { textAlign: 'center', background: 'white', padding: '50px', borderRadius: '40px', maxWidth: '450px' },
  timerDisplayLarge: { fontSize: "48px", fontWeight: "900", color: "#ef4444", margin: "25px 0" },
  lockoutLogout: { background: '#f1f5f9', border: 'none', padding: '12px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  
  // PULSE
  pulseContainer: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px' },
  pulseDot: { width: '8px', height: '8px', background: '#ff4b4b', borderRadius: '50%' }
};