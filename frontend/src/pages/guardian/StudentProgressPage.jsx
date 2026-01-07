import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentProgress from "../students/StudentProgress";

export default function StudentProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reportForm, setReportForm] = useState({ issue: "video_fast", comment: "" });

  const students = JSON.parse(localStorage.getItem("students")) || [];
  const alerts = JSON.parse(localStorage.getItem("system_alerts")) || [];
  
  const student = students.find((s) => s.name.trim().toLowerCase() === decodeURIComponent(id).trim().toLowerCase());

  if (!student) return <div style={styles.container}><button onClick={() => navigate(-1)}>Back</button><p>Student not found.</p></div>;

  const activeAlert = alerts.find(a => a.studentName === student.name && a.status === "pending_guardian");

  const handleSendToAdmin = () => {
    if (!reportForm.comment) {
      alert("Please provide a small comment to help the admin understand the situation.");
      return;
    }
    const updatedAlerts = alerts.map(a => 
      a.id === activeAlert.id ? { ...a, status: "pending_admin", issue: reportForm.issue, comment: reportForm.comment } : a
    );
    localStorage.setItem("system_alerts", JSON.stringify(updatedAlerts));
    alert("Help Request sent to Admin. They will adjust the learning settings shortly.");
    navigate("/guardian/dashboard"); 
  };

  const processedStudent = {
    ...student,
    levels: student.levels || { maths: "Class 1", science: "Class 1" },
    completedLessons: student.completedLessons || [],
    scores: student.scores || { maths: 0, science: 0 }
  };

  const calculateMastery = (subject) => {
    const count = (processedStudent.completedLessons || []).filter(l => l.subject === subject).length;
    return Math.min((count / 10) * 100, 100);
  };

  return (
    <div style={styles.container} className="printable">
      <div style={styles.actionBar} className="no-print">
        <button onClick={() => navigate(-1)} style={styles.backBtn}>⬅ Back to List</button>
        <button onClick={() => window.print()} style={styles.printBtn}>Print Progress Report 🖨️</button>
      </div>

      {activeAlert && (
        <div style={styles.interventionCard} className="no-print">
          <div style={{ display: "flex", gap: "15px", alignItems: "center", marginBottom: "15px" }}>
            <span style={{ fontSize: "30px" }}>🚩</span>
            <div>
              <h2 style={{ color: "#b91c1c", margin: 0 }}>Intervention Required</h2>
              <p style={{ margin: 0, color: "#7f1d1d", fontSize: "14px" }}>
                {student.name} is struggling with the current topic. Adjust settings below.
              </p>
            </div>
          </div>
          
          <label style={styles.label}>What is the main difficulty?</label>
          <select style={styles.input} value={reportForm.issue} onChange={(e) => setReportForm({...reportForm, issue: e.target.value})}>
            <option value="video_fast">Video/Audio speed is too fast</option>
            <option value="high_difficulty">Questions are too complex</option>
            <option value="visual_clutter">Too many colors/distractions (ADHD)</option>
            <option value="audio_unclear">Pronunciation is hard to follow</option>
            <option value="lack_of_interest">Student is not engaging with topic</option>
          </select>

          <label style={{ ...styles.label, marginTop: "15px" }}>Describe the child's reaction:</label>
          <textarea 
            placeholder="e.g., He gets frustrated during the addition quiz..." 
            style={{ ...styles.input, height: "80px" }}
            onChange={(e) => setReportForm({...reportForm, comment: e.target.value})}
          />
          
          <button onClick={handleSendToAdmin} style={styles.submitAlertBtn}>
            Request Admin Adjustment
          </button>
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{processedStudent.name}</h1>
          <span style={styles.badge}>{processedStudent.disability.toUpperCase()} MODE</span>
        </div>
        <div style={styles.scoreSummary}>
           <span style={styles.scoreLabel}>Total Mastery</span>
           <span style={styles.scoreValue}>{Math.round((calculateMastery('maths') + calculateMastery('science')) / 2)}%</span>
        </div>
      </div>

      <div style={styles.analyticsGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Subject Mastery</h3>
          <div style={styles.masteryFlex}>
            <MasteryRing label="Maths" percent={calculateMastery('maths')} color="#065f46" />
            <MasteryRing label="Science" percent={calculateMastery('science')} color="#10b981" />
          </div>
        </div>
        <div style={styles.card}>
           <h3 style={styles.cardTitle}>Learning Profile</h3>
           <div style={styles.insightBox}>
             <p>📍 <strong>Grade Level:</strong> {processedStudent.levels.maths}</p>
             <p style={{marginTop: '10px', color: '#64748b', fontSize: '13px'}}>
               {processedStudent.activeIntervention 
                 ? `✅ Active Fix: ${processedStudent.activeIntervention.replace('_', ' ')}` 
                 : "⚡ Standard Adaptive Mode Active"}
             </p>
           </div>
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Recent Activity</h3>
        <StudentProgress student={processedStudent} />
      </div>
    </div>
  );
}

const MasteryRing = ({ label, percent, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ width: '75px', height: '75px', borderRadius: '50%', border: `6px solid #f1f5f9`, borderTop: `6px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', fontWeight: 'bold', fontSize: '18px' }}>
      {Math.round(percent)}%
    </div>
    <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{label}</span>
  </div>
);

const styles = {
  container: { maxWidth: "1000px", margin: "40px auto", padding: "20px", fontFamily: "Inter, sans-serif" },
  actionBar: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  backBtn: { padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: "600" },
  printBtn: { padding: "10px 20px", borderRadius: "10px", border: "none", background: "#1b4332", color: "#fff", cursor: "pointer", fontWeight: "600" },
  interventionCard: { background: "#fff1f1", border: "1px solid #fecaca", padding: "25px", borderRadius: "20px", marginBottom: "30px", boxShadow: "0 4px 15px rgba(220, 38, 38, 0.1)" },
  label: { display: "block", marginBottom: "8px", fontWeight: "600", color: "#475569", fontSize: "14px" },
  input: { width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #fca5a5", outline: "none", boxSizing: "border-box" },
  submitAlertBtn: { background: "#b91c1c", color: "white", width: "100%", padding: "14px", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", marginTop: "15px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", background: "#fff", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0" },
  title: { fontSize: "32px", margin: 0, color: "#1e293b" },
  badge: { padding: "6px 15px", background: "#f1f5f9", color: "#475569", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", marginTop: "8px", display: "inline-block" },
  analyticsGrid: { display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "25px", marginBottom: "25px" },
  card: { background: "#fff", padding: "30px", borderRadius: "24px", border: "1px solid #e2e8f0" },
  cardTitle: { margin: "0 0 25px 0", fontSize: "16px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px" },
  masteryFlex: { display: "flex", justifyContent: "space-around" },
  insightBox: { background: "#f8fafc", padding: "20px", borderRadius: "15px", border: "1px dashed #cbd5e1" },
  scoreValue: { fontSize: "36px", fontWeight: "900", color: "#1b4332", display: "block" },
  scoreLabel: { fontSize: "12px", color: "#64748b", fontWeight: "bold" }
};