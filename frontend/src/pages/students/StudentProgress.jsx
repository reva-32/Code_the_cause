import React from "react";
import { lessons } from "../../data/lessons";

export default function StudentProgress({ student, currentLessonProgress = 0, primaryColor = "#065f46" }) {
  
  // Calculate overall level progress
  const calculateProgress = (subject) => {
    const currentLevel = student.levels[subject];
    const lessonsForLevel = lessons.filter(
      (l) => l.subject === subject && l.class === currentLevel
    );
    
    const total = lessonsForLevel.length;
    const completed = lessonsForLevel.filter((l) => 
      student.completedLessons.includes(l.id)
    ).length;

    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const mathsProgress = calculateProgress("maths");
  const scienceProgress = calculateProgress("science");

  return (
    <div style={{ 
      padding: "25px", 
      borderRadius: "24px", 
      background: "#fff", 
      boxShadow: "0 10px 25px rgba(0,0,0,0.05)", 
      border: "1px solid #f1f5f9" 
    }}>
      <h3 style={{ margin: "0 0 20px 0", color: "#1e293b", fontSize: "18px", fontWeight: "800" }}>
        Your Journey 🏆
      </h3>

      {/* MATHS PROGRESS */}
      <div style={{ marginBottom: "25px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontWeight: "700", color: "#475569", fontSize: "14px" }}>Mathematics</span>
          <span style={{ fontWeight: "800", color: "#4f46e5", fontSize: "14px" }}>{mathsProgress}%</span>
        </div>
        
        <div style={{ width: "100%", height: "12px", background: "#f1f5f9", borderRadius: "10px", position: "relative", overflow: "hidden" }}>
          <div style={{ 
            width: `${mathsProgress}%`, 
            height: "100%", 
            background: "linear-gradient(90deg, #4f46e5, #818cf8)", 
            borderRadius: "10px", 
            transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" 
          }} />
        </div>
      </div>

      {/* SCIENCE PROGRESS */}
      <div style={{ marginBottom: "25px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontWeight: "700", color: "#475569", fontSize: "14px" }}>Science</span>
          <span style={{ fontWeight: "800", color: "#10b981", fontSize: "14px" }}>{scienceProgress}%</span>
        </div>
        
        <div style={{ width: "100%", height: "12px", background: "#f1f5f9", borderRadius: "10px", position: "relative", overflow: "hidden" }}>
          <div style={{ 
            width: `${scienceProgress}%`, 
            height: "100%", 
            background: "linear-gradient(90deg, #10b981, #34d399)", 
            borderRadius: "10px", 
            transition: "width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)" 
          }} />
        </div>
      </div>

      {/* LIVE LESSON TRACKER (The 50% Tracker) */}
      {currentLessonProgress > 0 && currentLessonProgress < 100 && (
        <div style={{ 
          marginTop: "10px", 
          padding: "15px", 
          background: "#fffbeb", 
          borderRadius: "16px", 
          border: "1px solid #fde68a",
          animation: "pulse 2s infinite"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "18px" }}>📖</span>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#92400e" }}>Current Lesson Progress</span>
          </div>
          <div style={{ width: "100%", height: "6px", background: "#fef3c7", borderRadius: "10px" }}>
            <div style={{ 
              width: `${currentLessonProgress}%`, 
              height: "100%", 
              background: "#f59e0b", 
              borderRadius: "10px",
              transition: "width 0.5s ease"
            }} />
          </div>
          <p style={{ margin: "5px 0 0 0", fontSize: "11px", color: "#b45309", textAlign: "right", fontWeight: "600" }}>
            {currentLessonProgress}% reached
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ background: "#f8fafc", padding: "8px 12px", borderRadius: "10px", fontSize: "11px", color: "#64748b", fontWeight: "600" }}>
            ✅ {student.completedLessons.length} Lessons Finished
          </div>
        </div>
      </div>
    </div>
  );
}