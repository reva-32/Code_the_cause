import React, { useState } from "react";
import { lessons } from "../../data/lessons";

export default function Lessons({ student, onComplete, setWatchProgress, primaryColor = "#065f46" }) {
  const [subject, setSubject] = useState("maths");
  const isBlind = student.disability === "blind";
  const isADHD = student.disability === "adhd";

  const handleManualComplete = (lessonId) => {
    // We only set 100% at the moment of completion for the dashboard UI
    setWatchProgress(100);
    onComplete(lessonId, subject);
  };

  const eligibleLessons = lessons.filter((l) => {
    const studentLevel = (student.levels[subject] || "").replace(/\s/g, "").toLowerCase();
    const lessonLevel = (l.class || "").replace(/\s/g, "").toLowerCase();
    return l.subject.toLowerCase() === subject.toLowerCase() && lessonLevel === studentLevel;
  });

  return (
    <div style={{ padding: "25px", borderRadius: "24px", background: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3 style={{ fontSize: isADHD ? "24px" : "20px" }}>
          {isBlind ? "🎧 Audio Learning" : "📺 Video Learning"}
        </h3>
        <select 
          value={subject} 
          onChange={(e) => { setSubject(e.target.value); setWatchProgress(0); }}
          style={{ padding: "8px", borderRadius: "10px", fontWeight: "bold" }}
        >
          <option value="maths">Mathematics</option>
          <option value="science">Science</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        {eligibleLessons.map((lesson, index) => {
          const isLocked = index > 0 && !student.completedLessons?.includes(eligibleLessons[index - 1].id);

          return (
            <div key={lesson.id} style={{ opacity: isLocked ? 0.5 : 1, pointerEvents: isLocked ? "none" : "all" }}>
              
              {/* ADHD Focus Mode: Larger Titles & Card borders */}
              <div style={{ 
                padding: "20px", 
                borderRadius: "18px", 
                border: isADHD ? `3px solid ${primaryColor}` : "1px solid #eee",
                background: isADHD ? "#fdfdfd" : "#fff"
              }}>
                <h4 style={{ fontSize: isADHD ? "20px" : "18px", marginBottom: "15px" }}>{lesson.title}</h4>

                {isBlind ? (
                  <audio controls src={lesson.audio} style={{ width: "100%" }} onEnded={() => handleManualComplete(lesson.id)} />
                ) : (
                  <div>
                    <div style={{ position: "relative", paddingTop: "56.25%", marginBottom: "15px" }}>
                      <iframe 
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: "12px" }}
                        src={`https://www.youtube.com/embed/${lesson.videoId}`}
                        title="lesson" frameBorder="0" allowFullScreen
                      />
                    </div>
                    
                    {/* ADHD Specific Step-by-Step UI */}
                    {isADHD && (
                      <div style={{ marginBottom: "15px", padding: "10px", background: "#f0fdf4", borderRadius: "8px", fontSize: "14px" }}>
                        ✅ <strong>Step 1:</strong> Watch the video carefully.<br/>
                        🚀 <strong>Step 2:</strong> Click the big button below to start your quiz!
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => handleManualComplete(lesson.id)} 
                  style={{
                    width: "100%",
                    padding: isADHD ? "20px" : "14px", // Bigger button for ADHD focus
                    background: primaryColor,
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "800",
                    fontSize: isADHD ? "18px" : "14px",
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
                  }}
                >
                  {isADHD ? "I'M READY FOR THE TEST! ✍️" : "Take Topic Test 📝"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}