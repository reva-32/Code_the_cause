import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TOPIC_TEST, evaluateTopicTest } from "../../data/topicTests";

export default function TopicTest() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [student, setStudent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [currentSubject, setCurrentSubject] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const loggedIn = students.find((s) => s.name === name);

    // Get subject from state or URL
    let sub = location.state?.subject || (lessonId && lessonId.includes("maths") ? "maths" : "science");
    
    if (!loggedIn) return;

    setStudent(loggedIn);
    setCurrentSubject(sub);

    const userLevel = loggedIn.levels[sub];
    // Find test matching subject and level
    const testData = TOPIC_TEST.find(
      (t) =>
        t.subject.toLowerCase() === sub.toLowerCase() &&
        t.level.replace(/\s/g, "") === userLevel.replace(/\s/g, "")
    );

    if (testData) setQuestions(testData.questions);
  }, [lessonId, location.state]);

  const handleSubmit = () => {
    const result = evaluateTopicTest(questions, answers);
    setScore(result);

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const updatedStudent = { ...student };

    if (result >= 90) {
      // PROMOTION LOGIC: "Class 1" -> "Class 2"
      const currentLevelStr = student.levels[currentSubject]; // e.g., "Class 1"
      const match = currentLevelStr.match(/\d+/);
      
      if (match) {
        const currentNum = parseInt(match[0]);
        const nextLevelStr = `Class ${currentNum + 1}`;
        
        updatedStudent.levels[currentSubject] = nextLevelStr;
        console.log(`Promoted to ${nextLevelStr}`);
      }
    }

    // Save to LocalStorage
    const newStudentList = students.map(s => s.name === student.name ? updatedStudent : s);
    localStorage.setItem("students", JSON.stringify(newStudentList));
    
    setStudent(updatedStudent);
    setSubmitted(true);
  };

  if (!student) return <div style={{padding: "20px"}}>Loading student data...</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "12px", background: "#fff" }}>
      {!submitted ? (
        <>
          <h2>{currentSubject.toUpperCase()} Test - {student.levels[currentSubject]}</h2>
          <hr />
          {questions.length > 0 ? (
            questions.map((q, idx) => (
              <div key={idx} style={{ marginBottom: "20px" }}>
                <p><strong>{idx + 1}. {q.question}</strong></p>
                {q.options.map(opt => (
                  <label key={opt} style={{ display: "block", margin: "5px 0" }}>
                    <input type="radio" name={`q${idx}`} onChange={() => setAnswers({...answers, [idx]: opt})} /> {opt}
                  </label>
                ))}
              </div>
            ))
          ) : (
            <p>No questions found for this level.</p>
          )}
          <button onClick={handleSubmit} style={{ width: "100%", padding: "10px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px" }}>Submit</button>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <h1>Score: {score}%</h1>
          <p>{score >= 90 ? "🎉 Level Up! You've been promoted." : "Try again to reach Class 2!"}</p>
          <button onClick={() => navigate("/student/dashboard")} style={{ padding: "10px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: "8px" }}>Return to Dashboard</button>
        </div>
      )}
    </div>
  );
}