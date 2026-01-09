import React, { useState, useRef, useEffect } from "react";
import { lessons as staticLessons } from "../../data/lessons";
import { useNavigate } from "react-router-dom";
export default function Lessons({
  student,
  onComplete,
  setWatchProgress,
  primaryColor = "#065f46",
  t,
  lang,
  assignmentStep,
  setAssignmentStep,
  onUpload,
  isVerifying,
  speak
}) {
  const [subject, setSubject] = useState("maths");
  const [allLessons, setAllLessons] = useState([]);
  const audioRef = useRef(null);
  const videoRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    const custom = JSON.parse(localStorage.getItem("custom_lessons")) || [];
    const personalized = custom.filter(l => !l.targetStudentId || l.targetStudentId === student.name);
    setAllLessons([...staticLessons, ...personalized]);
  }, [student.name]);

  const isBlind = student.disability?.toLowerCase() === "blind" || student.disability?.toLowerCase() === "visually impaired";
  const isADHD = student.disability?.toLowerCase() === "adhd";

  const eligibleLessons = allLessons.filter((l) => {
    const sLevel = (student.levels?.[subject] || "").replace(/\s/g, "").toLowerCase();
    const lLevel = (l.classLevel || l.class || "").toString().replace(/\s/g, "").toLowerCase();
    const normS = sLevel.includes("class") ? sLevel : `class${sLevel}`;
    const normL = lLevel.includes("class") ? lLevel : `class${lLevel}`;
    return (l.subject.toLowerCase() === subject.toLowerCase() && normL === normS);
  });

  useEffect(() => {
    const currentActive = eligibleLessons.find(l => !student.completedLessons?.includes(l.id));
    
    if (currentActive && student.verifiedSummaries?.includes(currentActive.id)) {
      setAssignmentStep("test");
    } else {
      setAssignmentStep("watch");
    }
  }, [subject, student.completedLessons, student.verifiedSummaries, eligibleLessons]);

  return (
    <div style={styles.outerContainer}>
      <div style={styles.headerRow}>
        <h3 style={{ margin: 0, color: primaryColor }}>{t.learningPath}</h3>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} style={styles.select}>
          <option value="maths">Mathematics</option>
          <option value="science">Science</option>
        </select>
      </div>

      <div style={styles.lessonStack}>
        {eligibleLessons.length === 0 ? (
          <div style={styles.empty}>No lessons found for this level.</div>
        ) : (
          eligibleLessons.map((lesson, index) => {
            const isCompleted = student.completedLessons?.includes(lesson.id);
            const isCurrentActive = !isCompleted && (index === 0 || student.completedLessons?.includes(eligibleLessons[index - 1].id));
            const isLocked = !isCompleted && !isCurrentActive;

            return (
              <div key={lesson.id} style={{ opacity: isLocked ? 0.6 : 1, pointerEvents: isLocked ? "none" : "all" }}>
                <div style={{ ...styles.card, border: isADHD ? `3px solid ${primaryColor}` : "1px solid #eee" }}>
                  <div style={styles.cardTop}>
                    <h4>{isLocked ? "🔒 Locked" : isCompleted ? `✅ ${lesson.title}` : lesson.title}</h4>
                    {lesson.isPersonalized && <span style={styles.badge}>FOR YOU</span>}
                  </div>

                  {isCurrentActive && (
                    <div style={styles.content}>
                      <div style={styles.media}>
                        {isBlind ? (
                          <audio ref={audioRef} controls src={lesson.audio} style={{ width: "100%" }} />
                        ) : (
                          <div style={styles.videoBox}>
                            <iframe style={styles.iframe} src={`https://www.youtube.com/embed/${lesson.videoId}?rel=0`} title="vid" frameBorder="0" allowFullScreen />
                          </div>
                        )}
                      </div>

                      {assignmentStep === "watch" ? (
                        <div style={styles.upload}>
                          <h5>Step 1: Upload Notes</h5>
                          <input type="file" onChange={(e) => onUpload(e.target.files[0], lesson.id)} disabled={isVerifying} />
                          {isVerifying && <p style={styles.pulse}>AI Verifying...</p>}
                        </div>
                      ) : (
                        <div style={styles.testArea}>
                          <button 
                            onClick={() => navigate(`/student/test/${lesson.id}`, { state: { subject } })} 
                            style={{ ...styles.btn, background: primaryColor }}
                          >
                           START TOPIC TEST ✍️
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  outerContainer: { padding: "20px", background: "#fff", borderRadius: "20px" },
  headerRow: { display: "flex", justifyContent: "space-between", marginBottom: "25px" },
  select: { padding: "8px", borderRadius: "8px", border: "1px solid #ccc", fontWeight: "bold" },
  lessonStack: { display: "flex", flexDirection: "column", gap: "20px" },
  card: { padding: "25px", borderRadius: "18px", transition: "0.3s" },
  cardTop: { display: "flex", justifyContent: "space-between", marginBottom: "15px" },
  badge: { background: "#fef3c7", color: "#92400e", padding: "4px 8px", borderRadius: "10px", fontSize: "10px" },
  media: { marginBottom: "20px" },
  videoBox: { position: "relative", paddingTop: "56.25%", background: "#000", borderRadius: "12px", overflow: "hidden" },
  iframe: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  upload: { padding: "20px", background: "#f0fdf4", border: "2px dashed #065f46", borderRadius: "15px", textAlign: "center" },
  btn: { width: "100%", color: "#fff", padding: "18px", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" },
  pulse: { color: "#0891b2", fontWeight: "bold", animation: "pulse 1.5s infinite" },
  empty: { textAlign: "center", color: "#666", padding: "40px" },
  content: { display: "flex", flexDirection: "column", gap: "15px" }
};