import React from "react";
import { lessons } from "../../data/lessons";

export default function StudentProgress({ student, t, lang }) {
  // Safety check: If student data is missing, don't crash
  if (!student || !student.levels) {
    return null;
  }

  const calculateProgress = (subject) => {
    // Optional chaining added to student.levels[subject]
    const currentLevel = student?.levels?.[subject];

    if (!currentLevel) return 0;

    // Filter all lessons for this specific level and subject
    const levelLessons = lessons.filter(
      (l) => l.subject === subject && l.class === currentLevel
    );

    if (levelLessons.length === 0) return 0;

    let totalPoints = 0;
    const maxPoints = levelLessons.length * 100;

    levelLessons.forEach((lesson) => {
      // 50 Points for completing the video/audio
      if (student.watchedLessons?.includes(lesson.id)) {
        totalPoints += 50;
      }
      // 50 Points for passing the test
      if (student.completedLessons?.includes(lesson.id)) {
        totalPoints += 50;
      }
    });

    return Math.round((totalPoints / maxPoints) * 100);
  };

  const mathsProg = calculateProgress("maths");
  const scienceProg = calculateProgress("science");

  return (
    <div style={styles.container}>
      <h3 style={{ flex: 0.4 }}>📊 {lang === 'hi' ? 'आपकी प्रगति' : 'Course Progress'}</h3>

      <div style={{ flex: 1 }}>
        <div style={styles.labelRow}>
          {/* Fallback to 'Mathematics' if t.maths is undefined */}
          <span>{t?.maths || "Mathematics"}</span>
          <span>{mathsProg}%</span>
        </div>
        <div style={styles.track}>
          <div style={{ ...styles.fill, width: `${mathsProg}%`, background: "#4f46e5" }} />
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={styles.labelRow}>
          {/* Fallback to 'Science' if t.science is undefined */}
          <span>{t?.science || "Science"}</span>
          <span>{scienceProg}%</span>
        </div>
        <div style={styles.track}>
          <div style={{ ...styles.fill, width: `${scienceProg}%`, background: "#10b981" }} />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { background: "#fff", padding: "20px 30px", borderRadius: "24px", display: "flex", alignItems: "center", gap: "40px", marginBottom: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" },
  labelRow: { display: "flex", justifyContent: "space-between", marginBottom: "5px", fontSize: "12px", fontWeight: "bold" },
  track: { width: "100%", height: "10px", background: "#f1f5f9", borderRadius: "10px", overflow: "hidden" },
  fill: { height: "100%", transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" }
};