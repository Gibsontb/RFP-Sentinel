
import React, { useEffect, useState } from 'react';

export default function ProposalArchive() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/archive/proposals")
      .then(res => res.json())
      .then(data => setProposals(data));
  }, []);

  return (
    <div>
      <h2>📦 Archived Proposals</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>RFP ID</th>
            <th>Title</th>
            <th>Agency</th>
            <th>Submitted</th>
            <th>Status</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {proposals.map((p, i) => (
            <tr key={i}>
              <td>{p.rfp_id}</td>
              <td>{p.title}</td>
              <td>{p.agency}</td>
              <td>{p.submitted}</td>
              <td>{p.status}</td>
              <td><a href={`/${p.file_path}`} target="_blank" rel="noreferrer">Download</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
