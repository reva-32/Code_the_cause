import React, { useState } from "react";
import { lessons } from "../../data/lessons";
import { useNavigate } from "react-router-dom";

export default function Lessons({ student }) {
  const [subject, setSubject] = useState("maths");
  const navigate = useNavigate();

  const eligibleLessons = lessons.filter(
    (l) =>
      l.subject === subject &&
      l.class === student.levels[subject]
  );

  return (
    <div className="card">
      <h3>📘 Lessons</h3>

      <select onChange={(e) => setSubject(e.target.value)}>
        <option value="maths">Maths</option>
        <option value="science">Science</option>
      </select>

      {eligibleLessons.map((lesson, index) => {
        const unlocked =
          index === 0 ||
          student.completedLessons.includes(
            eligibleLessons[index - 1]?.id
          );

        return (
          <div key={lesson.id} className="card">
            <h4>{lesson.title}</h4>

            {unlocked ? (
              <>
                {student.disability ? (
                  <audio controls src={lesson.audio} />
                ) : (
                  <iframe
                    width="100%"
                    height="250"
                    src={`https://www.youtube.com/embed/${lesson.videoId}`}
                    allowFullScreen
                  />
                )}

                <button
                  className="primary-btn"
                  onClick={() =>
                    navigate(`/student/test/${lesson.id}`)
                  }
                >
                  Take Test 📝
                </button>
              </>
            ) : (
              <button disabled>🔒 Locked</button>
            )}
          </div>
        );
      })}
    </div>
  );
}
