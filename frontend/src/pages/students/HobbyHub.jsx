import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HobbyHub() {
    const [student, setStudent] = useState(null);
    const [hobbyVideos, setHobbyVideos] = useState([]);
    const [playingId, setPlayingId] = useState(null);
    const navigate = useNavigate();

    // Logic to determine if we should use voice guidance
    const isBlind = student?.disability?.toLowerCase() === "blind" || 
                    student?.disability?.toLowerCase() === "visually impaired";

    const colors = {
        primaryDeep: "#065f46",
        pastelBg: "#f0fdf4",
        white: "#ffffff",
        border: "#e2e8f0"
    };

    const hobbyDatabase = {
        instruments: [
            { id: 1, title: "Easy First Piano Lesson", videoId: "CuL6YJpiAIg" },
            { id: 2, title: "First 3 Chords on Guitar", videoId: "d52MZJw-hIE" },
            { id: 3, title: "How to Play Piano (Day 1)", videoId: "4SXQ_wlbWog" }
        ],
        drawing: [
            { id: 4, title: "Fundamentals of Drawing", videoId: "Vn8bj0YpZg4" },
            { id: 5, title: "How to Draw Faces", videoId: "5W3Wj-a_7Vo" },
            { id: 6, title: "Start Your First Sketchbook", videoId: "jvOVWlXHySc" }
        ],
        singing: [
            { id: 7, title: "5 Minute Vocal Warm Up", videoId: "YCLyAmXtpfY" },
            { id: 8, title: "The Best Morning Warm-Up", videoId: "JHzAMBhzEUg" },
            { id: 9, title: "Easy Singing for Beginners", videoId: "TtKzDokaps8" }
        ],
        dancing: [
            { id: 10, title: "Easy Hip Hop for Kids", videoId: "h3DSYn2jIKE" },
            { id: 11, title: "Dance Routine (Ages 4+)", videoId: "JWTyO8npkOQ" },
            { id: 12, title: "Basic Dance Moves Tutorial", videoId: "xZbJQ7GjACY" }
        ]
    };

    const speak = (text) => {
        // ONLY speak if the student is flagged as blind
        if (!isBlind || !window.speechSynthesis) return;
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const indianFemale = voices.find(v =>
            (v.lang.includes("en-IN") || v.lang.includes("hi-IN")) &&
            (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google"))
        );
        if (indianFemale) utterance.voice = indianFemale;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        const loadVoices = () => window.speechSynthesis.getVoices();
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        const name = localStorage.getItem("loggedInStudent");
        const students = JSON.parse(localStorage.getItem("students")) || [];
        const loggedIn = students.find((s) => s.name === name);

        if (loggedIn) {
            setStudent(loggedIn);
            const interests = loggedIn.hobbies || ["instruments", "drawing", "dancing", "singing"];
            let filtered = [];
            interests.forEach(hobby => {
                const key = hobby.toLowerCase();
                if (hobbyDatabase[key]) filtered = [...filtered, ...hobbyDatabase[key]];
            });
            setHobbyVideos(filtered);
        } else {
            navigate("/");
        }

        // Cleanup voice on leave
        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, [navigate]);

    // Initial welcome message (triggered once student state is set)
    useEffect(() => {
        if (student && isBlind) {
            setTimeout(() => {
                speak(`Welcome to Hobby Hub! Use the Tab key to switch videos, and press Enter to play.`);
            }, 600);
        }
    }, [student, isBlind]);

    const handleKeyDown = (e, videoId, title) => {
        if (e.key === "Enter") {
            speak(`Playing ${title}`);
            setPlayingId(videoId);
        }
    };

    if (!student) return null;
    const isADHD = student.disability?.toLowerCase() === "adhd";

    return (
        <div style={{ backgroundColor: colors.pastelBg, minHeight: "100vh", padding: "30px", fontFamily: "sans-serif" }}>
            <header style={styles.header}>
                <button
                    onClick={() => { speak("Going back"); navigate(-1); }}
                    onFocus={() => speak("Back button")}
                    style={styles.backBtn}
                >
                    ← Back
                </button>
                <h1 style={{ color: colors.primaryDeep, margin: 0 }}>🌿 My Hobby Hub</h1>
                <div style={{ width: "80px" }}></div>
            </header>

            <div style={styles.videoGrid}>
                {hobbyVideos.map((vid, index) => (
                    <div
                        key={vid.id}
                        tabIndex="0" 
                        onFocus={() => speak(`Video ${index + 1}: ${vid.title}. Press Enter to play.`)}
                        onKeyDown={(e) => handleKeyDown(e, vid.videoId, vid.title)}
                        style={{
                            ...styles.card,
                            border: isADHD ? `4px solid ${colors.primaryDeep}` : (playingId === vid.videoId ? `4px solid #10b981` : `1px solid ${colors.border}`),
                            transform: playingId === vid.videoId ? "scale(1.02)" : "none"
                        }}
                    >
                        <div style={styles.videoWrapper}>
                            <iframe
                                style={styles.iframe}
                                src={`https://www.youtube.com/embed/${vid.videoId}?rel=0&autoplay=${playingId === vid.videoId ? 1 : 0}`}
                                title={vid.title}
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            />
                        </div>
                        <div style={{ padding: "15px", textAlign: "center" }}>
                            <h4 style={{ margin: 0, fontSize: isADHD ? "22px" : "18px", color: "#1e293b" }}>
                                {vid.title}
                            </h4>
                            <div style={{ marginTop: "10px", color: colors.primaryDeep, fontWeight: "bold", fontSize: "14px" }}>
                                {playingId === vid.videoId ? "▶️ Now Playing" : "⌨️ Press Enter to Play"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", padding: "20px 40px", borderRadius: "20px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", marginBottom: "30px" },
    backBtn: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", outline: "none" },
    videoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "30px", maxWidth: "1400px", margin: "0 auto" },
    card: { background: "#fff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 4px 15px rgba(0,0,0,0.08)", outline: "none", transition: "all 0.3s ease" },
    videoWrapper: { position: "relative", paddingTop: "56.25%", background: "#000" },
    iframe: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }
};