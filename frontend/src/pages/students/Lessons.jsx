import React, { useState, useRef, useEffect } from "react";
import { lessons as staticLessons } from "../../data/lessons";

export default function Lessons({
  student,
  onComplete,
  setWatchProgress,
  primaryColor = "#065f46",
  t,
  lang
}) {
  const [subject, setSubject] = useState("maths");
  const [allLessons, setAllLessons] = useState([]);
  const audioRef = useRef(null);
  const videoRefs = useRef({}); 
  const ytPlayers = useRef({}); 

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  useEffect(() => {
    const customLessons = JSON.parse(localStorage.getItem("custom_lessons")) || [];
    const personalized = customLessons.filter(l => 
      !l.targetStudentId || l.targetStudentId === student.name || l.targetStudentId === student.id
    );
    setAllLessons([...staticLessons, ...personalized]);
  }, [subject, student.name, student.id]);

  useEffect(() => {
    const applySpeedFix = () => {
      const interventionSub = (student.interventionSubject || "").toLowerCase();
      const currentSub = subject.toLowerCase();
      
      const isSlowNeeded = 
        student.activeIntervention === "REDUCE_SPEED" && 
        (interventionSub === currentSub || interventionSub === "all");

      const speed = isSlowNeeded ? 0.75 : 1.0;

      if (audioRef.current) audioRef.current.playbackRate = speed;
      Object.values(videoRefs.current).forEach(v => { if (v) v.playbackRate = speed; });
      Object.values(ytPlayers.current).forEach(player => {
        if (player && player.setPlaybackRate) player.setPlaybackRate(speed);
      });
    };

    const timer = setTimeout(applySpeedFix, 1000);
    return () => clearTimeout(timer);
  }, [allLessons, student.activeIntervention, student.interventionSubject, subject]);

  const isBlind = student.disability?.toLowerCase() === "blind" ||
    student.disability?.toLowerCase() === "visually impaired";
  const isADHD = student.disability?.toLowerCase() === "adhd";

  const handleManualComplete = (lessonId) => {
    setWatchProgress(100);
    onComplete(lessonId, subject);
  };

  const eligibleLessons = allLessons.filter((l) => {
    const studentLevel = (student.levels?.[subject] || "").replace(/\s/g, "").toLowerCase();
    const lessonLevelRaw = l.classLevel || l.class || "";
    const lessonLevel = lessonLevelRaw.toString().replace(/\s/g, "").toLowerCase();
    const normalizedStudentLevel = studentLevel.includes("class") ? studentLevel : `class${studentLevel}`;
    const normalizedLessonLevel = lessonLevel.includes("class") ? lessonLevel : `class${lessonLevel}`;
    return (l.subject.toLowerCase() === subject.toLowerCase() && normalizedLessonLevel === normalizedStudentLevel);
  });

  const isSubjectSlowed = 
    student.activeIntervention === "REDUCE_SPEED" && 
    ((student.interventionSubject || "").toLowerCase() === subject.toLowerCase() || student.interventionSubject === "all");

  return (
    <div style={{ padding: "25px", borderRadius: "24px", background: "#fff", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3 style={{ fontSize: isADHD ? "24px" : "20px" }}>
          {isBlind ? (t.audioLessons || "Audio Lessons") : (t.videoLessons || "Video Lessons")}
          {isSubjectSlowed && (
            <span style={{ fontSize: "12px", marginLeft: "10px", color: "#0891b2", background: "#ecfeff", padding: "4px 8px", borderRadius: "6px" }}>
              🐢 {lang === "hi" ? "धीमी गति सक्रिय" : "Slow Mode Active"}
            </span>
          )}
        </h3>

        <select
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setWatchProgress(0); }}
          style={{ padding: "8px", borderRadius: "10px", fontWeight: "bold", border: `2px solid ${primaryColor}` }}
        >
          <option value="maths">{t.maths}</option>
          <option value="science">{t.science}</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
        {eligibleLessons.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            <p style={{ fontSize: "40px" }}>📚</p>
            <p>{t.noLessons || "No lessons available for your current level yet."}</p>
          </div>
        ) : (
          eligibleLessons.map((lesson, index) => {
            const isLocked = index > 0 && !student.completedLessons?.includes(eligibleLessons[index - 1].id);
            const isCurrentActive = !isLocked && (index === 0 || student.completedLessons?.includes(eligibleLessons[index - 1].id));

            return (
              <div key={lesson.id} style={{ opacity: isLocked ? 0.5 : 1, pointerEvents: isLocked ? "none" : "all", transition: "all 0.3s ease" }}>
                <div style={{ padding: "20px", borderRadius: "18px", border: isADHD ? `3px solid ${primaryColor}` : "1px solid #eee", background: isADHD ? "#fdfdfd" : "#fff", boxShadow: isCurrentActive ? "0 4px 12px rgba(0,0,0,0.05)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                    <h4 style={{ fontSize: isADHD ? "20px" : "18px", margin: 0 }}>{isLocked ? `🔒 ${t.locked || "Locked"}` : lesson.title}</h4>
                    {lesson.isPersonalized && <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "bold" }}>SPECIAL FOR YOU</span>}
                  </div>

                  {!isLocked && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {isBlind ? (
                        <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "12px" }}>
                          <audio ref={isCurrentActive ? audioRef : null} controls src={lesson.audioFile ? `/audios/${lesson.audioFile}` : lesson.audio} style={{ width: "100%" }} onEnded={() => handleManualComplete(lesson.id)} />
                        </div>
                      ) : (
                        <div style={{ position: "relative", paddingTop: "56.25%", background: "#000", borderRadius: "12px", overflow: "hidden" }}>
                          {lesson.videoFile ? (
                            <video ref={el => videoRefs.current[lesson.id] = el} controls style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "#000" }} src={`/videos/${lesson.videoFile}`} />
                          ) : (
                            <iframe id={`yt-player-${lesson.id}`} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }} src={`https://www.youtube.com/embed/${lesson.videoId}?enablejsapi=1&rel=0`} title="lesson" frameBorder="0" allowFullScreen
                              onLoad={() => {
                                if (window.YT && window.YT.Player) {
                                  ytPlayers.current[lesson.id] = new window.YT.Player(`yt-player-${lesson.id}`, {
                                    events: { 'onReady': (event) => {
                                      const interventionSub = (student.interventionSubject || "").toLowerCase();
                                      const isSlow = student.activeIntervention === "REDUCE_SPEED" && (interventionSub === subject.toLowerCase() || interventionSub === "all");
                                      event.target.setPlaybackRate(isSlow ? 0.75 : 1.0);
                                    }}
                                  });
                                }
                              }}
                            />
                          )}
                        </div>
                      )}

                      {isADHD && (
                        <div style={{ padding: "15px", background: "#f0fdf4", borderRadius: "12px", border: "1px dashed #10b981", fontSize: "14px" }}>
                          🎯 <strong>{lang === "hi" ? "आपका लक्ष्य:" : "Your Goal:"}</strong> {lesson.title}<br />
                          ✅ <strong>{lang === "hi" ? "चरण 1:" : "Step 1:"}</strong> {t.step1Watch || "Watch carefully."}
                        </div>
                      )}

                      <button onClick={() => handleManualComplete(lesson.id)} style={{ width: "100%", padding: isADHD ? "20px" : "15px", background: primaryColor, color: "white", border: "none", borderRadius: "14px", fontWeight: "800", fontSize: isADHD ? "18px" : "15px", cursor: "pointer" }}>
                        {lang === 'hi' ? "परीक्षा शुरू करें! ✍️" : "TAKE THE TOPIC TEST! ✍️"}
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