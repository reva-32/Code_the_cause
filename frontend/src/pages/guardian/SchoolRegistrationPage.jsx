import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function SchoolRegistrationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { studentName } = location.state || { studentName: "Student" };
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => navigate(-1), 3000);
    };

    return (
        <div style={styles.container}>
            {/* Header Section for better context and spacing */}
            <div style={styles.headerSection}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    <span>←</span> Back to Exams
                </button>
                <h1 style={styles.title}>Partner School Enrollment</h1>
                <p style={styles.subtitle}>Finalizing Board Exam registration for <strong>{studentName}</strong></p>
            </div>

            <div style={styles.card}>
                {!submitted ? (
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Preferred School Branch</label>
                            <select style={styles.input} required>
                                <option value="">Select a Branch</option>
                                <option value="north">Global Heights Academy (North Campus)</option>
                                <option value="south">St. Xavier Partner School (South Campus)</option>
                            </select>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Upload Aadhaar Card (PDF)</label>
                            <input type="file" style={styles.input} accept=".pdf" required />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Guardian Contact Number</label>
                            <input type="tel" placeholder="+91 XXXX XXX XXX" style={styles.input} required />
                        </div>

                        <div style={styles.infoBox}>
                            <span style={{ marginRight: '8px' }}>ℹ️</span>
                            Enrollment details will be shared with the school board for identity verification.
                        </div>

                        <button type="submit" style={styles.submitBtn}>
                            Submit Registration
                        </button>
                    </form>
                ) : (
                    <div style={styles.successState}>
                        <div style={styles.successIcon}>✅</div>
                        <h2 style={{ color: "#064e3b", marginBottom: '10px' }}>Application Submitted!</h2>
                        <p style={{ color: "#64748b", lineHeight: '1.5' }}>
                            The school tie-up coordinator will contact you within 48 hours.
                        </p>
                        <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "25px" }}>
                            Redirecting you back...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "60px 40px", // Increased top padding for breathing room
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "'Inter', sans-serif"
    },
    headerSection: {
        marginBottom: "40px", // More space before the card
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
        padding: 0,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        transition: "opacity 0.2s"
    },
    title: {
        fontSize: "32px",
        color: "#064e3b",
        margin: 0,
        fontWeight: "700",
        letterSpacing: "-0.5px"
    },
    subtitle: {
        color: "#64748b",
        marginTop: "8px",
        fontSize: "16px"
    },
    card: {
        background: "#fff",
        borderRadius: "16px",
        padding: "40px", // Uniform internal padding
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e5e7eb",
        maxWidth: "550px",
        marginTop: "0"
    },
    form: {
        display: "flex",
        flexDirection: "column"
    },
    inputGroup: {
        marginBottom: "24px" // Clean spacing between fields
    },
    label: {
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        marginBottom: "8px",
        color: "#334155"
    },
    input: {
        width: "100%",
        padding: "12px 16px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        boxSizing: "border-box",
        fontSize: "15px",
        color: "#1e293b",
        outline: "none",
        transition: "border-color 0.2s",
        backgroundColor: "#fcfcfc"
    },
    infoBox: {
        background: "#f0fdf4",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #05966930",
        color: "#065f46",
        fontSize: "13px",
        marginBottom: "30px", // Space before the submit button
        lineHeight: "1.6"
    },
    submitBtn: {
        width: "100%",
        padding: "16px",
        background: "#065f46",
        color: "white",
        border: "none",
        borderRadius: "10px",
        fontWeight: "bold",
        cursor: "pointer",
        fontSize: "16px",
        transition: "background 0.2s ease",
        boxShadow: "0 4px 6px -1px rgba(6, 95, 70, 0.2)"
    },
    successState: {
        textAlign: "center",
        padding: "20px 0"
    },
    successIcon: {
        fontSize: "56px",
        marginBottom: "20px"
    }
};