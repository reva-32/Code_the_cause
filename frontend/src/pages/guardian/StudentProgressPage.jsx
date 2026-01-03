import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentProgress from "../students/StudentProgress";

export default function StudentProgressPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const students = JSON.parse(localStorage.getItem("students")) || [];

  const student = students.find((s) => {
    if (!s.name || !id) return false;
    return s.name.trim().toLowerCase() === decodeURIComponent(id).trim().toLowerCase();
  });

  if (!student) {
    return (
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>⬅ Back</button>
        <p>Student not found.</p>
      </div>
    );
  }

  // Fallbacks for data safety
  const processedStudent = {
    ...student,
    levels: student.levels || { maths: "Class 1", science: "Class 1" },
    completedLessons: student.completedLessons || [],
    scores: student.scores || { maths: 0, science: 0 }
  };

  // Logic: Calculate Mastery (Assuming 10 lessons per class for demo)
  const calculateMastery = (subject) => {
    const count = processedStudent.completedLessons.filter(l => l.subject === subject).length;
    return Math.min((count / 10) * 100, 100);
  };

  return (
    <div style={styles.container} className="printable">
      {/* ACTION BAR */}
      <div style={styles.actionBar} className="no-print">
        <button onClick={() => navigate(-1)} style={styles.backBtn}>⬅ Dashboard</button>
        <button onClick={() => window.print()} style={styles.printBtn}>Print Report 🖨️</button>
      </div>

      {/* HEADER SECTION */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>{processedStudent.name}</h1>
          <span style={styles.badge}>{processedStudent.disability.toUpperCase()} MODE</span>
        </div>
        <div style={styles.scoreSummary}>
          <div style={styles.scoreItem}>
            <span style={styles.scoreLabel}>Avg. Score</span>
            <span style={styles.scoreValue}>
              {Math.round((processedStudent.scores.maths + processedStudent.scores.science) / 2)}%
            </span>
          </div>
        </div>
      </div>

      {/* ANALYTICS GRID */}
      <div style={styles.analyticsGrid}>
        {/* Mastery Card */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Subject Mastery</h3>
          <div style={styles.masteryFlex}>
            <MasteryRing label="Maths" percent={calculateMastery('maths')} color="#065f46" />
            <MasteryRing label="Science" percent={calculateMastery('science')} color="#10b981" />
          </div>
        </div>

        {/* Strength & Weakness */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Learning Insights</h3>
          <div style={styles.insightBox}>
            {processedStudent.scores.maths >= processedStudent.scores.science ? (
              <p>🌟 <strong>Strength:</strong> Logic & Calculation (Maths)</p>
            ) : (
              <p>🌟 <strong>Strength:</strong> Discovery & Nature (Science)</p>
            )}
            <p style={{marginTop: '10px', color: '#64748b', fontSize: '13px'}}>
              💡 <em>Suggestion: Practice more Science quizzes to balance the scores.</em>
            </p>
          </div>
        </div>
      </div>

      {/* ORIGINAL PROGRESS BARS */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Detailed Completion</h3>
        <StudentProgress
          student={processedStudent}
          lang="en"
          t={{ maths: "Maths", science: "Science" }}
        />
      </div>

      {/* RECENT ACTIVITY TIMELINE */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Recent Activity</h3>
        {processedStudent.completedLessons.length > 0 ? (
          <div style={styles.timeline}>
            {processedStudent.completedLessons.slice(-3).reverse().map((lesson, idx) => (
              <div key={idx} style={styles.timelineItem}>
                <div style={styles.timelineDot}></div>
                <div>
                  <div style={styles.timelineText}>Completed <strong>{lesson.title}</strong></div>
                  <div style={styles.timelineDate}>{lesson.date || "Just now"}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.emptyText}>No lessons completed yet.</p>
        )}
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .printable { margin: 0 !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}

// Sub-component for the Mastery Circles
const MasteryRing = ({ label, percent, color }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      width: '70px', height: '70px', borderRadius: '50%',
      border: `6px solid #e2e8f0`, borderTop: `6px solid ${color}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 10px', fontWeight: 'bold', fontSize: '14px'
    }}>
      {Math.round(percent)}%
    </div>
    <span style={{ fontSize: '12px', fontWeight: '600', color: '#475569' }}>{label}</span>
  </div>
);

const styles = {
  container: { maxWidth: "900px", margin: "40px auto", padding: "20px", color: "#1e293b" },
  actionBar: { display: "flex", justifyContent: "space-between", marginBottom: "20px" },
  backBtn: { padding: "10px 18px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontWeight: "600" },
  printBtn: { padding: "10px 18px", borderRadius: "10px", border: "none", background: "#065f46", color: "#fff", cursor: "pointer", fontWeight: "600" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px", paddingBottom: "20px", borderBottom: "2px solid #f1f5f9" },
  title: { fontSize: "32px", margin: 0, fontWeight: "800" },
  badge: { display: "inline-block", marginTop: "10px", padding: "4px 12px", borderRadius: "20px", background: "#f1f5f9", fontSize: "12px", fontWeight: "bold", color: "#475569" },
  scoreSummary: { textAlign: "right" },
  scoreLabel: { display: "block", fontSize: "12px", color: "#64748b", fontWeight: "600" },
  scoreValue: { fontSize: "24px", fontWeight: "800", color: "#065f46" },
  analyticsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" },
  card: { background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid #e2e8f0", marginBottom: "20px" },
  cardTitle: { margin: "0 0 20px 0", fontSize: "16px", fontWeight: "700", color: "#475569" },
  masteryFlex: { display: "flex", justifyContent: "space-around" },
  insightBox: { background: "#f8fafc", padding: "15px", borderRadius: "12px", fontSize: "14px" },
  timeline: { display: "flex", flexDirection: "column", gap: "15px" },
  timelineItem: { display: "flex", gap: "15px", alignItems: "flex-start" },
  timelineDot: { width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", marginTop: "5px" },
  timelineText: { fontSize: "14px", color: "#1e293b" },
  timelineDate: { fontSize: "11px", color: "#94a3b8" },
  emptyText: { textAlign: "center", color: "#94a3b8", fontSize: "14px" }
};