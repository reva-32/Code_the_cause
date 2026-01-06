import React from "react";

export default function FiltersBar({ filters, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value });
  };

  // Inline Styles
  const containerStyle = {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    background: "white",
    padding: "15px 20px",
    borderRadius: "15px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
    marginBottom: "25px",
    flexWrap: "wrap"
  };

  const selectStyle = {
    padding: "10px 15px",
    borderRadius: "10px",
    border: "1px solid #d1fae5",
    background: "#f9fafb",
    color: "#1b4332",
    fontSize: "14px",
    fontWeight: "500",
    outline: "none",
    cursor: "pointer",
    minWidth: "160px",
    transition: "0.2s all"
  };

  const resetBtnStyle = {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#fecaca", // Soft red
    color: "#991b1b",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
    transition: "0.2s"
  };

  return (
    <div style={containerStyle}>
      <span style={{ color: "#64748b", fontWeight: "600", fontSize: "14px", marginRight: "5px" }}>
        Filter by:
      </span>
      <select 
        style={selectStyle} 
        name="state" 
        value={filters.state || ""} 
        onChange={handleChange}
      >
        <option value="">All States</option>
        <option value="MH">Maharashtra</option>
        <option value="DL">Delhi</option>
        <option value="KA">Karnataka</option>
      </select>

      <button 
        style={resetBtnStyle} 
        onClick={() => onChange({})}
        onMouseOver={(e) => e.target.style.background = "#fee2e2"}
        onMouseOut={(e) => e.target.style.background = "#fecaca"}
      >
        Reset Filters
      </button>
    </div>
  );
}