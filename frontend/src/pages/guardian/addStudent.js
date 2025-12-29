import React, { useState } from "react";
import { addStudent } from "../data/addStudent";

export default function GuardianAddStudent() {
  const [name, setName] = useState("");
  const [disability, setDisability] = useState("none");

  const handleAdd = () => {
    if (!name.trim()) {
      alert("Enter student name");
      return;
    }

    addStudent({
      name,
      disability, // none | blind | deaf | adhd
    });

    alert("Student added successfully!");
    setName("");
    setDisability("none");

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

      <label style={{ display: "block", marginTop: "12px" }}>
        Disability Category
      </label>

      <select
        value={disability}
        onChange={(e) => setDisability(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginTop: "6px",
          borderRadius: "6px",
        }}
      >
        <option value="none">None</option>
        <option value="blind">Blind (Audio Required)</option>
        <option value="deaf">Deaf (Text Only)</option>
        <option value="adhd">ADHD (Focus Mode)</option>
      </select>

      <button style={{ marginTop: "16px" }} onClick={handleAdd}>
        Add Student
      </button>
    </div>
  );
}
