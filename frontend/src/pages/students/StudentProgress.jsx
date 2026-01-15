import React from "react";
import { lessons } from "../../data/lessons";

export default function StudentProgress({ student, t, lang }) {
  if (!student) return null;

  const getSubjectProgress = (subject) => {
    // 1. Determine current level for this specific subject
    const currentLevel = student.levels?.[subject.toLowerCase()] || "Class 1";

    // 2. Filter lessons strictly by subject AND current level
    const subjectLessons = lessons.filter(
      (l) => l.subject.toLowerCase() === subject.toLowerCase() &&
        (l.class === currentLevel || l.classLevel === currentLevel)
    );

    if (subjectLessons.length === 0) return { percent: 0, lastMastered: null };

    // 3. Check correct completion array (Maths vs Science)
    const completedIds = subject.toLowerCase() === "maths"
      ? student.completedMathsLessons || []
      : student.completedScienceLessons || [];

    const completedInThisLevel = subjectLessons.filter(l => completedIds.includes(l.id));

    // 4. Find the next lesson to do
    const currentLesson = subjectLessons.find(l => !completedIds.includes(l.id));

    // 5. IF NO CURRENT LESSON: They finished the class. Set 100% and STOP.
    if (!currentLesson) {
      return {
        percent: 100,
        lastMastered: completedInThisLevel[completedInThisLevel.length - 1],
        isWaitingForExam: true // This flag prevents the UI from auto-advancing
      };
    }

    // 6. Progress within the current active lesson
    let percent = 0;
    if (student.verifiedSummaries?.includes(currentLesson.id)) {
      percent = 50;
    }

    return {
      percent,
      lastMastered: completedInThisLevel[completedInThisLevel.length - 1],
      currentTitle: currentLesson.title,
      isWaitingForExam: false
    };
  };

  const maths = getSubjectProgress("maths");
  const science = getSubjectProgress("science");

  return (
    <div style={styles.container}>
      <div style={{ flex: 0.7 }}>
        <h3 style={styles.headerText}>📊 {lang === 'hi' ? 'आपकी प्रगति' : 'Current Status'}</h3>
        <p style={styles.subText}>Notes = 50% | Test = 100%</p>
      </div>

      {/* Mathematics Progress Bar */}
      <div style={{ flex: 1 }}>
        <div style={styles.labelRow}>
          <span>{t?.maths || "Mathematics"}</span>
          <span style={{ color: maths.isWaitingForExam ? "#166534" : (maths.percent === 50 ? "#f59e0b" : "#4f46e5") }}>
            {maths.percent}%
          </span>
        </div>
        <div style={styles.track}>
          <div style={{ ...styles.fill, width: `${maths.percent}%`, background: maths.isWaitingForExam ? "#166534" : "#4f46e5" }} />
        </div>
        <div style={styles.motivation}>
          {maths.isWaitingForExam ? (
            <span style={{ ...styles.actionText, color: "#166534" }}>🏁 {lang === 'hi' ? 'परीक्षा के लिए तैयार' : 'Ready for Final Exam'}</span>
          ) : maths.percent === 0 && maths.lastMastered ? (
            <span style={styles.masteredText}>⭐ Last: {maths.lastMastered.title} (100%)</span>
          ) : maths.percent === 50 ? (
            <span style={styles.actionText}>🎯 Ready for Test</span>
          ) : null}
        </div>
      </div>

      {/* Science Progress Bar */}
      <div style={{ flex: 1 }}>
        <div style={styles.labelRow}>
          <span>{t?.science || "Science"}</span>
          <span style={{ color: science.isWaitingForExam ? "#166534" : (science.percent === 50 ? "#f59e0b" : "#10b981") }}>
            {science.percent}%
          </span>
        </div>
        <div style={styles.track}>
          <div style={{ ...styles.fill, width: `${science.percent}%`, background: science.isWaitingForExam ? "#166534" : "#10b981" }} />
        </div>
        <div style={styles.motivation}>
          {science.isWaitingForExam ? (
            <span style={{ ...styles.actionText, color: "#166534" }}>🏁 {lang === 'hi' ? 'परीक्षा के लिए तैयार' : 'Ready for Final Exam'}</span>
          ) : science.percent === 0 && science.lastMastered ? (
            <span style={styles.masteredText}>⭐ Last: {science.lastMastered.title} (100%)</span>
          ) : science.percent === 50 ? (
            <span style={styles.actionText}>🎯 Ready for Test</span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { background: "#fff", padding: "20px 30px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "40px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" },
  headerText: { margin: 0, fontSize: '16px', color: '#1e293b' },
  subText: { fontSize: '10px', color: '#94a3b8', margin: '4px 0 0 0', fontWeight: 'bold' },
  labelRow: { display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "12px", fontWeight: "900", textTransform: 'uppercase' },
  track: { width: "100%", height: "10px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" },
  fill: { height: "100%", transition: "width 1s cubic-bezier(0.34, 1.56, 0.64, 1)" },
  motivation: { height: "18px", marginTop: "6px" },
  masteredText: { fontSize: "10px", color: "#059669", fontWeight: "800" },
  actionText: { fontSize: "10px", color: "#d97706", fontWeight: "800" }
};