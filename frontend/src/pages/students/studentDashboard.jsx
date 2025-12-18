import React, { useEffect, useState, useRef } from "react";
import Lessons from "./Lessons";
import StudentProgress from "./StudentProgress";
import axios from "axios";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const name = localStorage.getItem("loggedInStudent");
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const loggedIn = students.find((s) => s.name === name);
    if (loggedIn) setStudent(loggedIn);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://127.0.0.1:5000/chat",
        {
          message: userText,
          source: "student_dashboard", // ✅ REQUIRED BY BACKEND
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessages((prev) => [
        ...prev,
        { role: "bot", content: res.data.reply },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "⚠️ Chatbot unavailable. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!student) return <p>Login required</p>;

  return (
    <div className="app-container">
      <h2>Welcome, {student.name}</h2>

      <StudentProgress student={student} />
      <Lessons student={student} />

      {/* 🤖 CHATBOT */}
      <div style={{ marginTop: 30 }}>
        <h3>🤖 Doubt Solver</h3>

        <div
          style={{
            height: 450,
            display: "flex",
            flexDirection: "column",
            border: "1px solid #ccc",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          {/* MESSAGES */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {messages.length === 0 && (
              <p style={{ textAlign: "center", color: "#999" }}>
                Ask your doubts from any subject 📚
              </p>
            )}

            {messages.map((msg, i) => {
              const mathMatch = msg.content.match(/(\d+)\s*([\+x×*])\s*(\d+)/);
              let fingerCount = 0;

              if (mathMatch) {
                const a = parseInt(mathMatch[1]);
                const b = parseInt(mathMatch[3]);
                const op = mathMatch[2];

                if (op === "+" && a + b <= 10) fingerCount = a + b;
                if ((op === "x" || op === "×" || op === "*") && a * b <= 10)
                  fingerCount = a * b;
              }

              const showFingers =
                msg.role === "bot" && fingerCount > 0 && fingerCount <= 10;

              return (
                <div
                  key={i}
                  style={{
                    marginBottom: 14,
                    textAlign: msg.role === "user" ? "right" : "left",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "10px 16px",
                      borderRadius: 20,
                      background:
                        msg.role === "user" ? "#4f46e5" : "#f1f5f9",
                      color: msg.role === "user" ? "#fff" : "#111",
                      maxWidth: "80%",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: msg.content.replace(/\n/g, "<br/>"),
                    }}
                  />

                  {showFingers && (
                    <div style={{ marginTop: 6 }}>
                      {Array.from({ length: fingerCount }).map((_, j) => (
                        <span key={j} style={{ fontSize: 22 }}>
                          ✋
                        </span>
                      ))}
                      <span style={{ marginLeft: 6, fontWeight: "bold" }}>
                        = {fingerCount}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && <p>🤔 Thinking...</p>}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div style={{ display: "flex", padding: 12, gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your question..."
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 20,
                border: "1px solid #ccc",
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                padding: "10px 20px",
                borderRadius: 20,
                border: "none",
                background: "#2563eb",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
