import React, { useState, useEffect } from "react";
import { BASELINE_TEST } from "../../data/baselineTests";

export default function PlacementTest({ student, setStudent }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  // Accessibility
  const isBlindStudent =
    student?.disability?.toLowerCase().includes("blind") ||
    student?.disability?.toLowerCase().includes("visual");
  const isADHD = student?.disability?.toLowerCase().includes("adhd");
  const isDeaf = student?.disability?.toLowerCase().includes("deaf");  

  const speak = (text) => {
    if (!isBlindStudent) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (isBlindStudent && !isFinished) {
      speak(
        `Question ${currentStep + 1}: ${
          BASELINE_TEST[currentStep].question
        }`
      );
    }
  }, [currentStep, isBlindStudent, isFinished]);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    if (isBlindStudent) speak(`Selected ${option}`);
  };

  const handleConfirmAnswer = () => {
    const qId = BASELINE_TEST[currentStep].id;
    const updatedAnswers = { ...answers, [qId]: selectedOption };
    setAnswers(updatedAnswers);
    setSelectedOption(null);

    if (currentStep < BASELINE_TEST.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      processFinalResults(updatedAnswers);
    }
  };

  // 🔥 MAIN LOGIC (FIRST WRONG = LEVEL)
  const calculateLevel = (subject, finalAnswers) => {
    const subjectQuestions = BASELINE_TEST
      .filter((q) => q.subject === subject)
      .sort(
        (a, b) =>
          parseInt(a.level.replace("Class ", "")) -
          parseInt(b.level.replace("Class ", ""))
      );

    for (let q of subjectQuestions) {
      if (finalAnswers[q.id] !== q.answer) {
        return q.level; // FIRST WRONG CLASS
      }
    }

    // All correct → highest class
    return subjectQuestions[subjectQuestions.length - 1].level;
  };

  const processFinalResults = (finalAnswers) => {
    const students = JSON.parse(localStorage.getItem("students")) || [];

    const mathsLevel = calculateLevel("maths", finalAnswers);
    const scienceLevel = calculateLevel("science", finalAnswers);

    const updatedStudent = {
      ...student,
      placementDone: true,
      levels: {
        maths: mathsLevel,
        science: scienceLevel,
      },
    };

    const updatedStudents = students.map((s) =>
      s.name === student.name ? updatedStudent : s
    );

    localStorage.setItem("students", JSON.stringify(updatedStudents));
    setStudent(updatedStudent);
    setIsFinished(true);
  };

  // 🎉 FINISH SCREEN
  if (isFinished) {
    return (
      <div style={styles.finishCard}>
        <h2 style={{ fontSize: "2.2rem", color: "#166534" }}>
          Great Work, {student.name}! 🌟
        </h2>

        <div style={styles.summaryBox}>
          <div style={styles.resultLine}>
            <span>Mathematics</span>
            <strong>{student.levels.maths}</strong>
          </div>
          <div style={styles.resultLine}>
            <span>Science</span>
            <strong>{student.levels.science}</strong>
          </div>
        </div>

        <button
          style={{ ...styles.confirmBtn, background: "#22c55e" }}
          onClick={() => window.location.reload()}
        >
          Start My Lessons 🚀
        </button>
      </div>
    );
  }

  const q = BASELINE_TEST[currentStep];
  const progress = ((currentStep + 1) / BASELINE_TEST.length) * 100;

  return (
    <div style={styles.container}>
      <div style={styles.progressContainer}>
        <div style={{ ...styles.progressBar, width: `${progress}%` }} />
      </div>

      <div style={styles.card}>
        <div style={styles.headerRow}>
          <span style={styles.tag}>{q.level}</span>
          <span style={styles.subjectTag}>{q.subject.toUpperCase()}</span>
        </div>

        <h2 style={styles.questionText}>{q.question}</h2>

        <div style={styles.grid}>
          {q.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionSelect(opt)}
              style={{
                ...styles.optionBtn,
                borderColor:
                  selectedOption === opt ? "#6366f1" : "#e5e7eb",
                background:
                  selectedOption === opt ? "#eef2ff" : "#fff",
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <button
          disabled={!selectedOption}
          onClick={handleConfirmAnswer}
          style={{
            ...styles.confirmBtn,
            background: selectedOption ? "#22c55e" : "#cbd5e1",
          }}
        >
          Confirm Answer & Next ➡️
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "600px", margin: "40px auto", padding: "20px" },
  progressContainer: {
    width: "100%",
    height: "12px",
    background: "#e5e7eb",
    borderRadius: "10px",
    marginBottom: "20px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1, #22c55e)",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  headerRow: { display: "flex", gap: "10px", justifyContent: "center" },
  tag: {
    background: "#f1f5f9",
    padding: "4px 12px",
    borderRadius: "10px",
    fontSize: "12px",
  },
  subjectTag: {
    background: "#eff6ff",
    padding: "4px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    color: "#2563eb",
  },
  questionText: { fontSize: "24px", margin: "25px 0" },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  optionBtn: {
    padding: "16px",
    borderRadius: "14px",
    border: "2px solid",
    cursor: "pointer",
    fontWeight: "600",
  },
  confirmBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "16px",
    color: "#fff",
    border: "none",
    borderRadius: "16px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  finishCard: {
    padding: "50px",
    background: "#fff",
    borderRadius: "32px",
    textAlign: "center",
  },
  summaryBox: {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "20px",
    margin: "25px 0",
  },
  resultLine: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
  },
};
