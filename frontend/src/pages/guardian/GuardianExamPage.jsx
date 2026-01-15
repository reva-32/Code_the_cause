import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GuardianExamPage() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("students")) || [];
        setStudents(data);
    }, []);

    const handleDownload = (level, subject, isBlind) => {
        const studentGroup = isBlind ? "Blind" : "Standard";
        const cleanLevel = level.replace(" ", "_");
        const fileUrl = `http://localhost:5000/uploads/exams/${subject}/${studentGroup}/${cleanLevel}_Final_Exam.pdf`;
        window.open(fileUrl, "_blank");
    };

    // ✅ UPDATED: Now accepts subject to handle individual uploads
    const handleFileSubmit = async (studentName, subject) => {
        const inputId = subject === "Maths" ? `file-maths-${studentName}` : `file-science-${studentName}`;
        const fileInput = document.getElementById(inputId);
        const file = fileInput?.files[0];

        if (!file) {
            alert(`Please select the ${subject} answer sheet.`);
            return;
        }

        const formData = new FormData();
        formData.append("file", file); // Backend should handle single file field
        formData.append("subject", subject);
        formData.append("studentName", studentName);

        try {
            const response = await fetch("http://localhost:5000/api/guardian/upload-answers", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert(`✅ ${subject} answer sheet submitted for grading!`);

                const updatedStudents = students.map((s) => {
                    if (s.name === studentName) {
                        // Maintain separate status for each subject
                        const currentStatus = s.examStatus || {};
                        return {
                            ...s,
                            examStatus: { ...currentStatus, [subject.toLowerCase()]: "submitted" }
                        };
                    }
                    return s;
                });
                setStudents(updatedStudents);
                localStorage.setItem("students", JSON.stringify(updatedStudents));
            } else {
                alert("❌ Upload failed. Please check your connection.");
            }
        } catch (error) {
            alert("❌ A network error occurred.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Dashboard</button>
                <h1 style={styles.title}>Examination Center</h1>
                <p style={styles.subtitle}>Subject-specific papers for standard and blind students.</p>
            </div>

            <div style={styles.grid}>
                {students.map((s) => {
                    // ✅ Split Eligibility Logic
                    const isMathsEligible = (s.completedMathsLessons?.length || 0) >= 1;
                    const isScienceEligible = (s.completedScienceLessons?.length || 0) >= 1;

                    const mathsSubmitted = s.examStatus?.maths === "submitted";
                    const scienceSubmitted = s.examStatus?.science === "submitted";

                    const isBlindStudent = s.is_blind || false;

                    return (
                        <div key={s.name} style={styles.card}>
                            {/* --- SUBJECT SPECIFIC PROMOTION ALERTS --- */}
                            {s.examResult?.maths === 'pass' && (
                                <div style={styles.promotionAlert}>
                                    🎊 <strong>Maths Promotion!</strong> Now in <strong>{s.levels?.maths}</strong>
                                </div>
                            )}
                            {s.examResult?.science === 'pass' && (
                                <div style={styles.promotionAlert}>
                                    🎊 <strong>Science Promotion!</strong> Now in <strong>{s.levels?.science}</strong>
                                </div>
                            )}

                            <div style={styles.cardHeader}>
                                <h2 style={styles.studentName}>{s.name}</h2>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    <span style={styles.classBadge}>M: {s.levels?.maths || "Class 1"}</span>
                                    <span style={styles.classBadge}>S: {s.levels?.science || "Class 1"}</span>
                                </div>
                            </div>

                            <div style={styles.examStatus}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                                    {/* --- MATHS SECTION --- */}
                                    <div style={isMathsEligible ? styles.unlockedBox : styles.lockedBox}>
                                        <p style={styles.subjectLabel}>📐 Mathematics {isBlindStudent && " (Blind)"}</p>
                                        {isMathsEligible ? (
                                            !mathsSubmitted ? (
                                                <>
                                                    <button onClick={() => handleDownload(s.levels.maths, "Maths", isBlindStudent)} style={styles.mathBtn}>📥 Download Paper</button>
                                                    <input type="file" id={`file-maths-${s.name}`} style={styles.fileInput} accept=".pdf" />
                                                    <button style={styles.submitBtn} onClick={() => handleFileSubmit(s.name, "Maths")}>Submit Maths</button>
                                                </>
                                            ) : (
                                                <div style={styles.pendingBox}>⏳ Maths Submitted. Waiting for grade.</div>
                                            )
                                        ) : (
                                            <p style={{ fontSize: "12px", margin: 0 }}>🔒 Finish Maths lessons to unlock.</p>
                                        )}

                                        {s.examResult?.maths && (
                                            <div style={{ ...styles.miniResult, color: s.examResult.maths === 'pass' ? '#166534' : '#991b1b' }}>
                                                Result: {s.examResult.maths.toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* --- SCIENCE SECTION --- */}
                                    <div style={isScienceEligible ? styles.unlockedBox : styles.lockedBox}>
                                        <p style={styles.subjectLabel}>🧪 Science {isBlindStudent && " (Blind)"}</p>
                                        {isScienceEligible ? (
                                            !scienceSubmitted ? (
                                                <>
                                                    <button onClick={() => handleDownload(s.levels.science, "Science", isBlindStudent)} style={styles.sciBtn}>📥 Download Paper</button>
                                                    <input type="file" id={`file-science-${s.name}`} style={styles.fileInput} accept=".pdf" />
                                                    <button style={styles.submitBtn} onClick={() => handleFileSubmit(s.name, "Science")}>Submit Science</button>
                                                </>
                                            ) : (
                                                <div style={styles.pendingBox}>⏳ Science Submitted. Waiting for grade.</div>
                                            )
                                        ) : (
                                            <p style={{ fontSize: "12px", margin: 0 }}>🔒 Finish Science lessons to unlock.</p>
                                        )}

                                        {s.examResult?.science && (
                                            <div style={{ ...styles.miniResult, color: s.examResult.science === 'pass' ? '#166534' : '#991b1b' }}>
                                                Result: {s.examResult.science.toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

const styles = {
    container: { maxWidth: "1100px", margin: "0 auto", padding: "40px", fontFamily: "Inter, sans-serif" },
    header: { marginBottom: "30px" },
    backBtn: { background: "none", border: "none", color: "#065f46", cursor: "pointer", fontWeight: "bold", marginBottom: "10px" },
    title: { fontSize: "32px", color: "#064e3b", margin: 0 },
    subtitle: { color: "#64748b" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "25px" },
    card: { background: "#fff", borderRadius: "16px", padding: "25px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", position: "relative" },
    promotionAlert: { background: "#16a34a", color: "white", padding: "8px", borderRadius: "8px", fontSize: "11px", textAlign: "center", marginBottom: "10px" },
    cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
    studentName: { margin: 0, fontSize: "20px", color: "#1e293b" },
    classBadge: { background: "#f1f5f9", padding: "4px 8px", borderRadius: "12px", fontSize: "10px", fontWeight: "bold", color: "#475569" },
    unlockedBox: { background: "#f0fdf4", padding: "15px", borderRadius: "12px", border: "1px solid #05966930" },
    lockedBox: { background: "#f8fafc", padding: "15px", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b" },
    pendingBox: { padding: "10px", background: "#fef9c3", color: "#854d0e", borderRadius: "8px", fontSize: "12px", textAlign: "center", border: "1px dashed #ca8a04" },
    subjectLabel: { fontSize: "14px", fontWeight: "bold", marginBottom: "10px", color: "#334155" },
    mathBtn: { width: "100%", padding: "8px", background: "#1e40af", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginBottom: "5px" },
    sciBtn: { width: "100%", padding: "8px", background: "#0891b2", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", marginBottom: "5px" },
    fileInput: { fontSize: "11px", width: "100%", marginBottom: "5px" },
    submitBtn: { width: "100%", padding: "8px", background: "#1e293b", color: "white", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" },
    miniResult: { marginTop: "10px", fontSize: "12px", fontWeight: "bold", textAlign: "center", paddingTop: "5px", borderTop: "1px solid #eee" }
};