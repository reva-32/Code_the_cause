import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import LiveCounter from "../../components/LiveCounter";
import VisitorAlerts from "../../components/VisitorAlerts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") navigate("/");
    loadAlerts();
  }, [navigate]);

  const loadAlerts = () => {
    const allAlerts = JSON.parse(localStorage.getItem("system_alerts")) || [];
    setInterventions(allAlerts.filter(a => a.status === "pending_admin" || a.status === "pending_guardian"));
  };

  const handleResolve = (alertId, studentName, resolutionType) => {
    const allAlerts = JSON.parse(localStorage.getItem("system_alerts")) || [];
    const currentAlert = allAlerts.find(a => a.id === alertId);
    
    const updatedAlerts = allAlerts.map(a => 
      a.id === alertId ? { ...a, status: "resolved", resolvedAt: new Date().toISOString(), resolution: resolutionType } : a
    );
    localStorage.setItem("system_alerts", JSON.stringify(updatedAlerts));

    let subjectFromIssue = currentAlert?.subject?.toLowerCase() || (currentAlert?.lessonId?.includes("maths") ? "maths" : "science");

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updatedStudents = students.map(s => {
      if (s.name === studentName || s.id === currentAlert?.studentId) {
        return { 
          ...s, 
          activeIntervention: resolutionType === "RESET_ATTEMPTS" ? null : resolutionType, 
          interventionSubject: resolutionType === "RESET_ATTEMPTS" ? null : subjectFromIssue, 
          failAttempts: { ...(s.failAttempts || {}), [currentAlert?.lessonId]: 0 }
        };
      }
      return s;
    });
    
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    alert(`✅ ${resolutionType} applied for ${studentName}`);
    loadAlerts();
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.content}>
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ color: "#1b4332", fontSize: "32px", margin: 0 }}>Welcome, Admin 🌿</h2>
        </div>
        <LiveCounter />
        <div style={styles.alertCard}>
          <h3 style={{ color: "#b91c1c" }}>🚩 Critical Student Interventions</h3>
          {interventions.length === 0 ? (
            <div style={styles.empty}>No pending requests.</div>
          ) : (
            interventions.map(item => (
              <div key={item.id} style={styles.alertItem}>
                <div style={{ flex: 1 }}>
                  <strong>{item.studentName}</strong>
                  <p style={styles.comment}>" {item.comment || "Struggling with topic."} "</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => handleResolve(item.id, item.studentName, "REDUCE_SPEED")} style={{ ...styles.actionBtn, background: "#0891b2" }}>🐢 Slow Video</button>
                  <button onClick={() => handleResolve(item.id, item.studentName, "SIMPLIFY_CONTENT")} style={{ ...styles.actionBtn, background: "#059669" }}>💡 Simplify</button>
                  <button onClick={() => handleResolve(item.id, item.studentName, "RESET_ATTEMPTS")} style={{ ...styles.actionBtn, background: "#4b5563" }}>🔄 Reset</button>
                </div>
              </div>
            ))
          )}
        </div>
        <div style={{ ...styles.alertCard, marginTop: "30px" }}><VisitorAlerts /></div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", background: "#f0fdf4" },
  content: { flex: 1, marginLeft: "260px", padding: "40px" },
  alertCard: { background: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)" },
  alertItem: { padding: "15px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center" },
  comment: { fontSize: "13px", color: "#666", background: "#f8fafc", padding: "8px", borderRadius: "5px" },
  actionBtn: { color: "#fff", border: "none", padding: "10px 15px", borderRadius: "10px", cursor: "pointer", fontSize: "12px" },
  empty: { textAlign: "center", padding: "20px", color: "#64748b" }
};