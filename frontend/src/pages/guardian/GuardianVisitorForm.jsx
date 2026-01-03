import React, { useState } from "react";

export default function GuardianVisitorForm() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    purpose: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.phone) {
      alert("Enter visitor name and phone");
      return;
    }

    const visitors =
      JSON.parse(localStorage.getItem("visitors")) || [];

    const newEntry = {
      ...form,
      time: new Date().toLocaleString(),
    };

    localStorage.setItem(
      "visitors",
      JSON.stringify([...visitors, newEntry])
    );

    alert("Visitor logged successfully ✅");

    setForm({ name: "", phone: "", purpose: "" });
  };

  return (
    <div style={card}>
      <h3>Visitor Entry 🚶</h3>

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          name="name"
          placeholder="Visitor Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          name="purpose"
          placeholder="Purpose of Visit"
          value={form.purpose}
          onChange={handleChange}
        />

        <button type="submit">Save Visitor</button>
      </form>
    </div>
  );
}

const card = {
  background: "#fff",
  padding: "20px",
  borderRadius: "14px",
  marginTop: "20px",
  boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};
