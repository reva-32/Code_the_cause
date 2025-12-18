import React, { useState } from "react";
import { addStudent } from "../data/addStudent";

export default function GuardianAddStudent() {
  const [name, setName] = useState("");
  const [disability, setDisability] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) {
      alert("Enter student name");
      return;
    }

    addStudent({ name, disability });

    alert("Student added successfully!");
    setName("");
    setDisability(false);

    console.log(
      "Students DB:",
      JSON.parse(localStorage.getItem("students"))
    );
  };

  return (
    <div className="card">
      <h3>Add Student</h3>

      <input
        placeholder="Student Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label>
        <input
          type="checkbox"
          checked={disability}
          onChange={(e) => setDisability(e.target.checked)}
        />
        Disability (Blind)
      </label>

      <button onClick={handleAdd}>Add Student</button>
    </div>
  );
}
