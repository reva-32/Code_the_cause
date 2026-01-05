import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentAlertStatus } from "../../utils/healthStorage";

export default function GuardianDashboard() {
  const navigate = useNavigate();

  // Welcome Pop-up State
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => {
    localStorage.setItem("hasSeenWelcome", "true");
    setShowWelcome(false);
  };

  // Data States
  const [students, setStudents] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("students")) || [];
    return saved.sort((a, b) => {
      const aLevel = getStudentAlertStatus(a.name).level;
      const bLevel = getStudentAlertStatus(b.name).level;
      const score = { critical: 2, warning: 1, none: 0 };
      return score[bLevel] - score[aLevel];
    });
  });

  const [visitors, setVisitors] = useState(() => JSON.parse(localStorage.getItem("visitors")) || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [visitorSearch, setVisitorSearch] = useState("");
  const [vitalsUpdate, setVitalsUpdate] = useState({ name: "", h: "", w: "" });
  
  const [visitorName, setVisitorName] = useState("");
  const [visitorPhone, setVisitorPhone] = useState("");
  const [visitorID, setVisitorID] = useState("");
  const [visitorPurpose, setVisitorPurpose] = useState("");

  /* --- SAFEGUARD: ID MASKING --- */
  const maskID = (id) => {
    if (!id || id === "N/A") return "N/A";
    return `XXXX-XXXX-${id.slice(-4)}`; 
  };

  const handleDeleteStudent = (studentName) => {
    const guardiansData = JSON.parse(localStorage.getItem("guardians")) || [];
    const currentUser = JSON.parse(localStorage.getItem("guardianLoggedIn"));
    const account = guardiansData.find(g => g.email === currentUser?.email);
    const savedPassword = account ? account.password : "g";
    
    const userInput = prompt(`To delete ${studentName}, please enter your account password:`);
    if (userInput === null) return;
    if (userInput === savedPassword) {
      const updatedStudents = students.filter(s => s.name !== studentName);
      setStudents(updatedStudents);
      localStorage.setItem("students", JSON.stringify(updatedStudents));
      alert(`${studentName}'s records removed.`);
    } else {
      alert("Incorrect password.");
    }
  };

  /* DATA EXPORT LOGIC */
  const downloadCSV = (content, fileName) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAllStudents = () => {
    if (students.length === 0) return alert("No students to export.");
    const headers = ["Full Name", "Age", "Birth Date", "Disability", "Height", "Weight", "Last Update"];
    const rows = students.map(s => [`"${s.name}"`, s.age, s.dob, `"${s.disability}"`, s.health?.height || "N/A", s.health?.weight || "N/A", s.health?.lastPhysicalUpdate || "N/A"].join(","));
    downloadCSV([headers.join(","), ...rows].join("\n"), `Full_Student_List.csv`);
  };

  const handleExportMedicalData = () => {
    if (students.length === 0) return alert("No data to export.");
    const headers = ["Name", "Disability", "Chronic Illness", "Vitals Status"];
    const rows = students.map(s => [`"${s.name}"`, `"${s.disability}"`, `"${s.health?.chronicIllness || "None"}"`, checkPhysicalStatus(s)].join(","));
    downloadCSV([headers.join(","), ...rows].join("\n"), `Medical_Summary.csv`);
  };

  const handleExportVisitorLogs = () => {
    if (visitors.length === 0) return alert("No logs to export.");
    const headers = ["Visitor Name", "Phone", "ID", "Purpose", "Entry", "Exit"];
    const rows = visitors.map(v => [`"${v.name}"`, `"${v.phone}"`, `"${v.idNum}"`, `"${v.purpose}"`, `"${v.time}"`, `"${v.exitTime || "Inside"}"`].join(","));
    downloadCSV([headers.join(","), ...rows].join("\n"), `Visitor_Logs.csv`);
  };

  const checkPhysicalStatus = (student) => {
    if (!student?.health?.lastPhysicalUpdate) return "MISSING";
    const lastDate = new Date(student.health.lastPhysicalUpdate);
    const diffMonths = (new Date().getFullYear() - lastDate.getFullYear()) * 12 + (new Date().getMonth() - lastDate.getMonth());
    return diffMonths >= 3 ? "OVERDUE" : "OK";
  };

  const handleUpdateVitals = (studentName) => {
    if (!vitalsUpdate.h || !vitalsUpdate.w) return alert("Enter vitals");
    const updated = students.map(s => {
      if (s.name === studentName) {
        return { ...s, health: { ...(s.health || {}), height: parseFloat(vitalsUpdate.h), weight: parseFloat(vitalsUpdate.w), lastPhysicalUpdate: new Date().toISOString() } };
      }
      return s;
    });
    setStudents(updated);
    localStorage.setItem("students", JSON.stringify(updated));
    setVitalsUpdate({ name: "", h: "", w: "" });
  };

  const handleVisitorCheckIn = (e) => {
    e.preventDefault();
    if (!visitorName.trim() || !visitorPurpose.trim()) return alert("Fill Name and Purpose");
    const newV = { 
      id: Date.now(), name: visitorName, phone: visitorPhone, idNum: visitorID || "N/A",
      purpose: visitorPurpose, time: new Date().toLocaleTimeString(), exitTime: null 
    };
    const updatedV = [newV, ...visitors];
    setVisitors(updatedV);
    localStorage.setItem("visitors", JSON.stringify(updatedV));
    setVisitorName(""); setVisitorPhone(""); setVisitorID(""); setVisitorPurpose("");
  };

  const handleVisitorExit = (id) => {
    const updated = visitors.map(v => v.id === id ? { ...v, exitTime: new Date().toLocaleTimeString() } : v);
    setVisitors(updated);
    localStorage.setItem("visitors", JSON.stringify(updated));
  };

  // Student Filter
  const filteredStudents = students.filter(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Visitor Filter (Improved Logic to prevent errors)
  const filteredVisitors = visitors.filter(v => {
    const nameMatch = v.name?.toLowerCase().includes(visitorSearch.toLowerCase());
    const phoneMatch = v.phone?.includes(visitorSearch);
    return nameMatch || phoneMatch;
  });

  return (
    <div style={styles.container}>
      {showWelcome && (
        <div style={styles.overlay}>
          <div style={styles.welcomeModal}>
            <h2 style={{color: "#065f46", marginTop: 0, fontSize: "24px"}}>Welcome, Teacher! 👋</h2>
            <p style={{color: "#475569", lineHeight: "1.5", fontSize: "18px"}}>Manage your student health records efficiently.</p>
            <button onClick={closeWelcome} style={styles.welcomeBtn}>Start Now</button>
          </div>
        </div>
      )}

      <div style={styles.sideHeader}>
        <div>
          <h1 style={styles.mainTitle}>Guardian Dashboard</h1>
          <p style={styles.subtitle}>Management & Oversight Portal</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button style={{ ...styles.logoutBtn, background: "#0ea5e9" }} onClick={() => navigate("/guardian/instructions")}>Guide 📖</button>
          <button style={styles.logoutBtn} onClick={() => navigate("/")}>Logout</button>
        </div>
      </div>

      <div style={styles.grid}>
        <section style={styles.column}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Students & Health</h2>
            <input style={styles.searchInput} placeholder="🔍 Search name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button style={{ ...styles.addBtn, background: "#065f46" }} onClick={() => navigate("/guardian/add-student")}>＋ Register Student Profile</button>
          
          <div style={styles.listContainer}>
            {filteredStudents.map((s) => {
              const healthStatus = checkPhysicalStatus(s);
              return (
                <div key={s.name} style={{...styles.studentCardContainer, borderLeft: getStudentAlertStatus(s.name).level === 'critical' ? '6px solid #ef4444' : '6px solid #065f46'}}>
                  <div style={styles.studentCard}>
                    <div style={{ flex: 1 }}>
                      <h3 style={styles.studentName}>{s.name} <small>({s.age}y)</small></h3>
                      <span style={styles.studentBadge}>{s.disability}</span>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ ...styles.viewBtn, background: "#065f46" }} onClick={() => navigate(`/guardian/medical-profile/${encodeURIComponent(s.name)}`)}>Profile</button>
                      <button style={{ ...styles.viewBtn, background: "#065f46" }} onClick={() => navigate(`/guardian/student/${encodeURIComponent(s.name)}`)}>Reports</button>
                      <button style={{ ...styles.viewBtn, background: "#ef4444" }} onClick={() => handleDeleteStudent(s.name)}>Delete</button>
                    </div>
                  </div>
                  {healthStatus !== "OK" && (
                    <div style={healthStatus === "MISSING" ? styles.missingAlert : styles.overdueAlert}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input placeholder="cm" style={styles.vitalsInput} type="number" onChange={(e) => setVitalsUpdate({ ...vitalsUpdate, name: s.name, h: e.target.value })} />
                        <input placeholder="kg" style={styles.vitalsInput} type="number" onChange={(e) => setVitalsUpdate({ ...vitalsUpdate, name: s.name, w: e.target.value })} />
                        <button style={styles.saveVitalsBtn} onClick={() => handleUpdateVitals(s.name)}>Save</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section style={styles.column}>
          <h2 style={styles.sectionTitle}>Data Management</h2>
          <div style={styles.formCard}>
            <button onClick={handleExportAllStudents} style={{ ...styles.saveBtn, background: "#065f46", width: "100%", marginBottom: "10px" }}>Download Full List 📂</button>
            <button onClick={handleExportMedicalData} style={{ ...styles.saveBtn, background: "#1e293b", width: "100%", marginBottom: "10px" }}>Export Medical 📥</button>
            <button onClick={handleExportVisitorLogs} style={{ ...styles.saveBtn, background: "#1e293b", width: "100%" }}>Export Visitors 📥</button>
          </div>

          <h2 style={styles.sectionTitle}>Visitor Check-In</h2>
          <div style={styles.formCard}>
            <form onSubmit={handleVisitorCheckIn}>
              <input style={styles.visitorInput} placeholder="Visitor Name" value={visitorName} onChange={(e) => setVisitorName(e.target.value)} />
              <input style={styles.visitorInput} placeholder="Phone Number" value={visitorPhone} onChange={(e) => setVisitorPhone(e.target.value)} />
              <input style={styles.visitorInput} placeholder="Gov ID (Aadhar/Voter)" value={visitorID} onChange={(e) => setVisitorID(e.target.value)} />
              <select style={{ ...styles.visitorInput, height: "45px" }} value={visitorPurpose} onChange={(e) => setVisitorPurpose(e.target.value)}>
                <option value="">Select Purpose</option>
                <option value="Medical">Medical Checkup</option>
                <option value="Audit">Government Audit</option>
                <option value="Guardian">Guardian Visit</option>
              </select>
              <button type="submit" style={{ ...styles.saveBtn, width: "100%", background: "#065f46" }}>Log Visitor</button>
            </form>
          </div>

          <h2 style={styles.sectionTitle}>Search Records</h2>
          <input 
            style={{...styles.visitorInput, marginBottom: "10px", border: "2px solid #065f46"}} 
            placeholder="🔍 Search Visitors by Name or Phone..." 
            value={visitorSearch} 
            onChange={(e) => setVisitorSearch(e.target.value)} 
          />

          <div style={styles.listContainer}>
            {filteredVisitors.slice(0, 10).map((v) => (
              <div key={v.id} style={styles.visitorCard}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px" }}>{v.name} ({v.purpose})</p>
                  <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>ID: {maskID(v.idNum)} | In: {v.time}</p>
                  {v.exitTime && <p style={{ margin: 0, fontSize: "14px", color: "#ef4444", fontWeight: "bold" }}>Out: {v.exitTime}</p>}
                </div>
                {!v.exitTime && (
                  <button onClick={() => handleVisitorExit(v.id)} style={styles.exitBtn}>Mark Exit 🚪</button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "1250px", margin: "0 auto", padding: "30px", fontFamily: "Inter, sans-serif" },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 },
  welcomeModal: { background: "#fff", padding: "40px", borderRadius: "20px", maxWidth: "450px", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.2)" },
  welcomeBtn: { width: "100%", padding: "14px", background: "#065f46", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "18px" },
  sideHeader: { display: "flex", justifyContent: "space-between", marginBottom: "35px", borderLeft: "6px solid #065f46", paddingLeft: "20px" },
  mainTitle: { fontSize: "32px", fontWeight: "800", color: "#064e3b", margin: 0 },
  subtitle: { color: "#64748b", margin: 0, fontSize: "18px" },
  logoutBtn: { padding: "12px 24px", background: "#065f46", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "16px" },
  grid: { display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "35px" },
  column: { display: "flex", flexDirection: "column", gap: "20px" },
  sectionTitle: { fontSize: "22px", fontWeight: "700", color: "#1e293b" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  searchInput: { padding: "10px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "16px" },
  addBtn: { color: "#fff", border: "none", padding: "14px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "17px" },
  studentCardContainer: { borderRadius: "12px", background: "#fff", marginBottom: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", border: "1px solid #eee", overflow: "hidden" },
  studentCard: { padding: "15px 20px", display: "flex", alignItems: "center" },
  studentName: { margin: 0, fontSize: "20px" },
  studentBadge: { fontSize: "12px", background: "#ecfdf5", color: "#065f46", padding: "3px 8px", borderRadius: "4px", fontWeight: "bold" },
  viewBtn: { color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: "600" },
  missingAlert: { background: "#fff7ed", padding: "15px" },
  overdueAlert: { background: "#fef2f2", padding: "15px" },
  vitalsInput: { width: "70px", padding: "8px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "16px" },
  saveVitalsBtn: { background: "#065f46", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "14px" },
  formCard: { background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #eee" },
  saveBtn: { color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "16px" },
  visitorInput: { width: "100%", padding: "12px", marginBottom: "10px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box", fontSize: "16px" },
  visitorCard: { background: "#f8fafc", padding: "15px", borderRadius: "10px", display: "flex", alignItems: "center", marginBottom: "8px", border: "1px solid #e2e8f0" },
  exitBtn: { background: "#fff", border: "1px solid #ef4444", color: "#ef4444", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }
};