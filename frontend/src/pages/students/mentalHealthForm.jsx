import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addMentalHealthEntry } from "../../utils/healthStorage";

export default function MentalHealthForm() {
    const navigate = useNavigate();
    const [studentName, setStudentName] = useState("");
    const [isBlind, setIsBlind] = useState(false);

    const [formData, setFormData] = useState({
        mood: 3,
        stress: 3,
        sleep: 3,
        energy: 3,
        social: "Sometimes",
        note: ""
    });

    /* ================= 1. EMPATHETIC VOICE ENGINE ================= */
    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();

        // Exact Indian Female Voice selection logic from Dashboard
        const indianFemale = voices.find(v =>
            (v.lang.includes("en-IN") || v.lang.includes("hi-IN")) &&
            (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("google"))
        );

        if (indianFemale) {
            utterance.voice = indianFemale;
        }
        
        utterance.rate = 0.85; // Slightly slower for a comforting tone
        utterance.pitch = 1.0; 
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        const loadVoices = () => window.speechSynthesis.getVoices();
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        const name = localStorage.getItem("loggedInStudent");
        const students = JSON.parse(localStorage.getItem("students")) || [];
        const loggedIn = students.find((s) => s.name === name);

        if (!name) {
            navigate("/student/login");
        } else {
            setStudentName(name);
            const blindStatus = loggedIn?.disability?.toLowerCase() === "blind" || 
                               loggedIn?.disability?.toLowerCase() === "visually impaired";
            setIsBlind(blindStatus);

            if (blindStatus) {
                setTimeout(() => {
                    speak(`Hello ${name}. I am here to check in on you. Let's take a moment to see how you are feeling. 
                    Press the Tab key to hear the first question. 
                    You can use your Left and Right arrow keys to tell me how you feel on a scale of 1 to 5.`);
                }, 1000);
            }
        }
    }, [navigate]);

    /* ================= 2. COMFORTING HANDLERS ================= */
    const getComfortingFeedback = (id, value) => {
        const val = parseInt(value);
        if (id === "mood") {
            if (val <= 2) return `I'm sorry you're feeling down. I've noted that.`;
            if (val === 3) return `Got it, you're feeling okay today.`;
            return `That's wonderful to hear that you're feeling happy!`;
        }
        if (id === "stress") {
            if (val >= 4) return `I understand things feel a bit heavy right now. I've noted your stress level.`;
            return `It's good to hear you're feeling relatively calm.`;
        }
        return `I've updated that for you.`;
    };

    const handleRatingChange = (id, label, value) => {
        setFormData({ ...formData, [id]: parseInt(value) });
        if (isBlind) {
            const feedback = getComfortingFeedback(id, value);
            speak(feedback);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const entry = { ...formData, timestamp: new Date().toISOString() };
        addMentalHealthEntry(studentName, entry);

        if (isBlind) {
            speak(`Thank you for sharing with me, ${studentName}. Your wellness check is saved. Sending you back to your dashboard now.`);
            setTimeout(() => navigate("/student/dashboard"), 3500);
        } else {
            navigate("/student/dashboard");
        }
    };

    /* ================= 3. STYLES ================= */
    const styles = {
        page: { backgroundColor: "#f0fdf4", minHeight: "100vh", padding: "40px 20px" },
        container: { maxWidth: "600px", margin: "0 auto", background: "#fff", padding: "40px", borderRadius: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" },
        qBox: { marginBottom: "25px", padding: "20px", borderRadius: "20px", background: "#f8fafc" },
        label: { display: "block", fontWeight: "bold", marginBottom: "10px", color: "#065f46" },
        range: { width: "100%", accentColor: "#065f46", height: "20px" },
        submitBtn: { width: "100%", padding: "18px", background: "#065f46", color: "#fff", border: "none", borderRadius: "15px", fontWeight: "bold", cursor: "pointer", fontSize: "17px" }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <header style={{ textAlign: "center", marginBottom: "30px" }}>
                    <h2 style={{ color: "#065f46" }}>Wellness Check-in</h2>
                    <p style={{ color: "#64748b" }}>How are you today, <b>{studentName}</b>?</p>
                </header>
                
                <form onSubmit={handleSubmit}>
                    {[
                        { id: "mood", label: "How is your mood today?", sub: "1: Sad, 5: Happy" },
                        { id: "stress", label: "How is your stress level?", sub: "1: Low, 5: High" },
                        { id: "sleep", label: "How was your sleep?", sub: "1: Poor, 5: Great" },
                    ].map((q) => (
                        <div key={q.id} style={styles.qBox}>
                            <label style={styles.label}>{q.label}</label>
                            <input
                                type="range" min="1" max="5"
                                style={styles.range}
                                value={formData[q.id]}
                                onFocus={() => isBlind && speak(`${q.label}. Use arrows to choose. 1 is ${q.sub.split(',')[0].split(':')[1]}, 5 is ${q.sub.split(',')[1]}`)}
                                onChange={(e) => handleRatingChange(q.id, q.label, e.target.value)}
                            />
                        </div>
                    ))}

                    <div style={styles.qBox}>
                        <label style={styles.label}>Anything else you want to share?</label>
                        <textarea
                            style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #ccc", minHeight: "80px" }}
                            value={formData.note}
                            onFocus={() => isBlind && speak("Do you want to type any other notes for your teacher?")}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        />
                    </div>

                    <button 
                        type="submit" 
                        style={styles.submitBtn}
                        onFocus={() => isBlind && speak("Submit your wellness check.")}
                    >
                        Save & Continue 🌿
                    </button>
                </form>
            </div>
        </div>
    );
}