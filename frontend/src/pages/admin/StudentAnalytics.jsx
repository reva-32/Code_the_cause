import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Sidebar from "../../components/Sidebar";

const COLORS = [
  "#1b4332",
  "#2d6a4f",
  "#40916c",
  "#52b788",
  "#74c69d",
  "#95d5b2",
];

export default function StudentAnalytics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const students = JSON.parse(localStorage.getItem("students")) || [];
    const grouped = {};

    students.forEach((s) => {
      const disability = s.disability || "Normal";
      grouped[disability] = (grouped[disability] || 0) + 1;
    });

    const chartData = Object.keys(grouped).map((k) => ({
      name: k,
      value: grouped[k],
    }));

    setData(chartData);
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0fdf4" }}>
      <Sidebar />

      <div style={{ flex: 1, marginLeft: "260px", padding: "40px" }}>
        <h2 style={{ color: "#1b4332" }}>Student Population Analytics</h2>
        <p style={{ color: "#64748b", marginBottom: "30px" }}>
          Breakdown of students based on learning requirements.
        </p>

        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            width: "500px",
          }}
        >
          {data.length > 0 ? (
            <PieChart width={450} height={350}>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={130}
                label
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : (
            <p>No student data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
