import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HobbyHub() {
    const [student, setStudent] = useState(null);
    const [hobbyVideos, setHobbyVideos] = useState([]);
    const navigate = useNavigate();

    // Theme Colors (Matching your StudentDashboard)
    const colors = {
        primaryDeep: "#065f46",
        pastelBg: "#f0fdf4",
        white: "#ffffff",
        border: "#e2e8f0"
    };

    // 1. Updated Database with Verified YouTube IDs
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

    useEffect(() => {
        const name = localStorage.getItem("loggedInStudent");
        const students = JSON.parse(localStorage.getItem("students")) || [];
        const loggedIn = students.find((s) => s.name === name);

        if (loggedIn) {
            setStudent(loggedIn);

            // Default to all categories if no hobbies are selected in profile
            const interests = loggedIn.hobbies && loggedIn.hobbies.length > 0
                ? loggedIn.hobbies
                : ["instruments", "drawing", "singing", "dancing"];

            let filtered = [];
            interests.forEach(hobby => {
                const key = hobby.toLowerCase();
                if (hobbyDatabase[key]) {
                    filtered = [...filtered, ...hobbyDatabase[key]];
                }
            });
            setHobbyVideos(filtered);
        } else {
            navigate("/");
        }
    }, []);

    if (!student) return null;

    const isBlind = student.disability?.toLowerCase() === "blind";
    const isADHD = student.disability?.toLowerCase() === "adhd";

    const speak = (text) => {
        if (!isBlind || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div style={{ backgroundColor: colors.pastelBg, minHeight: "100vh", padding: "30px", fontFamily: "sans-serif" }}>
            {/* Header */}
            <header style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: colors.white,
                padding: "20px 40px",
                borderRadius: "20px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                marginBottom: "30px"
            }}>
                <button
                    onClick={() => {
                        if (isBlind) speak("Going back to dashboard");
                        navigate(-1);
                    }}
                    style={{
                        background: "#fee2e2", color: "#dc2626", border: "none",
                        padding: "10px 20px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer"
                    }}
                >
                    ← Back
                </button>
                <h1 style={{ color: colors.primaryDeep, margin: 0 }}>🌿 My Hobby Hub</h1>
                <div style={{ width: "80px" }}></div>
            </header>

            {/* Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "30px", maxWidth: "1400px", margin: "0 auto"
            }}>
                {hobbyVideos.map((vid) => (
                    <div
                        key={vid.id}
                        style={{
                            background: colors.white, borderRadius: "24px", overflow: "hidden",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
                            border: isADHD ? `4px solid ${colors.primaryDeep}` : `1px solid ${colors.border}`
                        }}
                    >
                        <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
                            <iframe
                                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                                src={`https://www.youtube.com/embed/${vid.videoId}?rel=0&modestbranding=1`}
                                title={vid.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <div style={{ padding: "20px", textAlign: "center" }}>
                            <h4 style={{
                                margin: 0, color: "#1e293b",
                                fontSize: isADHD ? "20px" : "17px", fontWeight: "bold"
                            }}>
                                {vid.title}
                            </h4>
                            {isBlind && (
                                <button
                                    onClick={() => speak(`Title: ${vid.title}`)}
                                    style={{ marginTop: "10px", background: colors.primaryDeep, color: "#fff", border: "none", padding: "5px 15px", borderRadius: "8px" }}
                                >
                                    Listen Title
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}