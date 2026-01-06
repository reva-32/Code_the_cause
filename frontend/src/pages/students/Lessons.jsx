import React, { useState, useRef } from "react";
import { lessons } from "../../data/lessons";

export default function Lessons({
  student,
  onComplete,
  setWatchProgress,
  primaryColor = "#065f46",
  t,
  lang
}) {
  const [subject, setSubject] = useState("maths");
  const audioRef = useRef(null);

  const isBlind = student.disability?.toLowerCase() === "blind" ||
    student.disability?.toLowerCase() === "visually impaired";

  const isADHD = student.disability?.toLowerCase() === "adhd";

  const handleManualComplete = (lessonId) => {
    setWatchProgress(100);
    onComplete(lessonId, subject);
  };

  const eligibleLessons = lessons.filter((l) => {
    const studentLevel = (student.levels?.[subject] || "")
      .replace(/\s/g, "")
      .toLowerCase();
    const lessonLevel = (l.class || "")
      .replace(/\s/g, "")
      .toLowerCase();

    return (
      l.subject.toLowerCase() === subject.toLowerCase() &&
      lessonLevel === studentLevel
    );
  });

  return (
    <div
      style={{
        padding: "25px",
        borderRadius: "24px",
        background: "#fff",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3 style={{ fontSize: isADHD ? "24px" : "20px" }}>
          {isBlind ? (t.audioLessons || "Audio Lessons") : (t.videoLessons || "Video Lessons")}
        </h3>

        <select
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            setWatchProgress(0);
          }}
          style={{ padding: "8px", borderRadius: "10px", fontWeight: "bold" }}
        >
          <option value="maths">{t.maths}</option>
          <option value="science">{t.science}</option>
        </select>
      </div>

      {/* Lessons List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        {eligibleLessons.length === 0 ? (
          <p>{t.noLessons}</p>
        ) : (
          eligibleLessons.map((lesson, index) => {
            const isLocked =
              index > 0 &&
              !student.completedLessons?.includes(eligibleLessons[index - 1].id);

            // Only the first unlocked lesson gets the shortcut IDs
            const isCurrentActive = !isLocked && (index === 0 || student.completedLessons?.includes(eligibleLessons[index - 1].id));

            return (
              <div
                key={lesson.id}
                style={{
                  opacity: isLocked ? 0.5 : 1,
                  pointerEvents: isLocked ? "none" : "all"
                }}
              >
                <div
                  style={{
                    padding: "20px",
                    borderRadius: "18px",
                    border: isADHD ? `3px solid ${primaryColor}` : "1px solid #eee",
                    background: isADHD ? "#fdfdfd" : "#fff"
                  }}
                >
                  <h4 style={{ fontSize: isADHD ? "20px" : "18px", marginBottom: "15px" }}>
                    {isLocked ? `🔒 ${t.locked || "Locked"}` : lesson.title}
                  </h4>

                  {!isLocked && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                      {/* MEDIA SECTION */}
                      {isBlind ? (
                        <audio
                          id={isCurrentActive ? "play-lesson-button" : undefined}
                          ref={isCurrentActive ? audioRef : null}
                          controls
                          src={lesson.audio}
                          style={{ width: "100%" }}
                          onEnded={() => handleManualComplete(lesson.id)}
                        />
                      ) : (
                        <div style={{ position: "relative", paddingTop: "56.25%" }}>
                          <iframe
                            id={isCurrentActive ? "play-lesson-button" : undefined}
                            style={{
                              position: "absolute", top: 0, left: 0,
                              width: "100%", height: "100%", borderRadius: "12px"
                            }}
                            src={`https://www.youtube.com/embed/${lesson.videoId}?enablejsapi=1`}
                            title="lesson"
                            frameBorder="0"
                            allowFullScreen
                          />
                        </div>
                      )}

                      {/* ADHD STEP HINTS */}
                      {isADHD && (
                        <div style={{ padding: "10px", background: "#f0fdf4", borderRadius: "8px", fontSize: "14px" }}>
                          ✅ <strong>{lang === "hi" ? "चरण 1:" : "Step 1:"}</strong> {t.step1Watch || "Watch carefully."}<br />
                          🚀 <strong>{lang === "hi" ? "चरण 2:" : "Step 2:"}</strong> {t.step2Test || "Click the button to start."}
                        </div>
                      )}

                      {/* THE TEST BUTTON */}
                      <button
                        id={isCurrentActive ? "start-test-button" : undefined}
                        onClick={() => handleManualComplete(lesson.id)}
                        style={{
                          width: "100%",
                          padding: isADHD ? "20px" : "14px",
                          background: primaryColor,
                          color: "white",
                          border: "none",
                          borderRadius: "12px",
                          fontWeight: "800",
                          fontSize: isADHD ? "18px" : "15px",
                          cursor: "pointer",
                          transition: "transform 0.2s"
                        }}
                      >
                        {lang === 'hi'
                          ? (t.readyForTest || "परीक्षा के लिए तैयार!")
                          : (t.readyForTest || "I'M READY FOR THE TEST!")}
                      </button>
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