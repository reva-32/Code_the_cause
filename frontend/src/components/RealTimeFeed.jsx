import React, { useEffect, useState } from "react";

export default function RealtimeFeed() {
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem("activity_logs")) || [];
    setFeed(logs.slice(0, 100));
  }, []);

  return (
    <div className="realtime-feed">
      <h4>Activity Feed</h4>
      <ul>
        {feed.length === 0 && <li>No recent activity</li>}
        {feed.map((f, i) => (
          <li key={i}>{f.message}</li>
        ))}
      </ul>
    </div>
  );
}
