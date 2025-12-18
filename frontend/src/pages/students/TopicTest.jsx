import React, { useState, useEffect } from "react";
import { BASELINE_TEST } from "../../data/baselineTests";

export default function TopicTest() {
  const [selectedTopic, setSelectedTopic] = useState(""); // Topic selected by user
  const [questions, setQuestions] = useState([]);

  // Update questions when selectedTopic changes
  useEffect(() => {
    if (!selectedTopic) {
      setQuestions([]);
      return;
    }

    const filteredQuestions = BASELINE_TEST.filter(
      (q) => (q.topic || "").toLowerCase() === selectedTopic.toLowerCase()
    );

    setQuestions(filteredQuestions);
  }, [selectedTopic]);

  if (!BASELINE_TEST || BASELINE_TEST.length === 0) {
    return <p>No questions available.</p>;
  }

  return (
    <div className="topic-test">
      <h2>Take a Topic Test</h2>

      <label htmlFor="topicSelect">Select Topic:</label>
      <select
        id="topicSelect"
        value={selectedTopic}
        onChange={(e) => setSelectedTopic(e.target.value)}
      >
        <option value="">--Select--</option>
        {BASELINE_TEST.map((q, idx) =>
          q.topic ? (
            <option key={idx} value={q.topic}>
              {q.topic}
            </option>
          ) : null
        )}
      </select>

      {questions.length > 0 ? (
        <div className="questions">
          {questions.map((q) => (
            <div key={q.id} className="question-card">
              <p>{q.question}</p>
              {q.options?.map((opt) => (
                <label key={opt}>
                  <input type="radio" name={q.id} value={opt} /> {opt}
                </label>
              ))}
            </div>
          ))}
        </div>
      ) : selectedTopic ? (
        <p>No questions found for this topic.</p>
      ) : null}
    </div>
  );
}
