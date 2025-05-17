
import React, { useEffect, useState } from 'react';

export default function AIResultsViewer() {
  const [matches, setMatches] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:8000/ai/matches', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMatches(data.matches));
  }, []);

  return (
    <div>
      <h2>🧠 AI-Matched Opportunities</h2>
      <ul>
        {matches.map((m, i) => (
          <li key={i}>
            <strong>{m.title}</strong><br />
            Agency: {m.agency}<br />
            NAICS: {m.naics} | PSC: {m.psc}<br />
            Keywords: {m.keywords.join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
