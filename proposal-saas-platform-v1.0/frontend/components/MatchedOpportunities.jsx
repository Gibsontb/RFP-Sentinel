
import React, { useEffect, useState } from 'react';

export default function MatchedOpportunities() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetch('/modules/03_Capture_Strategy_Repository/matched_opportunities.json')
      .then(res => res.json())
      .then(data => setMatches(data));
  }, []);

  return (
    <div>
      <h2>🔍 Matched Contract Opportunities</h2>
      <table border="1" cellPadding="8" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Match %</th>
            <th>Title</th>
            <th>Agency</th>
            <th>NAICS</th>
            <th>PSC</th>
            <th>Source</th>
            <th>Summary</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          {matches.sort((a, b) => b.match_score - a.match_score).map((m, i) => (
            <tr key={i}>
              <td><strong>{m.match_score}%</strong></td>
              <td>{m.title}</td>
              <td>{m.agency}</td>
              <td>{m.naics}</td>
              <td>{m.psc}</td>
              <td>{m.source}</td>
              <td>{m.summary}</td>
              <td><a href={m.url} target="_blank" rel="noreferrer">View</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
