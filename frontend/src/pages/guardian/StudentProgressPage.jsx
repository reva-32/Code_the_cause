import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lessons } from "../../data/lessons";

export default function StudentProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reportForm, setReportForm] = useState({ issue: "video_fast", comment: "" });

  // 1. DATA LOADING
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const alerts = JSON.parse(localStorage.getItem("system_alerts")) || [];
  
  const student = students.find((s) => s.name.trim().toLowerCase() === decodeURIComponent(id).trim().toLowerCase());

  if (!student) return <div style={styles.container}><button onClick={() => navigate(-1)}>Back</button><p>Student not found.</p></div>;

  const activeAlert = alerts.find(a => a.studentName === student.name && a.status === "pending_guardian");

  // 2. DATA PROCESSING & DEFAULTS
  const processedStudent = {
    ...student,
    levels: student.levels || { maths: "Class 1", science: "Class 1" },
    completedLessons: student.completedLessons || [],
    verifiedSummaries: student.verifiedSummaries || [],
    scores: student.scores || {},
    adaptiveModes: student.adaptiveModes || { maths: "Standard Adaptive", science: "Standard Adaptive" }
  };

  // Logic for Mastery Rings (Current Lesson Status)
  const calculateCurrentLessonMastery = (subject) => {
    const level = processedStudent.levels[subject];
    const subjectLessons = lessons.filter(l => l.subject === subject && (l.class === level || l.classLevel === level));
    const current = subjectLessons.find(l => !processedStudent.completedLessons.includes(l.id));
    
    if (!current) return 100; 
    if (processedStudent.verifiedSummaries.includes(current.id)) return 50;
    return 0;
  };

  const mathsMastery = calculateCurrentLessonMastery('maths');
  const scienceMastery = calculateCurrentLessonMastery('science');

  // Map completed IDs to detailed lesson info
  const completedDetails = processedStudent.completedLessons.map(id => {
    const lessonInfo = lessons.find(l => l.id === id);
    return {
      id: id,
      title: lessonInfo ? lessonInfo.title : "Unknown Lesson",
      subject: lessonInfo ? lessonInfo.subject : "N/A",
      score: processedStudent.scores[id] || 100 
    };
  });

  // 3. ACTION HANDLERS
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

  return (
    <div style={styles.container} className="printable">
      {/* ACTION BAR */}
      <div style={styles.actionBar} className="no-print">
        <button onClick={() => navigate(-1)} style={styles.backBtn}>⬅ Back to Dashboard</button>
        <button onClick={() => window.print()} style={styles.printBtn}>Print Detailed Report 🖨️</button>
      </div>

      {/* INTERVENTION CARD (Only if alert exists) */}
      {activeAlert && (
        <div style={styles.interventionCard} className="no-print">
          <div style={{ display: "flex", gap: "15px", alignItems: "center", marginBottom: "15px" }}>
            <span style={{ fontSize: "30px" }}>🚩</span>
            <div>
              <h2 style={{ color: "#b91c1c", margin: 0 }}>Intervention Required</h2>
              <p style={{ margin: 0, color: "#7f1d1d", fontSize: "14px" }}>{student.name} is struggling with the current topic.</p>
            </div>
          </div>
          <label style={styles.label}>Main Difficulty:</label>
          <select style={styles.input} value={reportForm.issue} onChange={(e) => setReportForm({...reportForm, issue: e.target.value})}>
            <option value="video_fast">Video speed is too fast</option>
            <option value="high_difficulty">Questions are too complex</option>
            <option value="visual_clutter">Too much visual distraction</option>
          </select>
          <textarea 
            placeholder="Describe the child's reaction..." 
            style={{ ...styles.input, height: "60px", marginTop: "10px" }}
            onChange={(e) => setReportForm({...reportForm, comment: e.target.value})}
          />
          <button onClick={handleSendToAdmin} style={styles.submitAlertBtn}>Request Admin Adjustment</button>
        </div>
      )}

      {/* PROFILE HEADER */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{processedStudent.name}</h1>
          <span style={styles.badge}>{processedStudent.disability?.toUpperCase() || "GENERAL"} MODE</span>
        </div>
      </div>

      {/* ANALYTICS GRID */}
      <div style={styles.analyticsGrid}>
        {/* CURRENT STATUS RING */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Ongoing Lesson Status</h3>
          <div style={styles.masteryFlex}>
            <MasteryRing label="Maths (Current)" percent={mathsMastery} color="#4f46e5" />
            <MasteryRing label="Science (Current)" percent={scienceMastery} color="#10b981" />
          </div>
        </div>

        {/* UPDATED LEARNING PROFILE: SUBJECT-WISE BREAKDOWN */}
        <div style={styles.card}>
           <h3 style={styles.cardTitle}>Learning Profile</h3>
           <div style={styles.profileGrid}>
              {/* Mathematics Profile */}
              <div style={styles.insightBox}>
                <div style={styles.subjectTag}>MATHEMATICS</div>
                <p style={styles.profileText}>📍 <strong>Grade Level:</strong> {processedStudent.levels.maths}</p>
                <p style={styles.profileText}>⚡ <strong>Mode:</strong> {processedStudent.adaptiveModes.maths} Active</p>
              </div>

              {/* Science Profile */}
              <div style={styles.insightBox}>
                <div style={{...styles.subjectTag, background: '#ecfdf5', color: '#047857'}}>SCIENCE</div>
                <p style={styles.profileText}>📍 <strong>Grade Level:</strong> {processedStudent.levels.science}</p>
                <p style={styles.profileText}>⚡ <strong>Mode:</strong> {processedStudent.adaptiveModes.science} Active</p>
              </div>
           </div>
        </div>
      </div>

      {/* RECENT ACTIVITY TABLE */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Recent Activity & Test Scores</h3>
        {completedDetails.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Lesson Name</th>
                <th style={styles.th}>Topic Test Score</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {completedDetails.map((item, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.td}>{item.subject.toUpperCase()}</td>
                  <td style={styles.td}><strong>{item.title}</strong></td>
                  <td style={styles.td}>
                    <span style={{ color: item.score >= 80 ? '#16a34a' : '#ca8a04', fontWeight: 'bold' }}>
                      {item.score}%
                    </span>
                  </td>
                  <td style={styles.td}><span style={styles.completeTag}>Completed</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No lessons completed yet.</p>
        )}
      </div>
    </div>
  );
}

const MasteryRing = ({ label, percent, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ 
      width: '75px', height: '75px', borderRadius: '50%', border: `6px solid #f1f5f9`, 
      borderTop: `6px solid ${color}`, borderRight: percent >= 50 ? `6px solid ${color}` : '6px solid #f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', 
      fontWeight: 'bold', transform: 'rotate(-45deg)'
    }}>
      <span style={{ transform: 'rotate(45deg)', fontSize: '14px' }}>{percent}%</span>
    </div>
    <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>{label}</span>
  </div>
);

const styles = {
  container: { maxWidth: "1100px", margin: "40px auto", padding: "20px", fontFamily: "Inter, sans-serif", color: '#1e293b' },
  actionBar: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  backBtn: { padding: "10px 20px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: "600" },
  printBtn: { padding: "10px 20px", borderRadius: "10px", border: "none", background: "#1b4332", color: "#fff", cursor: "pointer", fontWeight: "600" },
  interventionCard: { background: "#fff1f1", border: "1px solid #fecaca", padding: "20px", borderRadius: "20px", marginBottom: "30px" },
  label: { display: "block", marginBottom: "8px", fontWeight: "600", color: "#475569", fontSize: "14px" },
  input: { width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #fca5a5", outline: "none" },
  submitAlertBtn: { background: "#b91c1c", color: "white", width: "100%", padding: "12px", border: "none", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", background: "#fff", padding: "30px", borderRadius: "20px", border: "1px solid #e2e8f0", boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },
  title: { fontSize: "32px", margin: 0, color: "#0f172a" },
  badge: { padding: "6px 15px", background: "#f1f5f9", color: "#475569", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", marginTop: "8px", display: "inline-block" },
  analyticsGrid: { display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "25px", marginBottom: "25px" },
  card: { background: "#fff", padding: "25px", borderRadius: "24px", border: "1px solid #e2e8f0", boxShadow: '0 2px 10px rgba(0,0,0,0.02)' },
  cardTitle: { margin: "0 0 20px 0", fontSize: "13px", fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: '0.05em' },
  masteryFlex: { display: "flex", justifyContent: "space-around", paddingTop: '10px' },
  profileGrid: { display: 'flex', flexDirection: 'column', gap: '15px' },
  insightBox: { background: "#f8fafc", padding: "15px", borderRadius: "18px", border: "1px solid #f1f5f9" },
  subjectTag: { display: 'inline-block', fontSize: '10px', fontWeight: '900', background: '#eef2ff', color: '#4338ca', padding: '3px 8px', borderRadius: '6px', marginBottom: '10px' },
  profileText: { margin: '4px 0', fontSize: '14px', color: '#334155' },
  scoreValue: { fontSize: "36px", fontWeight: "900", color: "#059669", display: "block", textAlign: 'right' },
  scoreLabel: { fontSize: "11px", color: "#64748b", fontWeight: "bold", textTransform: 'uppercase' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  tableHeader: { textAlign: 'left', borderBottom: '2px solid #f1f5f9' },
  th: { padding: '12px', fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' },
  td: { padding: '15px 12px', fontSize: '14px', borderBottom: '1px solid #f8fafc' },
  completeTag: { background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }
};