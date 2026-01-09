import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Lessons from "./Lessons";
import StudentProgress from "./StudentProgress";
import PlacementTest from "./PlacementTest";
import { shouldShowMentalHealthCheck } from "../../utils/healthStorage";

const translations = {
  en: {
    welcome: "Welcome back", logout: "Logout", doubtSolver: "AI DOUBT SOLVER",
    askDoubt: "Ask a doubt...", modeLearning: "Learning Path",
    modeAssessment: "Initial Assessment", maths: "Mathematics", science: "Science",
    wellnessBtn: "🌿 Weekly Wellness Check",
    badges: { starter: "Starter", achiever: "Achiever", master: "Master" }
  },
  hi: {
    welcome: "सुस्वागतम", logout: "लॉगआउट", doubtSolver: "एआई शंका समाधान",
    askDoubt: "अपनी शंका पूछें...", modeLearning: "सीखने का मार्ग",
    modeAssessment: "प्रारंभिक मूल्यांकन", maths: "गणित", science: "विज्ञान",
    wellnessBtn: "🌿 साप्ताहिक स्वास्थ्य जांच",
    badges: { starter: "शुरुआत", achiever: "सफल", master: "महारत" }
  }
};

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en");
  const [activeWatchProgress, setActiveWatchProgress] = useState(0);
  const [showWellnessBtn, setShowWellnessBtn] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [assignmentStep, setAssignmentStep] = useState("watch"); 
  const [isVerifying, setIsVerifying] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const t = translations[lang];

  const isBlind = student?.disability?.toLowerCase() === "blind" || student?.disability?.toLowerCase() === "visually impaired";

  const colors = {
    primaryDeep: "#065f46",
    pastelBg: "#f0fdf4",
    darkSlate: "#0f172a",
    wellnessGold: "#f59e0b"
  };

  /* ================= 1. VOICE SYNTHESIS ================= */
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const speak = (text) => {
    if (!isBlind || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/📌|📖|💡/g, "")
      .replace(/ANSWER:|📌 ANSWER/gi, "The answer is: ")
      .replace(/EXPLANATION:|📖 EXPLANATION/gi, "The explanation is: ")
      .replace(/\+/g, " plus ")
      .replace(/\n/g, ". ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const indianFemale = voices.find(v =>
      (v.lang.includes("en-IN") || v.lang.includes("hi-IN")) &&
      (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google"))
    );
    if (indianFemale) utterance.voice = indianFemale;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  /* ================= 2. DATA LOADING & AUDIO GUIDE ================= */
  const loadLatestData = () => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const loggedIn = students.find((s) => s.name === name);
    
    if (loggedIn) {
      const processed = {
        ...loggedIn,
        completedLessons: loggedIn.completedLessons || [],
        verifiedSummaries: loggedIn.verifiedSummaries || [],
        scores: loggedIn.scores || {},
        levels: loggedIn.levels || { maths: "Class 1", science: "Class 1" }
      };
      setStudent(processed);
      const needsWellness = shouldShowMentalHealthCheck(name);
      setShowWellnessBtn(needsWellness);

      // Notify about wellness check if available
      if (isBlind && needsWellness) {
          setTimeout(() => speak("A weekly wellness check is available. Press Alt plus W to start your check-in."), 3000);
      }
    } else { 
      navigate("/"); 
    }
  };

  useEffect(() => { loadLatestData(); }, []);

  useEffect(() => {
    if (student && isBlind) {
      const welcomeMsg = `Welcome ${student.name}. Your Learning Path is ready. 
      Your level for Mathematics is ${student.levels.maths}, and for Science is ${student.levels.science}. 
      Keyboard shortcuts: 
      Press Alt plus P to Play or Pause the lesson. 
      Press Alt plus U to Upload your summary notes. 
      Press Alt plus T to start your Topic Test. 
      Press Alt plus W to start your Wellness Check-in.
      Press and hold Spacebar to ask the AI a question. 
      Press Alt plus Q to logout.`;
      speak(welcomeMsg);
    }
  }, [student?.name]); 

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /* ================= 3. PROGRESS LOGIC ================= */
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
        speak("Verification successful. Progress is 50 percent. Press Alt plus T to start the test.");
      } else {
        speak("Verification failed. Please ensure the notes are clearly visible and try again.");
      }
    } catch (err) {
      console.error("Vision error", err);
      speak("The verification service is currently offline.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteLesson = (lessonId, subject, testScore = 100) => {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updatedStudents = students.map((s) => {
      if (s.name === student.name) {
        const completed = s.completedLessons || [];
        if (!completed.includes(lessonId)) completed.push(lessonId);
        const currentScores = s.scores || {};
        currentScores[lessonId] = testScore;
        return { ...s, completedLessons: completed, scores: currentScores };
      }
      return s;
    });
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setAssignmentStep("watch"); 
    loadLatestData();
    speak(`Lesson completed with ${testScore} percent. Moving to next topic.`);
    navigate(`/student/dashboard`); 
  };

  /* ================= 4. VOICE RECOGNITION ================= */
  const startListening = () => {
    if (isListening) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
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
    } catch (err) { console.error("Chat error", err); }
  };

  /* ================= 5. KEYBOARD SHORTCUTS ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ALT + Q: LOGOUT
      if (e.altKey && e.key.toLowerCase() === 'q') {
        speak("Logging out.");
        navigate("/");
      }

      // ALT + W: WELLNESS CHECK
      if (e.altKey && e.key.toLowerCase() === 'w') {
        if (showWellnessBtn) {
            speak("Navigating to Wellness Check-in form.");
            navigate("/student/wellness-check");
        } else {
            speak("Wellness check is not required at this time.");
        }
      }

      // ALT + P: PLAY/PAUSE MEDIA
      if (e.altKey && e.key.toLowerCase() === 'p') {
        const audio = document.querySelector('audio');
        if (audio) {
            speak(audio.paused ? "Playing audio." : "Pausing audio.");
            audio.paused ? audio.play() : audio.pause();
        } else {
            speak("No playable lesson media found on this screen.");
        }
      }

      // ALT + U: UPLOAD/VERIFY
      if (e.altKey && e.key.toLowerCase() === 'u') {
        const uploadBtn = document.querySelector('input[type="file"]');
        if (uploadBtn) {
            speak("Opening file selector for notes upload.");
            uploadBtn.click();
        } else {
            speak("Upload option is not available yet.");
        }
      }

      // ALT + T: TAKE TEST
      if (e.altKey && e.key.toLowerCase() === 't') {
        const testBtn = document.querySelector('button[style*="background: rgb(6, 95, 70)"]'); 
        if (testBtn && testBtn.innerText.toUpperCase().includes("TEST")) {
            speak("Starting topic test.");
            testBtn.click();
        } else {
            speak("The test is currently locked.");
        }
      }

      // SPACE: VOICE DOUBT
      if (isBlind && e.code === "Space" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        startListening();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBlind, lang, student, showWellnessBtn]);

  if (!student) return null;

  return (
    <div style={{ backgroundColor: colors.pastelBg, minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", fontFamily: "Inter, sans-serif" }}>
        
        {/* TOP NAVIGATION BAR */}
        <nav style={styles.nav}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ fontSize: "26px", fontWeight: "900", color: colors.primaryDeep }}>EduLift</div>
            <div style={styles.badge}>{student.placementDone ? t.modeLearning : t.modeAssessment}</div>
            
            <div style={{...styles.badge, background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd'}}>
                👤 {student.name}
            </div>
            <div style={{...styles.badge, background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0'}}>
                📐 Maths: {student.levels?.maths}
            </div>
            <div style={{...styles.badge, background: '#fef9c3', color: '#854d0e', border: '1px solid #fef08a'}}>
                🧪 Science: {student.levels?.science}
            </div>
          </div>
          <div style={{ display: "flex", gap: "15px" }}>
            <button onClick={() => setLang(lang === 'en' ? 'hi' : 'en')} style={styles.langBtn}>
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>
            <button onClick={() => navigate("/")} style={styles.logoutBtn}>{t.logout}</button>
          </div>
        </nav>

        {!student.placementDone ? (
          <PlacementTest student={student} setStudent={setStudent} />
        ) : (
          <div style={styles.dashboardGrid}>
            <main id="lessons-section" style={styles.card}>
              <header style={styles.sectionHeader}>
                <h2 style={{margin: 0}}>{t.modeLearning}</h2>
                <div style={styles.statusPill}>
                  {student.completedLessons?.length || 0} Topics Mastered
                </div>
              </header>
              <Lessons
                student={student}
                onComplete={handleCompleteLesson}
                lang={lang} t={t}
                setWatchProgress={setActiveWatchProgress}
                primaryColor={colors.primaryDeep}
                assignmentStep={assignmentStep}
                setAssignmentStep={setAssignmentStep}
                onUpload={handleAssignmentUpload}
                isVerifying={isVerifying}
                speak={speak}
              />
            </main>

            <div style={styles.rightSidebar}>
              {showWellnessBtn && (
                <button onClick={() => navigate("/student/wellness-check")} style={styles.wellnessBanner}>
                  <span style={{ fontSize: "24px" }}>🌿</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: "bold" }}>{t.wellnessBtn}</div>
                    <div style={{ fontSize: "12px", opacity: 0.9 }}>Daily Mental Health Check-in</div>
                  </div>
                </button>
              )}
              <div style={styles.progressCard}>
                <StudentProgress student={student} t={t} lang={lang} />
                <p style={styles.helperText}>* Upload notes to reach 50%. Pass test to reach 100%.</p>
              </div>
              <aside style={styles.chatbotContainer}>
                <div style={styles.chatHeader}>
                  <span>🤖 {t.doubtSolver}</span>
                  {isListening && <span style={styles.pulse}>● Recording</span>}
                </div>
                <div style={styles.chatBody}>
                  {messages.length === 0 && (
                    <div style={styles.emptyChat}>Ask me anything about your current lesson!</div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} style={{ textAlign: msg.role === "user" ? "right" : "left", marginBottom: "15px" }}>
                      <div style={{ 
                        ...styles.bubble, 
                        background: msg.role === "user" ? colors.primaryDeep : "#f1f5f9", 
                        color: msg.role === "user" ? "#fff" : "#334155" 
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div style={styles.chatInputRow}>
                  <input
                    id="chat-input"
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
  nav: { display: "flex", justifyContent: "space-between", background: "#fff", padding: "18px 35px", borderRadius: "24px", marginBottom: "25px", alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" },
  badge: { background: "#f1f5f9", padding: "6px 14px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", color: "#475569" },
  langBtn: { background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 15px", borderRadius: "10px", cursor: "pointer", fontWeight: "600" },
  logoutBtn: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 18px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" },
  dashboardGrid: { display: "grid", gridTemplateColumns: "1fr 460px", gap: "25px", height: "820px" },
  card: { background: "#fff", borderRadius: "30px", padding: "30px", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" },
  rightSidebar: { display: "flex", flexDirection: "column", gap: "20px", height: "100%" },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #f1f5f9', paddingBottom: '20px' },
  statusPill: { background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  progressCard: { background: "#fff", borderRadius: "24px", padding: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" },
  helperText: { fontSize: '11px', color: '#94a3b8', marginTop: '10px', textAlign: 'center', fontStyle: 'italic' },
  wellnessBanner: { display: "flex", alignItems: "center", gap: "15px", background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "none", padding: "18px", borderRadius: "24px", cursor: "pointer", width: "100%", boxShadow: "0 4px 15px rgba(245, 158, 11, 0.15)" },
  chatbotContainer: { flex: 1, background: "#fff", borderRadius: "30px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" },
  chatHeader: { background: "#065f46", color: "#fff", padding: "20px 25px", fontWeight: "bold", display: 'flex', justifyContent: 'space-between' },
  chatBody: { flex: 1, overflowY: "auto", padding: "25px", background: '#fafafa' },
  emptyChat: { textAlign: 'center', color: '#94a3b8', marginTop: '40%', fontSize: '14px' },
  bubble: { display: "inline-block", padding: "14px 18px", borderRadius: "20px", maxWidth: "85%", fontSize: "14px", lineHeight: '1.5', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
  chatInputRow: { padding: "20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "12px" },
  input: { flex: 1, padding: "14px", borderRadius: "15px", border: "1px solid #e2e8f0", outline: 'none' },
  sendBtn: { background: "#065f46", color: "#fff", border: "none", width: "55px", borderRadius: "15px", cursor: "pointer", fontSize: '18px' },
  pulse: { fontSize: '11px', color: '#ef4444', animation: 'fadeInOut 1s infinite' }
};