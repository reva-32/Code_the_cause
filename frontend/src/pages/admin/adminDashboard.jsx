import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import LiveCounter from "../../components/LiveCounter";
import VisitorAlerts from "../../components/VisitorAlerts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState([]);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") navigate("/");
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

    // Improved Subject Detection Logic
    let subjectFromIssue = "all";
    if (currentAlert?.subject) {
      subjectFromIssue = currentAlert.subject.toLowerCase();
    } else if (currentAlert?.issue && currentAlert.issue.includes('_')) {
      subjectFromIssue = currentAlert.issue.split('_')[0].toLowerCase();
    } else if (currentAlert?.lessonId) {
      subjectFromIssue = currentAlert.lessonId.includes("maths") ? "maths" : "science";
    }

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updatedStudents = students.map(s => {
      if (s.name === studentName || s.id === currentAlert?.studentId) {
        return { 
          ...s, 
          activeIntervention: resolutionType, 
          interventionSubject: subjectFromIssue, 
          failAttempts: {
            ...(s.failAttempts || {}),
            [currentAlert?.lessonId || subjectFromIssue]: 0 
          }
        };
      }
      return s;
    });
    
    localStorage.setItem("students", JSON.stringify(updatedStudents));
    alert(`✅ Action Applied: ${resolutionType} for ${studentName} (${subjectFromIssue})`);
    loadAlerts();
  };

  return (
    <div style={styles.container}>
      <style>{`
        body { margin: 0; padding: 0; overflow-x: hidden; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <Sidebar />

      <div style={styles.content}>
        <div style={{ marginBottom: "30px" }}>
          <h2 style={{ color: "#1b4332", fontSize: "32px", margin: 0 }}>Welcome, Admin 🌿</h2>
          <p style={{ color: "#64748b" }}>Real-time overview of network health and student interventions.</p>
        </div>
        
        <LiveCounter />

        <div style={styles.alertCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ color: "#b91c1c", margin: 0 }}>🚩 Critical Student Interventions</h3>
            <span style={{ fontSize: "13px", color: "#64748b" }}>{interventions.length} Pending Requests</span>
          </div>

          {interventions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", borderRadius: "12px" }}>
              <p style={{ fontSize: "30px", margin: "0 0 10px 0" }}>✅</p>
              <p style={{ color: "#64748b", margin: 0 }}>No urgent requests from guardians at the moment.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {interventions.map(item => (
                <div key={item.id} style={styles.alertItem}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <strong style={{ fontSize: "18px", color: "#1e293b" }}>{item.studentName}</strong>
                      <span style={styles.issueBadge}>{item.issue?.replace("_", " ")}</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#475569", marginTop: "8px", fontStyle: "italic", background: "#f1f5f9", padding: "10px", borderRadius: "8px" }}>
                      " {item.comment || "Student is struggling with this topic."} "
                    </p>
                  </div>
                  
                  <div style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
                    <button 
                      onClick={() => handleResolve(item.id, item.studentName, "REDUCE_SPEED")}
                      style={{ ...styles.actionBtn, background: "#0891b2" }}
                    >
                      🐢 Slow Video
                    </button>
                    <button 
                      onClick={() => handleResolve(item.id, item.studentName, "SIMPLIFY_CONTENT")}
                      style={{ ...styles.actionBtn, background: "#059669" }}
                    >
                      💡 Simplify
                    </button>
                    <button 
                      onClick={() => handleResolve(item.id, item.studentName, "RESET_ATTEMPTS")}
                      style={{ ...styles.actionBtn, background: "#4b5563" }}
                    >
                      🔄 Reset
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ ...styles.alertCard, marginTop: "30px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ color: "#1b4332", marginBottom: "20px" }}>Recent Visitor Alerts</h3>
          <VisitorAlerts />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", width: "100vw", background: "#f0fdf4" },
  content: { flex: 1, marginLeft: "260px", padding: "40px", overflowY: "auto" },
  alertCard: { background: "white", padding: "30px", borderRadius: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" },
  alertItem: { padding: "20px", borderRadius: "16px", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "fadeIn 0.4s ease-out" },
  issueBadge: { padding: "4px 12px", background: "#fee2e2", color: "#b91c1c", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" },
  actionBtn: { color: "#fff", border: "none", padding: "12px 18px", borderRadius: "12px", cursor: "pointer", fontWeight: "600", fontSize: "13px", transition: "all 0.2s ease", display: "flex", alignItems: "center", gap: "5px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }
};