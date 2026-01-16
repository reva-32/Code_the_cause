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
  speak,
  onDownloadNotes
}) {
  const [subject, setSubject] = useState("maths");
  const [allLessons, setAllLessons] = useState([]);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // 1. Load Lessons (Static + Custom)
  useEffect(() => {
    const custom = JSON.parse(localStorage.getItem("custom_lessons")) || [];
    const personalized = custom.filter(l => !l.targetStudentId || l.targetStudentId === student.name);
    setAllLessons([...staticLessons, ...personalized]);
  }, [student.name]);

  const isBlind = student.disability?.toLowerCase() === "blind" || student.disability?.toLowerCase() === "visually impaired";

  // 2. Filter lessons based on Subject and Class Level
  // 2. Filter lessons based on Subject and Class Level
  const eligibleLessons = allLessons.filter((l) => {
    // Get the student's current level (e.g., "Class 1")
    const sLevelRaw = student.levels?.[subject] || "";
    const sLevel = sLevelRaw.replace(/\s/g, "").toLowerCase();

    // Look for the level in the lesson object (check both 'class' and 'classLevel')
    const lLevelRaw = l.classLevel || l.class || "";
    const lLevel = lLevelRaw.toString().replace(/\s/g, "").toLowerCase();

    // Standardize both to "classX" format for a perfect match
    const normS = sLevel.includes("class") ? sLevel : `class${sLevel}`;
    const normL = lLevel.includes("class") ? lLevel : `class${lLevel}`;

    // Debugging: Uncomment the line below if you still see issues
    // console.log(`Comparing Lesson: ${l.title} | Student: ${normS} | Lesson: ${normL}`);

    return (
      l.subject.toLowerCase() === subject.toLowerCase() &&
      normL === normS
    );
  });

  // 3. Update Assignment Step (Watch -> Test)
  useEffect(() => {
    const subjectKey = subject.toLowerCase() === 'maths' ? 'completedMathsLessons' : 'completedScienceLessons';
    const completedIds = (student[subjectKey] || []).map(id => String(id));
    const currentActive = eligibleLessons.find(l => !completedIds.includes(String(l.id)));

    if (currentActive && student.verifiedSummaries?.includes(currentActive.id)) {
      setAssignmentStep("test");
    } else {
      setAssignmentStep("watch");
    }
  }, [subject, student.completedMathsLessons, student.completedScienceLessons, student.verifiedSummaries, eligibleLessons]);

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
          (() => {
            const subjectKey = subject.toLowerCase() === 'maths' ? 'completedMathsLessons' : 'completedScienceLessons';
            const completedIds = (student[subjectKey] || []).map(id => String(id));
            const isSubjectFullyDone = eligibleLessons.length > 0 && eligibleLessons.every(l => completedIds.includes(String(l.id)));

            const examStatus = student.examStatus?.[subject] || "none";
            const examResult = student.examResult?.[subject];
            const isFailed = examResult === 'fail';

            // ✅ MODIFIED: Only show completion card if they HAVEN'T failed.
            // If they failed, we skip this and show the lessons again.
            if (isSubjectFullyDone && !isFailed) {
              return (
                <div style={styles.completionCard}>
                  <span style={{ fontSize: "60px" }}>🎓</span>
                  <h3 style={{ color: primaryColor, margin: "10px 0" }}>
                    {subject.toUpperCase()} - {student.levels?.[subject]} Complete!
                  </h3>
                  {examStatus === "assigned" ? (
                    <div style={styles.waitingBadgeSmall}>✅ Exam Assigned! Please complete it.</div>
                  ) : examStatus === "submitted" || (examStatus === "graded" && examResult === 'pass') ? (
                    <div style={styles.waitingBadgeSmall}>✨ Exam completed! Great job.</div>
                  ) : (
                    <div style={styles.waitingBadgeSmall}>⏳ Waiting for Guardian to assign your Final Exam.</div>
                  )}
                </div>
              );
            }

            // Show Lessons (Visible if not done OR if failed)
            return eligibleLessons.map((lesson, index) => {
              const lessonId = String(lesson.id);
              const isCompleted = completedIds.includes(lessonId);

              // ✅ IMPROVED LOGIC: If they failed the exam, we treat all lessons as "active" 
              // so they can re-watch anything. Otherwise, follow the sequence.
              const isCurrentActive = isFailed || (!isCompleted && (index === 0 || completedIds.includes(String(eligibleLessons[index - 1].id))));
              const isLocked = !isFailed && !isCompleted && !isCurrentActive;

              const defaultFile = subject.toLowerCase() === "maths" ? "Maths_notes.pdf" : "Science_notes.pdf";
              const fileToDownload = lesson.notesUrl || defaultFile;

              return (
                <div key={lesson.id} style={{ opacity: isLocked ? 0.6 : 1 }}>
                  <div style={styles.card}>
                    <div style={styles.cardTop}>
                      <h4>{lesson.title}</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {isFailed && <span style={{ ...styles.badge, background: '#fee2e2', color: '#b91c1c' }}>RE-WATCH</span>}
                        {!isLocked && (
                          <button onClick={() => onDownloadNotes(fileToDownload)} style={styles.downloadBadge}>
                            📄 {subject.toUpperCase()} NOTES
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Lesson is visible if it's the current active one OR if the student failed and needs review */}
                    {(isCurrentActive || isCompleted) && (
                      <div style={styles.content}>
                        <div style={styles.media}>
                          {isBlind ? (
                            <audio ref={audioRef} controls src={lesson.audio} style={{ width: "100%" }} />
                          ) : (
                            <div style={styles.videoBox}>
                              <iframe
                                style={styles.iframe}
                                src={`https://www.youtube.com/embed/${lesson.videoId}?rel=0`}
                                title="lesson-video"
                                frameBorder="0"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>

                        {!isCompleted && (
                          assignmentStep === "watch" ? (
                            <div style={styles.upload}>
                              <h5 style={{ marginTop: 0 }}>Step 1: Upload Your Notes</h5>
                              <input
                                type="file"
                                onChange={(e) => onUpload(e.target.files[0], lesson.id)}
                                disabled={isVerifying}
                                style={{ marginTop: "10px" }}
                              />
                              {isVerifying && <p style={styles.pulse}>🔍 AI is checking your notes...</p>}
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
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            });
          })()
        )}
      </div>
    </div>
  );
}

const styles = {
  outerContainer: { padding: "20px", background: "#fff", borderRadius: "20px" },
  headerRow: { display: "flex", justifyContent: "space-between", marginBottom: "25px", alignItems: "center" },
  select: { padding: "8px 12px", borderRadius: "10px", border: "1px solid #e2e8f0", fontWeight: "bold", outline: "none" },
  lessonStack: { display: "flex", flexDirection: "column", gap: "20px" },
  card: { padding: "25px", borderRadius: "18px", transition: "0.3s", background: "#fff", border: "1px solid #f1f5f9" },
  cardTop: { display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" },
  badge: { background: "#fef3c7", color: "#92400e", padding: "4px 8px", borderRadius: "10px", fontSize: "10px", fontWeight: "bold" },
  downloadBadge: { background: "#065f46", color: "#fff", padding: "6px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold", border: "none", cursor: "pointer" },
  media: { marginBottom: "20px" },
  videoBox: { position: "relative", paddingTop: "56.25%", background: "#000", borderRadius: "12px", overflow: "hidden" },
  iframe: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  upload: { padding: "20px", background: "#f0fdf4", border: "2px dashed #065f46", borderRadius: "15px", textAlign: "center" },
  btn: { width: "100%", color: "#fff", padding: "18px", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", fontSize: "16px" },
  pulse: { color: "#0891b2", fontWeight: "bold", marginTop: "10px" },
  empty: { textAlign: "center", color: "#666", padding: "40px" },
  content: { display: "flex", flexDirection: "column", gap: "15px" },
  completionCard: { textAlign: 'center', padding: '50px 20px', background: '#f8fafc', borderRadius: '30px', border: '2px dashed #cbd5e1' },
  waitingBadgeSmall: { background: "#fef3c7", color: "#92400e", padding: "10px 20px", borderRadius: "14px", fontSize: "14px", fontWeight: "bold", marginTop: "15px" }
};