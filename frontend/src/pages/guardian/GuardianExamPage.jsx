import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// IMPORTANT: If you have a lessons data file, importing it helps the fallback logic
// import { lessons as staticLessons } from "../../data/lessons"; 

export default function GuardianExamPage() {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    // 1. Add Search State
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const loadData = () => {
            const data = JSON.parse(localStorage.getItem("students")) || [];
            setStudents(data);
        };
        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, []);

    // 2. Filter Logic
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ✅ Load students from localStorage and keep them in sync
    useEffect(() => {
        const loadData = () => {
            const data = JSON.parse(localStorage.getItem("students")) || [];
            setStudents(data);
        };
        loadData();
        // Listen for storage changes (helpful if grading happens in another tab)
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, []);

    const handleDownload = (level, subject, disability) => {
        const isBlind = (disability?.toLowerCase() === "blind" || disability?.toLowerCase() === "visually impaired");
        const studentGroup = isBlind ? "Blind" : "Standard";

        const formattedSubject = subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();

        // ✅ IMPROVED LOGIC:
        // This removes all underscores first, then forces an underscore between 'Class' and the number
        let cleanLevel = level ? level.trim().replace(/_/g, "") : "Class1";
        cleanLevel = cleanLevel.replace(/Class/i, "Class_");

        const fileName = `${cleanLevel}_Final_Exam.pdf`;
        const fileUrl = `http://localhost:5000/uploads/exams/${formattedSubject}/${studentGroup}/${fileName}`;

        console.log("DEBUG: Final Filename generated ->", fileName);
        window.open(fileUrl, "_blank");
    };

    const handleFileSubmit = async (studentName, subject) => {
        const inputId = subject === "Maths" ? `file-maths-${studentName}` : `file-science-${studentName}`;
        const fileInput = document.getElementById(inputId);
        const file = fileInput?.files[0];

        if (!file) {
            alert(`Please select the ${subject} answer sheet.`);
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("subject", subject);
        formData.append("studentName", studentName);

        try {
            const response = await fetch("http://localhost:5000/api/guardian/upload-answers", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert(`✅ ${subject} answer sheet submitted!`);

                const updatedStudents = students.map((s) => {
                    if (s.name === studentName) {
                        // Ensure examStatus is an object before updating
                        const currentStatus = s.examStatus && typeof s.examStatus === 'object' ? s.examStatus : {};
                        return {
                            ...s,
                            examStatus: { ...currentStatus, [subject.toLowerCase()]: "submitted" }
                        };
                    }
                    return s;
                });
                setStudents(updatedStudents);
                localStorage.setItem("students", JSON.stringify(updatedStudents));
            }
        } catch (error) {
            alert("❌ Connection to server failed.");
        }
    };
    // Inside your Admin/Grading Component
    const handleGradeSubmit = async (studentName, subject, status) => {
        try {
            const response = await fetch("http://localhost:5000/api/admin/grade-exam", {
                method: "POST",
                body: JSON.stringify({ studentName, subject, status })
            });

            if (response.ok && status === 'pass') {
                // ✅ CALL THE PROMOTION LOGIC HERE
                promoteStudent(studentName, subject);
                alert(`${studentName} has been promoted to the next level!`);
            }
        } catch (error) {
            console.error("Grading failed", error);
        }
    };

    // Put the promoteStudent function outside the component or as a helper
    const promoteStudent = (studentName, subject, result) => {
        const students = JSON.parse(localStorage.getItem("students")) || [];
        const updated = students.map(s => {
            if (s.name === studentName) {
                const subjectKey = subject.toLowerCase();
                const isMaths = subjectKey === 'maths';

                // Only move to next class if they passed
                let nextLevel = s.levels?.[subjectKey] || "Class 1";
                if (result === 'pass') {
                    const currentNum = parseInt(nextLevel.replace("Class ", ""));
                    nextLevel = `Class ${currentNum + 1}`;
                }

                return {
                    ...s,
                    // ✅ FIX: Only clear lessons if they PASSED. 
                    // If they fail, keep the existing progress so they can see the lessons.
                    completedMathsLessons: (isMaths && result === 'pass') ? [] : s.completedMathsLessons,
                    completedScienceLessons: (!isMaths && result === 'pass') ? [] : s.completedScienceLessons,

                    levels: {
                        ...s.levels,
                        [subjectKey]: nextLevel
                    },
                    examResult: {
                        ...s.examResult,
                        [subjectKey]: result // Store 'pass' or 'fail'
                    },
                    examStatus: {
                        ...s.examStatus,
                        [subjectKey]: 'graded'
                    }
                };
            }
            return s;
        });
        localStorage.setItem("students", JSON.stringify(updated));
        setStudents(updated); // Sync the state immediately
    };

    // ✅ Helper: Check if student is ready for school enrollment (Class 10 in both)
    const isReadyForSchool = (student) => {
        if (!student?.levels) return false;
        const normalize = (lvl) => (lvl || "").toString().toLowerCase().replace(/\s/g, "");
        return normalize(student.levels.maths) === "class10" &&
            normalize(student.levels.science) === "class10";
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back to Dashboard</button>

                {/* Header Flex to hold Title and Search Bar */}
                <div style={styles.headerFlex}>
                    <div>
                        <h1 style={styles.title}>Examination Center</h1>
                        <p style={styles.subtitle}>Final exams unlock once all subject lessons are completed.</p>
                    </div>

                    {/* Search Feature */}
                    <div style={styles.searchContainer}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search student name..."
                            style={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div style={styles.grid}>
                {/* Using filteredStudents instead of students */}
                {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => {
                        /**
                         * ✅ FIX: Robust Eligibility Logic
                         * Checks for the new subject-specific arrays AND the old general array
                         * as a fallback to ensure the exam unlocks correctly.
                         */
                        // 1. Calculate Maths Eligibility
                        const isMathsEligible = (() => {
                            const completedCount = s.completedMathsLessons?.length || 0;

                            // ✅ SPECIAL RULE: ADHD Students in Class 1 need exactly 2 lessons
                            if (s.disability === "ADHD" && s.levels?.maths === "Class 1") {
                                return completedCount >= 2;
                            }

                            // Default Rule for everyone else
                            return completedCount >= 1;
                        })();

                        // 2. Calculate Science Eligibility (Standard Rule)
                        const isScienceEligible = (() => {
                            const completedCount = s.completedScienceLessons?.length || 0;
                            return completedCount >= 1; // Keep standard logic for Science
                        })();

                        const mathsStatus = s.examStatus?.maths;
                        const scienceStatus = s.examStatus?.science;

                        return (
                            <div key={s.name} style={styles.card}>
                                {/* 🆕 SCHOOL ENROLLMENT ALERT */}
                                {isReadyForSchool(s) && (
                                    <div style={styles.schoolAlert}>
                                        <div style={styles.schoolIcon}>🏫</div>
                                        <div>
                                            <strong style={{ display: 'block', color: '#1e3a8a', fontSize: '14px' }}>
                                                Ready for Board Exams!
                                            </strong>
                                            <span style={{ fontSize: '12px', color: '#334155', lineHeight: '1.2', display: 'block' }}>
                                                Reached Class 10 in Maths & Science. Please enroll in partner school.
                                            </span>
                                            <button
                                                style={styles.schoolBtn}
                                                onClick={() => navigate("/guardian/school-registration", { state: { studentName: s.name } })}
                                            >
                                                Enroll Now
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Promotion Alerts */}
                                {s.examResult?.maths === 'pass' && (
                                    <div style={styles.promotionAlert}>🎊 Maths Passed! Promoted to {s.levels?.maths}</div>
                                )}
                                {s.examResult?.science === 'pass' && (
                                    <div style={styles.promotionAlert}>🎊 Science Passed! Promoted to {s.levels?.science}</div>
                                )}

                                <div style={styles.cardHeader}>
                                    <h2 style={styles.studentName}>{s.name}</h2>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        <span style={styles.classBadge}>M: {s.levels?.maths || "Class 1"}</span>
                                        <span style={styles.classBadge}>S: {s.levels?.science || "Class 1"}</span>
                                    </div>
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>

                                    {/* MATHEMATICS SECTION */}
                                    <div style={isMathsEligible ? styles.unlockedBox : styles.lockedBox}>
                                        <p style={styles.subjectLabel}>📐 Mathematics</p>
                                        {isMathsEligible ? (
                                            <>
                                                {/* If they haven't submitted yet OR if they FAILED the previous attempt */}
                                                {(mathsStatus !== "submitted" && mathsStatus !== "graded") || s.examResult?.maths === 'fail' ? (
                                                    <>
                                                        {s.examResult?.maths === 'fail' && (
                                                            <p style={{ color: '#dc2626', fontSize: '11px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
                                                                ❌ Last Attempt Failed. Please re-download and retry.
                                                            </p>
                                                        )}
                                                        <button onClick={() => handleDownload(s.levels?.maths || "Class 1", "Maths", s.disability)} style={styles.mathBtn}>
                                                            {s.examResult?.maths === 'fail' ? "Retry Maths Paper" : "Download Maths Paper"}
                                                        </button>
                                                        <input type="file" id={`file-maths-${s.name}`} style={styles.fileInput} accept=".pdf" />
                                                        <button style={styles.submitBtn} onClick={() => handleFileSubmit(s.name, "Maths")}>
                                                            Submit Maths Answers
                                                        </button>
                                                    </>
                                                ) : mathsStatus === "submitted" ? (
                                                    <div style={styles.pendingBox}>⏳ Maths Awaiting Grade</div>
                                                ) : (
                                                    <div style={styles.doneBox}>✅ Maths Passed & Graded</div>
                                                )}
                                            </>
                                        ) : (
                                            <p style={styles.lockText}>🔒 Complete all Maths lessons to unlock this exam.</p>
                                        )}
                                    </div>

                                    {/* SCIENCE SECTION */}
                                    <div style={isScienceEligible ? styles.unlockedBox : styles.lockedBox}>
                                        <p style={styles.subjectLabel}>🧪 Science</p>
                                        {isScienceEligible ? (
                                            <>
                                                {(scienceStatus !== "submitted" && scienceStatus !== "graded") || s.examResult?.science === 'fail' ? (
                                                    <>
                                                        {s.examResult?.science === 'fail' && (
                                                            <p style={{ color: '#dc2626', fontSize: '11px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
                                                                ❌ Last Attempt Failed. Retry when ready.
                                                            </p>
                                                        )}
                                                        <button onClick={() => handleDownload(s.levels?.science || "Class 1", "Science", s.disability)} style={styles.sciBtn}>
                                                            {s.examResult?.science === 'fail' ? "Retry Science Paper" : "Download Science Paper"}
                                                        </button>
                                                        <input type="file" id={`file-science-${s.name}`} style={styles.fileInput} accept=".pdf" />
                                                        <button style={styles.submitBtn} onClick={() => handleFileSubmit(s.name, "Science")}>
                                                            Submit Science Answers
                                                        </button>
                                                    </>
                                                ) : scienceStatus === "submitted" ? (
                                                    <div style={styles.pendingBox}>⏳ Science Awaiting Grade</div>
                                                ) : (
                                                    <div style={styles.doneBox}>✅ Science Passed & Graded</div>
                                                )}
                                            </>
                                        ) : (
                                            <p style={styles.lockText}>🔒 Complete all Science lessons to unlock this exam.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={styles.noResults}>
                        <p>No students found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "60px 40px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif"
    },
    header: {
        marginBottom: "40px",
        textAlign: "left"
    },
    backBtn: {
        background: "none",
        border: "none",
        color: "#065f46",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "16px",
        marginBottom: "15px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: 0
    },
    title: {
        fontSize: "32px",
        color: "#064e3b",
        margin: 0,
        fontWeight: "800",
        letterSpacing: "-0.5px"
    },
    subtitle: {
        color: "#64748b",
        marginTop: "8px",
        fontSize: "16px"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
        gap: "30px"
    },
    card: {
        background: "#fff",
        borderRadius: "20px",
        padding: "30px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    },
    promotionAlert: {
        background: "#10b981",
        color: "white",
        padding: "12px",
        borderRadius: "12px",
        fontSize: "13px",
        textAlign: "center",
        fontWeight: "bold",
        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)"
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f1f5f9",
        paddingBottom: "15px"
    },
    studentName: {
        margin: 0,
        fontSize: "22px",
        color: "#1e293b",
        fontWeight: "700"
    },
    classBadge: {
        background: "#f1f5f9",
        padding: "6px 12px",
        borderRadius: "8px",
        fontSize: "11px",
        fontWeight: "800",
        color: "#475569",
        textTransform: "uppercase"
    },
    unlockedBox: {
        background: "#ffffff",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #05966920",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
        backgroundColor: "#f0fdf4"
    },
    lockedBox: {
        background: "#f8fafc",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        opacity: 0.7
    },
    subjectLabel: {
        fontSize: "15px",
        fontWeight: "700",
        marginBottom: "12px",
        color: "#334155",
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    mathBtn: {
        width: "100%",
        padding: "12px",
        background: "#0369a1",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        marginBottom: "12px",
        fontWeight: "600",
        fontSize: "14px"
    },
    sciBtn: {
        width: "100%",
        padding: "12px",
        background: "#0891b2",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: "pointer",
        marginBottom: "12px",
        fontWeight: "600",
        fontSize: "14px"
    },
    fileInput: {
        fontSize: "12px",
        width: "100%",
        marginBottom: "12px",
        color: "#64748b",
        padding: "8px",
        background: "#fff",
        borderRadius: "6px",
        border: "1px solid #e2e8f0"
    },
    submitBtn: {
        width: "100%",
        padding: "12px",
        background: "#334155",
        color: "white",
        border: "none",
        borderRadius: "10px",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "14px"
    },
    schoolAlert: {
        background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
        border: "1px solid #bfdbfe",
        borderRadius: "16px",
        padding: "20px",
        display: "flex",
        gap: "15px",
        alignItems: "center",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
    },
    schoolBtn: {
        marginTop: "12px",
        background: "#065f46",
        color: "#fff",
        border: "none",
        padding: "8px 16px",
        borderRadius: "8px",
        fontWeight: "700",
        cursor: "pointer",
        fontSize: "12px",
        boxShadow: "0 2px 4px rgba(6, 95, 70, 0.2)"
    },
    headerFlex: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "20px",
        marginTop: "10px"
    },
    searchContainer: {
        position: "relative",
        display: "flex",
        alignItems: "center",
        minWidth: "300px"
    },
    searchIcon: {
        position: "absolute",
        left: "12px",
        fontSize: "14px",
        color: "#94a3b8"
    },
    searchInput: {
        width: "100%",
        padding: "12px 12px 12px 40px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        fontSize: "14px",
        outline: "none",
        color: "#1e293b",
        backgroundColor: "#fff",
        transition: "border-color 0.2s",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
    },
    noResults: {
        gridColumn: "1 / -1",
        textAlign: "center",
        padding: "60px",
        background: "#f1f5f9",
        borderRadius: "20px",
        color: "#64748b",
        border: "2px dashed #e2e8f0"
    },
};