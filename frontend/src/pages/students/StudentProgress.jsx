import React from "react";

export default function StudentProgress({ student }) {
  return (
    <div className="card">
      <h3>Progress & Scores 📊</h3>

      <p>
        Maths Score: {student.scores.maths}%
      </p>
      <p>
        Science Score: {student.scores.science}%
      </p>

      <p>
        Current Level (Maths): {student.classLevel.maths}
      </p>
      <p>
        Current Level (Science): {student.classLevel.science}
      </p>
    </div>
  );
}
