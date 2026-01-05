import React from "react";
import { useNavigate } from "react-router-dom";

export default function Instructions() {
  const navigate = useNavigate();

  const guides = [
    {
      step: "1. Adding a New Child",
      desc: "Click the green '+ Register' button. Type the child's name and birthday. This creates a safe digital folder for the child's health history.",
      icon: "👶"
    },
    {
      step: "2. Understanding Alerts",
      desc: "If you see Red (🚨) or Orange (⚠️), the child needs help! Look at the badge—it will tell you if they need a growth check or a medicine/vaccine.",
      icon: "🆘"
    },
    {
      step: "3. Measuring Growth",
      desc: "Every few months, measure how tall the child is and how much they weigh. Type those numbers in the boxes and click 'Save'. This helps us know they are growing strong.",
      icon: "📏"
    },
    {
      step: "4. Keeping the Home Safe",
      desc: "Whenever a guest, doctor, or official visits the home, type their name in the 'Visitor' box. This keeps a record of who enters for the children's safety.",
      icon: "🖋️"
    },
    {
      step: "5. Sharing Reports",
      desc: "If a government officer asks for information, click 'Export CSV'. This puts all the info into a file you can print or send to them easily.",
      icon: "📠"
    },
    {
      step: "6. Deleting Records",
      desc: "If a child leaves the home, use the 'Delete 🗑️' button to remove their file forever.",
      icon: "🗑️"
    },
    {
      step: "7. Print Data",
      desc: "Click 'Print Full Student List' to save all information into a file for government officers.",
      icon: "📠"
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>Simple Teacher Guide 📖</h1>
          <p style={styles.subtitle}>How to use this app in 7 easy steps</p>
        </header>
        
        <div style={styles.list}>
          {guides.map((g, i) => (
            <div key={i} style={styles.item}>
              <div style={styles.iconBox}>{g.icon}</div>
              <div style={styles.textContent}>
                <h3 style={styles.stepTitle}>{g.step}</h3>
                <p style={styles.stepDesc}>{g.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          OK, I Understand!
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "20px", background: "#f0fdf4", minHeight: "100vh", display: "flex", justifyContent: "center", fontFamily: "Inter, sans-serif" },
  card: { maxWidth: "550px", width: "100%", background: "#fff", borderRadius: "20px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", overflow: "hidden" },
  header: { background: "#065f46", padding: "30px", textAlign: "center", color: "#fff" },
  title: { margin: 0, fontSize: "24px", fontWeight: "800" },
  subtitle: { margin: "5px 0 0 0", opacity: 0.9, fontSize: "14px" },
  list: { padding: "20px" },
  item: { display: "flex", gap: "15px", marginBottom: "20px", alignItems: "start" },
  iconBox: { fontSize: "24px", background: "#ecfdf5", padding: "12px", borderRadius: "50%", minWidth: "50px", textAlign: "center" },
  textContent: { borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", width: "100%" },
  stepTitle: { margin: "0 0 5px 0", fontSize: "18px", color: "#064e3b", fontWeight: "700" },
  stepDesc: { margin: 0, fontSize: "15px", color: "#475569", lineHeight: "1.6" },
  backBtn: { width: "90%", margin: "0 5% 20px 5%", padding: "15px", background: "#065f46", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "16px" }
};