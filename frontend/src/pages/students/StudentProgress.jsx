import React from "react";

export default function StudentProgress({ student }) {
  return (
    <div className="card">
      <h3>Progress 📊</h3>
      <p>Maths: {student.scores.maths || 0}%</p>
      <p>Science: {student.scores.science || 0}%</p>

      <p>Maths Level: {student.levels.maths}</p>
      <p>Science Level: {student.levels.science}</p>

      <p>
        Completed Lessons:{" "}
        {student.completedLessons.length > 0
          ? student.completedLessons.join(", ")
          : "None"}
      </p>
    </div>
  );
}
