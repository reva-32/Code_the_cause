import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// Import the storage helpers
import { getMentalHealthLogs, getGuardianSupportTips } from "../../utils/healthStorage";

export default function StudentMedicalProfile() {
    const { studentName } = useParams();
    const navigate = useNavigate();

    // Data Fetching & State
    const [students, setStudents] = useState(() => JSON.parse(localStorage.getItem("students")) || []);
    const studentIndex = students.findIndex(s => s.name === decodeURIComponent(studentName));
    const student = students[studentIndex];

    // Local state for the "Add Note" feature
    const [tempNote, setTempNote] = useState("");

    if (!student) return <div style={{ padding: "50px", textAlign: "center" }}>Student not found.</div>;

    const h = student.health || {};
    const v = h.vaccinationRecord || {};

    /* ================= NEW DATA FETCHING ================= */
    const decodedName = decodeURIComponent(studentName);
    const mhLogs = getMentalHealthLogs(decodedName);
    const guardianTips = getGuardianSupportTips(decodedName);
    const latestMh = mhLogs[mhLogs.length - 1];

    /* ================= EXISTING FUNCTIONALITIES ================= */

    const toggleVaccine = (vaccineName) => {
        const updatedStudents = [...students];
        const currentRecord = updatedStudents[studentIndex].health.vaccinationRecord || {};
        updatedStudents[studentIndex].health.vaccinationRecord = {
            ...currentRecord,
            [vaccineName]: !currentRecord[vaccineName]
        };
        saveData(updatedStudents);
    };

    const saveNote = () => {
        if (!tempNote.trim()) return;
        const updatedStudents = [...students];
        const timestamp = new Date().toLocaleString();
        const currentNotes = updatedStudents[studentIndex].health.clinicalNotes || "";
        updatedStudents[studentIndex].health.clinicalNotes = `[${timestamp}] ${tempNote}\n${currentNotes}`;
        saveData(updatedStudents);
        setTempNote("");
        alert("Clinical note appended.");
    };

    const saveData = (updatedList) => {
        setStudents(updatedList);
        localStorage.setItem("students", JSON.stringify(updatedList));
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Dashboard</button>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <h1 style={styles.title}>{student.name}'s Medical Profile</h1>
                        <p style={styles.subtitle}>Comprehensive Health & Wellness Record</p>
                    </div>
                    <button style={styles.exportBtn} onClick={() => window.print()}>Print / Export PDF 🖨️</button>
                </div>
            </header>

            <div style={styles.dashboardGrid}>

                {/* CARD 1: PHYSICAL VITALS (Existing) */}
                <div style={styles.card}>
                    <h2 style={styles.cardTitle}>Physical Vitals 📏</h2>
                    <div style={styles.vitalsGrid}>
                        <div style={styles.vitalItem}>
                            <span style={styles.vitalLabel}>Height</span>
                            <span style={styles.vitalValue}>{h.height ? `${h.height} cm` : "N/A"}</span>
                        </div>
                        <div style={styles.vitalItem}>
                            <span style={styles.vitalLabel}>Weight</span>
                            <span style={styles.vitalValue}>{h.weight ? `${h.weight} kg` : "N/A"}</span>
                        </div>
                    </div>
                    <div style={styles.insightBox}>
                        <small>BMI: {h.height && h.weight ? (h.weight / ((h.height / 100) ** 2)).toFixed(1) : "---"}</small>
                    </div>
                    <p style={styles.timestamp}>Last Updated: {h.lastPhysicalUpdate ? new Date(h.lastPhysicalUpdate).toLocaleDateString() : "Never"}</p>
                </div>

                {/* CARD 2: CHRONIC CONDITIONS (Existing) */}
                <div style={{ ...styles.card, borderLeft: "5px solid #ef4444" }}>
                    <h2 style={styles.cardTitle}>Conditions & Allergies 🏥</h2>
                    <p style={styles.vitalLabel}>Chronic Illnesses:</p>
                    <p style={styles.conditionText}>{h.chronicIllness || "None Reported"}</p>
                    <p style={{ ...styles.vitalLabel, marginTop: "10px" }}>Disability Category:</p>
                    <span style={styles.badge}>{student.disability}</span>
                </div>

                {/* NEW CARD 5: MENTAL WELLNESS & GUARDIAN TIPS (Added functionality) */}
                <div style={{ ...styles.card, borderLeft: "5px solid #10b981", gridColumn: "span 1" }}>
                    <h2 style={styles.cardTitle}>Mental Wellness Summary 🧠</h2>
                    {latestMh ? (
                        <>
                            <div style={styles.mhScoreRow}>
                                <div><small style={styles.vitalLabel}>Mood</small><strong>{latestMh.mood}/5</strong></div>
                                <div><small style={styles.vitalLabel}>Stress</small><strong>{latestMh.stress}/5</strong></div>
                                <div><small style={styles.vitalLabel}>Sleep</small><strong>{latestMh.sleep}/5</strong></div>
                            </div>
                            <div style={styles.tipBox}>
                                <p style={{ margin: "0 0 5px 0", fontWeight: "bold", fontSize: "12px", color: "#065f46" }}>💡 Guardian Action Plan:</p>
                                <ul style={{ paddingLeft: "15px", margin: 0, fontSize: "12px", color: "#065f46" }}>
                                    {guardianTips.map((tip, i) => <li key={i}>{tip}</li>)}
                                </ul>
                            </div>
                        </>
                    ) : (
                        <p style={styles.preText}>No wellness screenings recorded yet.</p>
                    )}
                </div>

                {/* CARD 3: CLINICAL NOTES (Existing) */}
                <div style={{ ...styles.card, borderLeft: "5px solid #0ea5e9" }}>
                    <h2 style={styles.cardTitle}>Observation Notes ✍️</h2>
                    <textarea
                        style={styles.noteInput}
                        placeholder="Add doctor's observation..."
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                    />
                    <button style={styles.saveNoteBtn} onClick={saveNote}>Append Note</button>
                    <div style={styles.scrollNotes}>
                        <pre style={styles.preText}>{h.clinicalNotes || "No clinical notes yet."}</pre>
                    </div>
                </div>

                {/* CARD 4: VACCINATION RECORD (Existing) */}
                <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
                    <h2 style={styles.cardTitle}>Vaccination History (Click to toggle status) 💉</h2>
                    <div style={styles.vaccineGrid}>
                        {["BCG", "Penta-1", "Penta-2", "Penta-3", "MR-1", "DPT-B1", "DPT-B2", "Td"].map((name) => {
                            const status = v[name];
                            return (
                                <div
                                    key={name}
                                    onClick={() => toggleVaccine(name)}
                                    style={{ ...styles.vaccineBox, background: status ? "#ecfdf5" : "#fff1f2", border: status ? "1px solid #10b981" : "1px solid #fda4af", cursor: "pointer" }}
                                >
                                    <span style={{ fontSize: "20px" }}>{status ? "✅" : "➕"}</span>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: "bold", fontSize: "14px" }}>{name}</p>
                                        <p style={{ margin: 0, fontSize: "11px", color: "#64748b" }}>{status ? "Done" : "Mark Done"}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* NEW CARD 6: HISTORICAL WELLNESS LOGS (Added functionality) */}
                <div style={{ ...styles.card, gridColumn: "1 / -1" }}>
                    <h2 style={styles.cardTitle}>Historical Wellness Trends 📊</h2>
                    {mhLogs.length > 0 ? (
                        <div style={styles.scrollNotes}>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid #eee", textAlign: "left", color: "#64748b" }}>
                                        <th style={{ padding: "10px" }}>Date</th>
                                        <th>Mood</th>
                                        <th>Stress</th>
                                        <th>Sleep</th>
                                        <th>Social</th>
                                        <th>Alert Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mhLogs.slice().reverse().map((log, i) => (
                                        <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                                            <td style={{ padding: "10px" }}>{new Date(log.date).toLocaleDateString()}</td>
                                            <td>{log.mood}/5</td>
                                            <td>{log.stress}/5</td>
                                            <td>{log.sleep}/5</td>
                                            <td>{log.social}</td>
                                            <td>
                                                <span style={{
                                                    color: log.alertLevel === 'critical' ? '#ef4444' : log.alertLevel === 'warning' ? '#f59e0b' : '#10b981',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {log.alertLevel?.toUpperCase() || "OK"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p style={styles.preText}>No historical data found.</p>
                    )}
                </div>

            </div>
        </div>
    );
}

const styles = {
    // ... all your existing styles ...
    page: { padding: "40px", maxWidth: "1000px", margin: "0 auto", fontFamily: "Inter, sans-serif", backgroundColor: "#fbfcfd", minHeight: "100vh" },
    header: { marginBottom: "30px" },
    backBtn: { background: "none", border: "none", color: "#065f46", cursor: "pointer", fontWeight: "600", marginBottom: "10px" },
    title: { fontSize: "32px", color: "#1e293b", margin: "5px 0" },
    subtitle: { color: "#64748b", margin: 0 },
    dashboardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" },
    card: { background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", border: "1px solid #e2e8f0" },
    cardTitle: { fontSize: "18px", color: "#334155", marginBottom: "20px", marginTop: 0 },
    vitalsGrid: { display: "flex", gap: "20px" },
    vitalItem: { flex: 1, padding: "15px", background: "#f8fafc", borderRadius: "12px", textAlign: "center" },
    vitalLabel: { display: "block", fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" },
    vitalValue: { fontSize: "20px", fontWeight: "bold", color: "#0f172a" },
    timestamp: { fontSize: "12px", color: "#94a3b8", marginTop: "15px" },
    conditionText: { fontSize: "16px", color: "#1e293b", margin: "5px 0" },
    badge: { display: "inline-block", padding: "4px 12px", background: "#f1f5f9", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
    vaccineGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "15px" },
    vaccineBox: { display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "12px", transition: "all 0.2s" },
    exportBtn: { padding: "10px 18px", background: "#1e293b", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
    insightBox: { marginTop: "10px", padding: "5px 10px", background: "#eff6ff", color: "#1d4ed8", borderRadius: "6px", display: "inline-block" },
    noteInput: { width: "100%", height: "60px", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "10px", fontFamily: "inherit" },
    saveNoteBtn: { background: "#0ea5e9", color: "#fff", border: "none", padding: "8px 15px", borderRadius: "6px", fontWeight: "600", cursor: "pointer", width: "100%" },
    scrollNotes: { marginTop: "15px", maxHeight: "150px", overflowY: "auto", background: "#f8fafc", padding: "10px", borderRadius: "8px" },
    preText: { whiteSpace: "pre-wrap", fontSize: "12px", color: "#475569", margin: 0 },

    /* ================= NEW STYLES FOR ADDED FUNCTIONALITY ================= */
    mhScoreRow: { display: "flex", justifyContent: "space-between", marginBottom: "15px", background: "#f0fdf4", padding: "10px", borderRadius: "8px" },
    tipBox: { background: "#f0fdf4", padding: "12px", borderRadius: "10px", border: "1px solid #dcfce7" }
};