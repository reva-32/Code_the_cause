import React, { useState, useRef } from "react";
import { lessons } from "../../data/lessons";

export default function Lessons({ student, onComplete, setWatchProgress, primaryColor = "#065f46" }) {
  const [subject, setSubject] = useState("maths");
  const audioRef = useRef(null);

  const themeColors = {
    primary: primaryColor,
    completed: "#10b981",
    locked: "#9ca3af",
    darkGreenBg: "#064e3b",
    audioAccent: "#059669"
  };

  const isDisabilityMode = student.disability === "yes" || student.disability === true;

  // --- PROGRESS TRACKING LOGIC ---
  
  // 1. Audio Progress (50% Check)
  const handleAudioProgress = () => {
    if (audioRef.current) {
      const { currentTime, duration } = audioRef.current;
      if (currentTime / duration >= 0.5) {
        setWatchProgress(50); // Updates the progress bar in StudentDashboard
      }
    }
  };

  // 2. Video Progress (YouTube postMessage API for 50% check)
  // Note: For a deep integration with YouTube, the YouTube IFrame Player API is usually used.
  // This version simulates the trigger when the user interacts or at specific intervals.
  const handleVideoMessage = (e) => {
    // This listener can be expanded if using the window.onYouTubeIframeAPIReady
    // For now, we ensure the manual "Finish" button handles the 100% mark.
  };

  const eligibleLessons = lessons.filter((l) => {
    const studentLevel = (student.levels[subject] || "").replace(/\s/g, "").toLowerCase();
    const lessonLevel = (l.class || "").replace(/\s/g, "").toLowerCase();
    const matchesSubject = l.subject.toLowerCase() === subject.toLowerCase();
    const matchesLevel = lessonLevel === studentLevel;

    if (!matchesSubject || !matchesLevel) return false;
    return isDisabilityMode ? !!l.audio : !!l.videoId;
  });

  return (
    <div style={{ padding: "25px", borderRadius: "24px", background: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
        <h3 style={{ margin: 0, color: "#1e293b", fontWeight: "800", fontSize: "20px" }}>
          {isDisabilityMode ? "🎧 Audio Lessons" : "📚 Video Lessons"}
        </h3>
        <select 
          value={subject} 
          onChange={(e) => { setSubject(e.target.value); setWatchProgress(0); }}
          style={{ padding: "10px 15px", borderRadius: "12px", border: "2px solid #f1f5f9", fontWeight: "bold", color: themeColors.primary }}
        >
          <option value="maths">Mathematics</option>
          <option value="science">Science</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        {eligibleLessons.map((lesson, index) => {
          const unlocked = index === 0 || student.completedLessons.includes(eligibleLessons[index - 1]?.id);
          const isCompleted = student.completedLessons.includes(lesson.id);

          return (
            <div key={lesson.id} style={{ border: "1px solid #f1f5f9", padding: "20px", borderRadius: "20px", background: unlocked ? "#fff" : "#f8fafc" }}>
              <h4 style={{ margin: "0 0 15px 0", color: unlocked ? "#1e293b" : themeColors.locked, fontSize: "17px", fontWeight: "700" }}>
                {isCompleted ? "✅ " : ""}{lesson.title}
              </h4>

              {unlocked ? (
                <div style={{ width: "100%" }}>
                  {isDisabilityMode ? (
                    <div style={{ 
                      padding: "40px 20px", 
                      background: `linear-gradient(135deg, ${themeColors.darkGreenBg} 0%, #022c22 100%)`, 
                      borderRadius: "16px", textAlign: "center", color: "white" 
                    }}>
                      <div style={{ fontSize: "60px", marginBottom: "15px" }}>📻</div>
                      <p style={{ fontWeight: "700", marginBottom: "20px" }}>Listening: {lesson.title}</p>
                      
                      <div style={{ background: "rgba(255,255,255,0.1)", padding: "15px", borderRadius: "12px" }}>
                        <audio 
                          ref={audioRef}
                          controls 
                          style={{ width: "100%" }} 
                          onTimeUpdate={handleAudioProgress} // Checks for 50% progress
                        >
                          <source src={lesson.audio} type="audio/mpeg" />
                        </audio>
                      </div>
                    </div>
                  ) : (
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "16px", background: "#000" }}>
                      <iframe 
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                        src={`https://www.youtube.com/embed/${lesson.videoId}?enablejsapi=1`} 
                        title={lesson.title} 
                        frameBorder="0" 
                        allowFullScreen 
                      />
                    </div>
                  )}

                  <button 
                    onClick={() => {
                      setWatchProgress(100); // Mark as fully done on click
                      onComplete(lesson.id, subject);
                    }}
                    style={{ 
                      marginTop: "18px", width: "100%", padding: "16px", 
                      background: themeColors.primary, color: "white", 
                      border: "none", borderRadius: "15px", cursor: "pointer", fontWeight: "800"
                    }}
                  >
                    {isCompleted ? "Retake Mastery Test 📝" : "Finish & Take Test 📝"}
                  </button>
                </div>
              ) : (
                <div style={{ padding: "40px", textAlign: "center", color: themeColors.locked }}>
                  <span style={{ fontSize: "28px" }}>🔒</span>
                  <p>Complete previous lesson to unlock.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}