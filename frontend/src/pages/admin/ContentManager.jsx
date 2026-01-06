import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

export default function ContentManager() {
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    setContents(JSON.parse(localStorage.getItem("contents")) || []);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newItem = {
      id: Date.now(),
      title,
      processed: false,
      target_disabilities: [],
      created_at: Date.now()
    };

    const updated = [...contents, newItem];
    localStorage.setItem("contents", JSON.stringify(updated));
    setTitle("");
    load();
  };

  return (
    <div className="page">
      <h2>Content Manager</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button>Add</button>
      </form>

      <table className="table">
        <tbody>
          {contents.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td>{c.processed ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
