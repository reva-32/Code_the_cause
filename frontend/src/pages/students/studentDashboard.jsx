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

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const t = translations[lang];

  const isBlind = student?.disability === "blind";

  const colors = {
    primaryDeep: "#065f46",
    pastelBg: "#f0fdf4",
    darkSlate: "#0f172a",
    wellnessGold: "#f59e0b"
  };

  /* ================= 1. THE SMOOTH INDIAN FEMALE VOICE ================= */

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

    const sentences = cleanText.split(". ");

    sentences.forEach((sentence) => {
      if (!sentence.trim()) return;
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      const voices = window.speechSynthesis.getVoices();

      // Priority: Indian Female (Heera, Kalpana, Google)
      const indianFemale = voices.find(v =>
        (v.lang.includes("en-IN") || v.lang.includes("hi-IN")) &&
        (v.name.toLowerCase().includes("female") ||
          v.name.toLowerCase().includes("google") ||
          v.name.toLowerCase().includes("heera") ||
          v.name.toLowerCase().includes("zira"))
      );

      if (indianFemale) utterance.voice = indianFemale;
      utterance.rate = 0.88;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    });
  };

  /* ================= 2. KEYBOARD NAVIGATION & MUTE ================= */

  useEffect(() => {
    const handleKeyDown = (e) => {
      // 🔇 MUTE: Press 'm' to stop speech (unless typing)
      if (e.key.toLowerCase() === 'm' && document.activeElement.tagName !== "INPUT") {
        window.speechSynthesis.cancel();
      }

      // ⌨️ SHORTCUTS
      if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        document.getElementById('chat-input')?.focus();
        speak("Moving to Chatbot. Hold space bar to speak your doubt.");
      }
      if (e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        document.getElementById('lessons-section')?.focus();
        speak("Moving to Lessons section.");
      }

      // 🎤 SPACEBAR VOICE INPUT
      if (isBlind && e.code === "Space" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        startListening();
      }
    };

    const handleKeyUp = (e) => {
      if (isBlind && e.code === "Space") stopListening();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isBlind, lang]);

  /* ================= CORE FUNCTIONS ================= */

  const playBeep = (freq) => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const osc = context.createOscillator();
      const gain = context.createGain();
      osc.frequency.value = freq;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(context.destination);
      osc.start();
      setTimeout(() => osc.stop(), 100);
    } catch (e) { console.error(e); }
  };

  const startListening = () => {
    if (isListening) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = lang === "hi" ? "hi-IN" : "en-IN";
    recognitionRef.current.onstart = () => { setIsListening(true); playBeep(440); };
    recognitionRef.current.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      playBeep(880);
      sendMessage(transcript);
    };
    recognitionRef.current.onend = () => setIsListening(false);
    recognitionRef.current.start();
  };

  const stopListening = () => recognitionRef.current?.stop();

  const sendMessage = async (overriddenInput) => {
    const userText = overriddenInput || input;
    if (!userText.trim()) return;

    const newMsgs = [...messages, { role: "user", content: userText }];
    setMessages(newMsgs);
    setInput("");

    try {
      const res = await axios.post("http://127.0.0.1:5000/chat", {
        message: userText,
        source: "student_dashboard",
        is_blind: isBlind
      });
      const botReply = res.data.reply;
      setMessages([...newMsgs, { role: "bot", content: botReply }]);
      if (isBlind) speak(botReply);
    } catch (err) {
      const errorMsg = "Chatbot connection failed.";
      setMessages([...newMsgs, { role: "bot", content: errorMsg }]);
      if (isBlind) speak(errorMsg);
    }
  };

  const loadLatestData = () => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const loggedIn = students.find((s) => s.name === name);
    if (loggedIn) {
      setStudent({ ...loggedIn });
      setShowWellnessBtn(shouldShowMentalHealthCheck(name));
    } else { navigate("/"); }
  };

  const handleCompleteLesson = (lessonId, subject) => {
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
    loadLatestData();
    navigate(`/student/test/${lessonId}`, { state: { subject } });
  };

  const formatBotMessage = (text) => {
    return text.replace(/📌 ANSWER|ANSWER:/g, "<h3>📌 Answer</h3>")
      .replace(/📖 EXPLANATION|EXPLANATION:/g, "<h3>📖 Explanation</h3>")
      .replace(/💡 EXAMPLE|EXAMPLE:/g, "<h3>💡 Example</h3>")
      .replace(/\n/g, "<br/>");
  };

  useEffect(() => { loadLatestData(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  if (!student) return null;

  return (
    <div style={{ backgroundColor: colors.pastelBg, minHeight: "100vh", padding: "20px" }}>
      {/* Invisible Skip link for keyboard users */}
      <button onClick={() => document.getElementById('chat-input').focus()} style={styles.skipLink}>
        Skip to Chatbox (Alt + C)
      </button>

      <div style={{ maxWidth: "1400px", margin: "0 auto", fontFamily: "sans-serif" }}>
        <nav style={styles.nav} aria-label="Main Navigation">
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ fontSize: "24px", fontWeight: "900", color: colors.primaryDeep }}>EduLift</div>
            <div style={styles.badge}>{student.placementDone ? t.modeLearning : t.modeAssessment}</div>
          </div>
          <button onClick={() => navigate("/")} style={styles.logoutBtn}>{t.logout}</button>
        </nav>

        {!student.placementDone ? (
          <PlacementTest student={student} setStudent={setStudent} />
        ) : (
          <div style={styles.dashboardGrid}>
            {/* Main Content Area */}
            <main id="lessons-section" tabIndex="0" style={styles.card} aria-label="Lesson List">
              <Lessons
                student={student}
                onComplete={handleCompleteLesson}
                lang={lang} t={t}
                setWatchProgress={setActiveWatchProgress}
                primaryColor={colors.primaryDeep}
              />
            </main>

            {/* Sidebar Chat Area */}
            <aside id="chatbot-section" style={styles.chatbotContainer} aria-label="AI Doubt Solver">
              <div style={styles.chatHeader}>🤖 {t.doubtSolver} <span style={{ fontSize: '10px', marginLeft: '10px' }}>(M to Mute)</span></div>
              <div style={styles.chatBody} aria-live="polite">
                {messages.map((msg, i) => (
                  <div key={i} style={{ textAlign: msg.role === "user" ? "right" : "left", marginBottom: "15px" }}>
                    <div style={{ ...styles.bubble, background: msg.role === "user" ? colors.primaryDeep : "#f1f5f9", color: msg.role === "user" ? "#fff" : "#334155" }}>
                      <div dangerouslySetInnerHTML={{ __html: formatBotMessage(msg.content) }} />
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {isListening && <div style={styles.listeningIndicator}>🎤 Listening...</div>}
              <div style={styles.chatInputRow}>
                <input
                  id="chat-input"
                  style={styles.input}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  aria-label="Ask your doubt here"
                  placeholder={isBlind ? "Hold Space to speak..." : t.askDoubt}
                />
                <button onClick={() => sendMessage()} style={styles.sendBtn} aria-label="Send Message">➤</button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  nav: { display: "flex", justifyContent: "space-between", background: "#fff", padding: "15px 30px", borderRadius: "20px", marginBottom: "20px", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
  badge: { background: "#f1f5f9", padding: "5px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", color: "#64748b" },
  logoutBtn: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 15px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer" },
  dashboardGrid: { display: "grid", gridTemplateColumns: "1fr 450px", gap: "25px", marginTop: "25px", height: "700px" },
  card: { background: "#fff", borderRadius: "24px", overflowY: "auto", padding: "20px", outline: "none" },
  chatbotContainer: { background: "#fff", borderRadius: "24px", display: "flex", flexDirection: "column", overflow: "hidden" },
  chatHeader: { background: "#065f46", color: "#fff", padding: "20px", fontWeight: "bold" },
  chatBody: { flex: 1, overflowY: "auto", padding: "20px" },
  listeningIndicator: { background: "#fee2e2", color: "#dc2626", textAlign: "center", padding: "5px", fontSize: "12px", fontWeight: "bold" },
  chatInputRow: { padding: "15px", borderTop: "1px solid #eee", display: "flex", gap: "10px" },
  input: { flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #ddd" },
  sendBtn: { background: "#065f46", color: "#fff", border: "none", width: "50px", borderRadius: "12px", cursor: "pointer" },
  bubble: { display: "inline-block", padding: "12px 16px", borderRadius: "15px", maxWidth: "85%", fontSize: "14px" },
  skipLink: { position: 'absolute', top: '-100px', left: '0', background: '#000', color: '#fff', padding: '10px', zIndex: 100 }
};