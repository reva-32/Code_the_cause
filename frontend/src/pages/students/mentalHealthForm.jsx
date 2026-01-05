import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addMentalHealthEntry } from "../../utils/healthStorage";

export default function MentalHealthForm() {
    const navigate = useNavigate();
    const [studentName, setStudentName] = useState("");

    const [formData, setFormData] = useState({
        mood: 3,
        stress: 3,
        sleep: 3,
        energy: 3,
        focus: 3,
        social: "Sometimes",
        worry: "Not at all",
        note: ""
    });

    useEffect(() => {
        const name = localStorage.getItem("loggedInStudent");
        // Ensure the student is logged in, otherwise send to login
        if (!name) {
            navigate("/student/login");
        } else {
            setStudentName(name);
        }
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const entry = {
            ...formData,
            timestamp: new Date().toISOString()
        };

        // Save to LocalStorage via your utility
        addMentalHealthEntry(studentName, entry);

        alert("Thank you! Your wellness check-in is complete.");

        // MATCHING THE ROUTE IN App.js EXACTLY
        navigate("/student/dashboard");
    };

    // Styles to match your Student Dashboard aesthetic
    const styles = {
        page: { backgroundColor: "#f0fdf4", minHeight: "100vh", padding: "40px 20px", fontFamily: "sans-serif" },
        container: { maxWidth: "650px", margin: "0 auto", background: "#fff", padding: "40px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" },
        qBox: { marginBottom: "25px", paddingBottom: "15px", borderBottom: "1px solid #f1f5f9" },
        label: { display: "block", fontWeight: "bold", marginBottom: "10px", color: "#0f172a" },
        inputGroup: { display: "flex", flexDirection: "column", gap: "5px" },
        range: { width: "100%", accentColor: "#065f46", cursor: "pointer" },
        select: { width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" },
        submitBtn: { width: "100%", padding: "15px", background: "#065f46", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" },
        backBtn: { background: "none", border: "none", color: "#065f46", cursor: "pointer", fontWeight: "bold", marginBottom: "20px", padding: 0 }
    };

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <button onClick={() => navigate("/student/dashboard")} style={styles.backBtn}>
                    ← Back to Dashboard
                </button>

                <h2 style={{ color: "#065f46", marginTop: 0 }}>Weekly Wellness Check-in 🌿</h2>
                <p style={{ color: "#64748b", marginBottom: "30px" }}>
                    Hi <b>{studentName}</b>, how has your week been?
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Questions 1-5: Range Scale */}
                    {[
                        { id: "mood", label: "1. Overall Mood (Very Sad to Very Happy)", labels: ["😢", "😊"] },
                        { id: "stress", label: "2. Stress Level (Low to High)", labels: ["😌", "😫"] },
                        { id: "sleep", label: "3. Sleep Quality (Poor to Good)", labels: ["😴", "✨"] },
                        { id: "energy", label: "4. Energy Levels (Tired to Energetic)", labels: ["🪫", "🔋"] },
                        { id: "focus", label: "5. Focus on Studies (Difficult to Easy)", labels: ["🌀", "🎯"] },
                    ].map((q) => (
                        <div key={q.id} style={styles.qBox}>
                            <label style={styles.label}>{q.label}</label>
                            <div style={styles.inputGroup}>
                                <input
                                    type="range" min="1" max="5"
                                    style={styles.range}
                                    value={formData[q.id]}
                                    onChange={(e) => setFormData({ ...formData, [q.id]: parseInt(e.target.value) })}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px" }}>
                                    <span>{q.labels[0]}</span><span>{q.labels[1]}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Question 6: Social */}
                    <div style={styles.qBox}>
                        <label style={styles.label}>6. Comfortable talking to others?</label>
                        <select style={styles.select} value={formData.social} onChange={(e) => setFormData({ ...formData, social: e.target.value })}>
                            <option>Yes, most of the time</option>
                            <option>Sometimes</option>
                            <option>Rarely</option>
                            <option>Not at all</option>
                        </select>
                    </div>

                    {/* Question 7: Worry */}
                    <div style={styles.qBox}>
                        <label style={styles.label}>7. Felt worried or sad often?</label>
                        <select style={styles.select} value={formData.worry} onChange={(e) => setFormData({ ...formData, worry: e.target.value })}>
                            <option>Not at all</option>
                            <option>A little</option>
                            <option>Sometimes</option>
                            <option>Often</option>
                        </select>
                    </div>

                    {/* Question 8: Note */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={styles.label}>8. Anything else on your mind? (Optional)</label>
                        <textarea
                            style={{ ...styles.select, minHeight: "80px", resize: "none" }}
                            placeholder="Write here..."
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        />
                    </div>

                    <button type="submit" style={styles.submitBtn}>
                        Complete Wellness Check
                    </button>
                </form>
            </div>
        </div>
    );
}