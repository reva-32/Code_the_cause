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
    doubtSolver: "AI DOUBT SOLVER",
    askDoubt: "Ask a doubt...", 
    modeLearning: "Learning Path",
    modeAssessment: "Initial Assessment", 
    maths: "Mathematics", 
    science: "Science",
    wellnessBtn: "🌿 Weekly Wellness Check",
    hobbyBtn: "My Hobby Hub",
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

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
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
  
  /* ================= 1. THE DATA LOADER (Defined at Top Level) ================= */
  const loadLatestData = () => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const loggedIn = students.find((s) => s.name === name);

    if (loggedIn) {
      const processed = {
        ...loggedIn,
        completedMathsLessons: loggedIn.completedMathsLessons || [],
        completedScienceLessons: loggedIn.completedScienceLessons || [],
        verifiedSummaries: loggedIn.verifiedSummaries || [],
        levels: loggedIn.levels || { maths: "Class 1", science: "Class 1" }
      };
      setStudent(processed);

      // Update wellness button visibility
      const needsWellness = shouldShowMentalHealthCheck(name);
      setShowWellnessBtn(needsWellness);
    } else {
      navigate("/");
    }
  };

  /* ================= 2. THE SYNC EFFECTS ================= */

  // Initial Load and Cross-Tab Synchronization
  useEffect(() => {
    loadLatestData();

    // Listen for changes from the Guardian tab
    window.addEventListener('storage', loadLatestData);
    return () => window.removeEventListener('storage', loadLatestData);
  }, []);

  // Voice Welcome (Depends on student state)
  useEffect(() => {
    if (student && isBlind) {
      const welcomeMsg = `Welcome ${student.name}. Your levels are ${student.levels.maths} for Maths and ${student.levels.science} for Science.`;
      speak(welcomeMsg);
    }
  }, [student?.name]);

  useEffect(() => {
    const handleStorageChange = () => {
      // This fires whenever the Admin saves grading in the other tab
      const name = localStorage.getItem("loggedInStudent");
      const allStudents = JSON.parse(localStorage.getItem("students")) || [];
      const updatedData = allStudents.find(s => s.name === name);

      if (updatedData) {
        setStudent(updatedData); // This forces the dashboard to refresh with Class 2
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (student && isBlind) {
      const welcomeMsg = `Welcome ${student.name}. Your Learning Path is ready. 
      Your level for Mathematics is ${student.levels.maths}, and for Science is ${student.levels.science}. 
      Keyboard shortcuts are active.`;
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
        speak("Verification successful. Progress is 50 percent.");
      } else {
        speak("Verification failed.");
      }
    } catch (err) {
      console.error("Vision error", err);
      speak("Verification service offline.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteLesson = (lessonId, subject, testScore = 100) => {
    const students = JSON.parse(localStorage.getItem("students")) || [];

    const updatedStudents = students.map((s) => {
      if (s.name === student.name) {
        const subKey = subject.toLowerCase();

        // 1. Record completion for the subject-specific array
        if (subKey === "maths") {
          const completed = s.completedMathsLessons || [];
          if (!completed.includes(lessonId)) completed.push(lessonId);
          s.completedMathsLessons = completed;
        } else {
          const completed = s.completedScienceLessons || [];
          if (!completed.includes(lessonId)) completed.push(lessonId);
          s.completedScienceLessons = completed;
        }

        // 2. Update legacy global completion tracking
        const allComp = s.completedLessons || [];
        if (!allComp.includes(lessonId)) allComp.push(lessonId);
        s.completedLessons = allComp;

        // 3. Save the score for this specific topic
        s.scores = { ...s.scores, [lessonId]: testScore };

        // 🛑 LEVEL PROTECTION:
        // We do not modify s.levels here. 
        // The student stays in their current class level regardless of the score.
      }
      return s;
    });

    // 4. Persistence and UI Refresh
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setAssignmentStep("watch"); // Force reset to video mode for the next lesson
    loadLatestData(); // Pull the new lesson counts into the dashboard state

    speak(`Topic completed. Your score is ${testScore} percent. Great job staying in your current level!`);
  };

  useEffect(() => {
    // If the student has just passed a topic test
    if (student?.lastResult === "TOPIC_PASS") {
      const timer = setTimeout(() => {
        const students = JSON.parse(localStorage.getItem("students")) || [];
        const updated = students.map(s =>
          s.name === student.name ? { ...s, lastResult: null } : s
        );

        localStorage.setItem("students", JSON.stringify(updated));
        // This triggers a re-render to hide the message
        loadLatestData();
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [student?.lastResult]);
  
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

  const handleLogout = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    navigate("/");
  };

  /* ================= 5. KEYBOARD SHORTCUTS ================= */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key.toLowerCase() === 'q') handleLogout();
      if (e.altKey && e.key.toLowerCase() === 'w') {
        if (showWellnessBtn) navigate("/student/wellness-check");
      }
      if (e.altKey && e.key.toLowerCase() === 'h') navigate("/student/hobby-hub");
      if (isBlind && e.code === "Space" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        startListening();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isBlind, lang, student, showWellnessBtn]);

  /* ================= 5. UPDATED PROGRESS LOGIC ================= */
  if (!student) return null;

  // ✅ SPECIAL ADHD RULE: 
  // If ADHD and Class 1 Maths, only 2 subtopics needed.
  // Otherwise, the standard is 5 (or 1 as per your previous code).
  const getRequiredLessons = (subject) => {
    const isADHD = student.disability?.toUpperCase() === "ADHD";
    const isClass1 = student.levels?.[subject] === "Class 1";

    if (isADHD && isClass1 && subject === "maths") {
      return 2; // ADHD Class 1 Maths requirement
    }
    return 5; // Default requirement for everyone else
  };

  const MATHS_REQUIRED = getRequiredLessons("maths");
  const SCIENCE_REQUIRED = getRequiredLessons("science");

  // Independent status for Maths
  const mathsDone = (student.completedMathsLessons?.length || 0) >= MATHS_REQUIRED;
  const mathsLevel = student.levels?.maths || "Class 1";

  // Independent status for Science
  const scienceDone = (student.completedScienceLessons?.length || 0) >= SCIENCE_REQUIRED;
  const scienceLevel = student.levels?.science || "Class 1";

  /* ================= 6. DOWNLOAD LOGIC ================= */
  const downloadNotes = (fileName) => {
    if (!fileName) {
      speak("No notes are available for this lesson.");
      return alert("No notes available.");
    }

    // Update this URL to match your Flask server address
    const fileUrl = `http://localhost:5000/uploads/notes/${fileName}`;

    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    speak("Downloading lesson notes.");
  };

  return (
    <div style={{ backgroundColor: colors.pastelBg, minHeight: "100vh", padding: "20px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", fontFamily: "Inter, sans-serif" }}>

        {/* NAVIGATION BAR */}
        <nav style={styles.nav}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ fontSize: "26px", fontWeight: "900", color: colors.primaryDeep }}>EduLift</div>
            <div style={styles.badge}>{student.placementDone ? t.modeLearning : t.modeAssessment}</div>
            <div style={{ ...styles.badge, background: '#e0f2fe', color: '#0369a1' }}>👤 {student.name}</div>

            {student.placementDone && (
              <>
                {/* Mathematics Level Badge */}
                <div style={{ ...styles.badge, background: '#dcfce7', color: '#166534' }}>
                  📐 {t?.maths || "M"}: {student.levels?.maths}
                </div>

                {/* Science Level Badge */}
                <div style={{ ...styles.badge, background: '#fef3c7', color: '#92400e' }}>
                  🧪 {t?.science || "S"}: {student.levels?.science}
                </div>
              </>
            )}          </div>
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
                  <h2 style={{ margin: 0 }}>{t.modeLearning}</h2>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'flex-end' }}>

                    {/* Independent Maths Alert */}
                    {mathsDone && (
                      <>
                        {/* CASE 1: Student failed - Show Retry Alert */}
                        {student.examResult?.maths === 'fail' ? (
                          <div style={{ ...styles.waitingBadge, borderColor: '#ef4444', color: '#991b1b', background: '#fef2f2' }}>
                            ❌ Exam Failed. Please review lessons and Retry ({mathsLevel})
                          </div>
                        ) : (
                          /* CASE 2: Waiting for first attempt or grading */
                          student.examStatus?.maths !== "graded" && (
                            <div style={{ ...styles.waitingBadge, borderColor: '#16a34a', color: '#166534', background: '#f0fdf4' }}>
                              📐 Maths Exam Ready ({mathsLevel})
                            </div>
                          )
                        )}
                      </>
                    )}

                    {/* NEW: Promotion Celebration Alert */}
                    {student.examResult?.maths === 'pass' && (
                      <div style={styles.topicPassAlert}>
                        🎉 Promoted! You are now in {student.levels?.maths} for Maths!
                      </div>
                    )}

                    {/* Progress Pills */}
                    {/* Progress Pills */}
                    <div style={styles.statusPill}>
                      M: {student.completedMathsLessons?.length || 0}/{MATHS_REQUIRED}
                    </div>
                    <div style={styles.statusPill}>
                      S: {student.completedScienceLessons?.length || 0}/{SCIENCE_REQUIRED}
                    </div>
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
                  // ✅ Correct way to pass it:
                  onDownloadNotes={downloadNotes}
                />
              </main>

            {/* RIGHT SIDEBAR */}
            <div style={styles.rightSidebar}>
              {showWellnessBtn && (
                <button onClick={() => navigate("/student/wellness-check")} style={styles.wellnessBanner}>
                  <span style={{ fontSize: "24px" }}>🌿</span>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: "bold" }}>{t.wellnessBtn}</div>
                    <div style={{ fontSize: "12px", opacity: 0.9 }}>Check-in (Alt + W)</div>
                  </div>
                </button>
              )}

              <button onClick={() => navigate("/student/hobby-hub")} style={styles.hobbyHubBtn}>
                <span style={{ fontSize: "24px" }}>🎨</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontWeight: "bold", color: "#065f46" }}>{t.hobbyBtn}</div>
                  <div style={{ fontSize: "12px", color: "#047857" }}>Explore Skills (Alt + H)</div>
                </div>
              </button>

              <div style={styles.progressCard}>
                <StudentProgress student={student} t={t} lang={lang} />
                <p style={styles.helperText}>* Upload notes to reach 50%. Pass test for 100%.</p>
              </div>

              {/* CHATBOT CONTAINER */}
              <aside style={styles.chatbotContainer}>
                <div style={styles.chatHeader}>
                  <span>🤖 {t.doubtSolver}</span>
                  {isListening && <span style={styles.pulse}>● Listening</span>}
                </div>

                <div style={styles.chatBody}>
                  {messages.length === 0 && <div style={styles.emptyChat}>Ask a question about the lesson!</div>}

                  {messages.map((msg, i) => (
                    <div key={i} style={{ textAlign: msg.role === "user" ? "right" : "left", marginBottom: "15px" }}>
                      <div style={{
                        ...styles.bubble,
                        background: msg.role === "user" ? colors.primaryDeep : "#ffffff",
                        color: msg.role === "user" ? "#fff" : "#334155",
                        border: msg.role === "bot" ? "1px solid #e2e8f0" : "none"
                      }}>

                        {msg.role === "user" ? (
                          msg.content
                        ) : (
                          /* FORMATTED BOT RESPONSE */
                          <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                            {msg.content.split(/(?=📌|📖|💡)/g).map((part, index) => {
                              const isAnswer = part.includes("📌");
                              const isExplanation = part.includes("📖");
                              const isExample = part.includes("💡");

                              return (
                                <div key={index} style={{
                                  marginBottom: "10px",
                                  padding: "8px",
                                  borderRadius: "8px",
                                  background: isAnswer ? "#ecfdf5" : "transparent",
                                  borderLeft: (isExplanation || isExample) ? `4px solid ${colors.primaryDeep}` : "none"
                                }}>
                                  <ReactMarkdown>
                                    {part.replace(/-{3,}/g, "").trim()}
                                  </ReactMarkdown>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* CHAT INPUT AREA */}
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
  nav: { display: "flex", justifyContent: "space-between", background: "#fff", padding: "18px 35px", borderRadius: "24px", marginBottom: "25px", alignItems: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" },
  badge: { background: "#f1f5f9", padding: "6px 14px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold", color: "#475569", marginLeft: "10px" },
  langBtn: { background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 15px", borderRadius: "10px", cursor: "pointer", fontWeight: "600" },
  logoutBtn: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 18px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" },
  dashboardGrid: { display: "grid", gridTemplateColumns: "1fr 460px", gap: "25px", height: "820px" },
  card: { background: "#fff", borderRadius: "30px", padding: "30px", overflowY: "auto", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" },
  rightSidebar: { display: "flex", flexDirection: "column", gap: "20px", height: "100%" },

  // Header & Status Elements
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '20px'
  },
  statusPill: {
    background: '#e0f2fe',
    color: '#0369a1',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  topicPassAlert: {
    background: "#f0fdf4",
    color: "#16a34a",
    padding: "8px 16px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid #bbf7d0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    animation: "fadeIn 0.3s ease-out"
  },

  // Widgets & Banners
  progressCard: { background: "#fff", borderRadius: "24px", padding: "20px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" },
  helperText: { fontSize: '11px', color: '#94a3b8', marginTop: '10px', textAlign: 'center' },
  wellnessBanner: { display: "flex", alignItems: "center", gap: "15px", background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "none", padding: "18px", borderRadius: "24px", cursor: "pointer", width: "100%" },
  hobbyHubBtn: { display: "flex", gap: "15px", alignItems: "center", background: "#f0fdf4", border: "2px solid #10b981", padding: "18px", borderRadius: "24px", cursor: "pointer", width: "100%" },

  // Chatbot Styles
  chatbotContainer: { flex: 1, background: "#fff", borderRadius: "30px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.02)" },
  chatHeader: { background: "#065f46", color: "#fff", padding: "20px 25px", fontWeight: "bold", display: 'flex', justifyContent: 'space-between' },
  chatBody: { flex: 1, overflowY: "auto", padding: "25px", background: '#fafafa' },
  emptyChat: { textAlign: 'center', color: '#94a3b8', marginTop: '40%' },
  bubble: { display: "inline-block", padding: "14px 18px", borderRadius: "20px", maxWidth: "85%", fontSize: "14px" },
  chatInputRow: { padding: "20px", borderTop: "1px solid #f1f5f9", display: "flex", gap: "12px" },
  input: { flex: 1, padding: "14px", borderRadius: "15px", border: "1px solid #e2e8f0" },
  sendBtn: { background: "#065f46", color: "#fff", border: "none", width: "55px", borderRadius: "15px", cursor: "pointer" },
  pulse: { fontSize: '11px', color: '#ef4444' },

  waitingBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "10px 20px",
    borderRadius: "14px",
    fontWeight: "bold",
    fontSize: "13px",
    border: "1px solid #fcd34d",
    boxShadow: "0 4px 12px rgba(251, 191, 36, 0.1)",
    display: "flex",
    alignItems: "center",
    gap: "8px"
  }
};